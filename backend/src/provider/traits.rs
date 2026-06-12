use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use crate::models::Danmaku;
use crate::result::DanmakuResult;

/// Provider configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderConfig {
    /// Provider name (e.g., "bilibili", "tencent")
    pub name: String,
    /// Whether the provider is enabled
    pub enabled: bool,
    /// Rate limit in milliseconds between requests
    pub rate_limit_ms: u64,
    /// Custom API base URL (optional)
    pub api_base_url: Option<String>,
}

impl Default for ProviderConfig {
    fn default() -> Self {
        Self {
            name: "unknown".to_string(),
            enabled: true,
            rate_limit_ms: 200,
            api_base_url: None,
        }
    }
}

/// Result type for provider operations
pub type ProviderResult<T> = DanmakuResult<T>;

/// Trait for danmaku providers
/// Each provider implements this trait to support a specific danmaku source
#[async_trait]
pub trait DanmakuProvider: Send + Sync {
    /// Get the provider name
    fn name(&self) -> &str;

    /// Get the provider configuration
    fn config(&self) -> &ProviderConfig;

    /// Check if the provider supports a given video ID format
    fn supports_video_id(&self, video_id: &str) -> bool;

    /// Parse a video ID from input (URL, BV number, etc.)
    fn parse_video_id(&self, input: &str) -> ProviderResult<String>;

    /// Get the cid (comment ID) for a video
    async fn get_video_cid(&self, video_id: &str) -> ProviderResult<String>;

    /// Fetch danmaku for a video by cid
    async fn fetch_danmaku(&self, cid: &str) -> ProviderResult<Vec<Danmaku>>;

    /// Fetch danmaku for a video by video ID (convenience method)
    async fn fetch_danmaku_by_video_id(&self, video_id: &str) -> ProviderResult<Vec<Danmaku>> {
        let cid = self.get_video_cid(video_id).await?;
        self.fetch_danmaku(&cid).await
    }
}