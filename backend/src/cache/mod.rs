use redis::{AsyncCommands, Client, RedisResult};
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{info, warn};

use crate::models::Danmaku;

/// Cache trait for danmaku caching
#[async_trait::async_trait]
pub trait DanmakuCache: Send + Sync {
    /// Get cached danmakus for a video
    async fn get_danmakus(&self, video_id: &str) -> Option<Vec<Danmaku>>;
    
    /// Set danmakus cache for a video
    async fn set_danmakus(&self, video_id: &str, danmakus: &[Danmaku], ttl_seconds: u64);
    
    /// Clear cache for a video
    async fn clear_danmakus(&self, video_id: &str);
}

/// Redis cache implementation
pub struct RedisCache {
    client: Client,
    conn: Arc<Mutex<Option<redis::aio::MultiplexedConnection>>>,
}

impl RedisCache {
    /// Create a new Redis cache
    pub async fn new(redis_url: &str) -> RedisResult<Self> {
        let client = Client::open(redis_url)?;
        let conn = client.get_multiplexed_async_connection().await?;
        info!("Connected to Redis at {}", redis_url);
        Ok(Self {
            client,
            conn: Arc::new(Mutex::new(Some(conn))),
        })
    }
    
    /// Get or reconnect connection
    async fn get_conn(&self) -> Option<redis::aio::MultiplexedConnection> {
        let mut conn_guard = self.conn.lock().await;
        if let Some(conn) = conn_guard.take() {
            // Test connection with PING
            let mut conn = conn;
            match redis::cmd("PING").query_async::<_, String>(&mut conn).await {
                Ok(_) => Some(conn),
                Err(e) => {
                    warn!("Redis connection lost, reconnecting: {}", e);
                    match self.client.get_multiplexed_async_connection().await {
                        Ok(new_conn) => Some(new_conn),
                        Err(e) => {
                            warn!("Failed to reconnect to Redis: {}", e);
                            None
                        }
                    }
                }
            }
        } else {
            match self.client.get_multiplexed_async_connection().await {
                Ok(conn) => Some(conn),
                Err(e) => {
                    warn!("Failed to connect to Redis: {}", e);
                    None
                }
            }
        }
    }
}

#[async_trait::async_trait]
impl DanmakuCache for RedisCache {
    async fn get_danmakus(&self, video_id: &str) -> Option<Vec<Danmaku>> {
        let mut conn = self.get_conn().await?;
        let key = format!("danmakus:{}", video_id);
        
        match conn.get::<_, Option<String>>(&key).await {
            Ok(Some(json)) => {
                match serde_json::from_str::<Vec<Danmaku>>(&json) {
                    Ok(danmakus) => Some(danmakus),
                    Err(e) => {
                        warn!("Failed to deserialize cached danmakus: {}", e);
                        None
                    }
                }
            }
            Ok(None) => None,
            Err(e) => {
                warn!("Redis GET error: {}", e);
                None
            }
        }
    }
    
    async fn set_danmakus(&self, video_id: &str, danmakus: &[Danmaku], ttl_seconds: u64) {
        if let Some(mut conn) = self.get_conn().await {
            let key = format!("danmakus:{}", video_id);
            match serde_json::to_string(danmakus) {
                Ok(json) => {
                    if let Err(e) = conn.set_ex::<_, _, ()>(&key, json, ttl_seconds).await {
                        warn!("Redis SET error: {}", e);
                    }
                }
                Err(e) => warn!("Failed to serialize danmakus: {}", e),
            }
        }
    }
    
    async fn clear_danmakus(&self, video_id: &str) {
        if let Some(mut conn) = self.get_conn().await {
            let key = format!("danmakus:{}", video_id);
            if let Err(e) = conn.del::<_, ()>(&key).await {
                warn!("Redis DEL error: {}", e);
            }
        }
    }
}

/// No-op cache (fallback when Redis is unavailable)
pub struct NoCache;

#[async_trait::async_trait]
impl DanmakuCache for NoCache {
    async fn get_danmakus(&self, _video_id: &str) -> Option<Vec<Danmaku>> {
        None
    }
    
    async fn set_danmakus(&self, _video_id: &str, _danmakus: &[Danmaku], _ttl_seconds: u64) {
        // Do nothing
    }
    
    async fn clear_danmakus(&self, _video_id: &str) {
        // Do nothing
    }
}

/// Create cache instance (Redis if available, otherwise NoCache)
pub async fn create_cache(redis_url: Option<&str>) -> Box<dyn DanmakuCache> {
    match redis_url {
        Some(url) => {
            match RedisCache::new(url).await {
                Ok(cache) => {
                    info!("Using Redis cache");
                    Box::new(cache)
                }
                Err(e) => {
                    warn!("Failed to connect to Redis: {}, using no-op cache", e);
                    Box::new(NoCache)
                }
            }
        }
        None => {
            info!("No Redis URL provided, using no-op cache");
            Box::new(NoCache)
        }
    }
}