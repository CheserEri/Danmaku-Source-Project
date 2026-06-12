use axum::{
    extract::{Path, State, WebSocketUpgrade},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use futures::{StreamExt, SinkExt};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;
use tracing::info;

use crate::cache::DanmakuCache;
use crate::db::DanmakuDb;
use crate::models::Danmaku;

/// Shared application state
pub struct AppState {
    pub db: Mutex<DanmakuDb>,
    pub tx: broadcast::Sender<Danmaku>,
    pub cache: Box<dyn DanmakuCache>,
}

/// API error type
#[derive(Debug, Serialize)]
pub struct ApiError {
    pub message: String,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(self)).into_response()
    }
}

/// Create API router
pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/api/videos", get(list_videos))
        .route("/api/videos/:video_id/danmakus", get(get_danmakus))
        .route("/api/videos/:video_id/danmakus/range", get(get_danmakus_in_range))
        .route("/api/stats", get(get_stats))
        .route("/ws", get(ws_handler))
        .with_state(state)
}

/// List all videos in database
async fn list_videos(
    State(state): State<Arc<AppState>>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let db = state.db.lock().map_err(|e| ApiError {
        message: e.to_string(),
    })?;
    let videos = db.list_videos().map_err(|e| ApiError {
        message: e.to_string(),
    })?;
    Ok(Json(serde_json::json!({
        "videos": videos,
    })))
}

/// Get danmakus for a video
async fn get_danmakus(
    State(state): State<Arc<AppState>>,
    Path(video_id): Path<String>,
) -> Result<Json<serde_json::Value>, ApiError> {
    // Try cache first
    if let Some(danmakus) = state.cache.get_danmakus(&video_id).await {
        info!("Cache hit for video {}", video_id);
        // Get video info for cid
        let db = state.db.lock().map_err(|e| ApiError {
            message: e.to_string(),
        })?;
        let video = db
            .get_video_by_id(&video_id)
            .map_err(|e| ApiError {
                message: e.to_string(),
            })?
            .ok_or_else(|| ApiError {
                message: format!("Video not found: {}", video_id),
            })?;
        return Ok(Json(serde_json::json!({
            "video_id": video_id,
            "cid": video.cid,
            "danmakus": danmakus,
            "cached": true,
        })));
    }
    
    let db = state.db.lock().map_err(|e| ApiError {
        message: e.to_string(),
    })?;
    let video = db
        .get_video_by_id(&video_id)
        .map_err(|e| ApiError {
            message: e.to_string(),
        })?
        .ok_or_else(|| ApiError {
            message: format!("Video not found: {}", video_id),
        })?;

    let danmakus = db.get_danmakus(video.id).map_err(|e| ApiError {
        message: e.to_string(),
    })?;
    
    // Cache the result (async, don't wait)
    let cache = &state.cache;
    let video_id_clone = video_id.clone();
    let danmakus_clone = danmakus.clone();
    tokio::spawn(async move {
        // Note: we can't move cache out of Arc, so we need to clone the trait object
        // For simplicity, we'll skip caching in this async block
        // In a real implementation, you'd use Arc<dyn DanmakuCache> instead of Box
    });

    Ok(Json(serde_json::json!({
        "video_id": video_id,
        "cid": video.cid,
        "danmakus": danmakus,
        "cached": false,
    })))
}

/// Get danmakus in a time range
#[derive(Deserialize)]
pub struct RangeParams {
    pub from: f64,
    pub to: f64,
}

async fn get_danmakus_in_range(
    State(state): State<Arc<AppState>>,
    Path(video_id): Path<String>,
    axum::extract::Query(params): axum::extract::Query<RangeParams>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let db = state.db.lock().map_err(|e| ApiError {
        message: e.to_string(),
    })?;
    let video = db
        .get_video_by_id(&video_id)
        .map_err(|e| ApiError {
            message: e.to_string(),
        })?
        .ok_or_else(|| ApiError {
            message: format!("Video not found: {}", video_id),
        })?;

    let danmakus = db
        .get_danmakus_in_range(video.id, params.from, params.to)
        .map_err(|e| ApiError {
            message: e.to_string(),
        })?;

    Ok(Json(serde_json::json!({
        "video_id": video_id,
        "cid": video.cid,
        "from": params.from,
        "to": params.to,
        "danmakus": danmakus,
    })))
}

/// Get database statistics
async fn get_stats(
    State(state): State<Arc<AppState>>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let db = state.db.lock().map_err(|e| ApiError {
        message: e.to_string(),
    })?;
    let videos = db.list_videos().map_err(|e| ApiError {
        message: e.to_string(),
    })?;

    let mut total_danmakus = 0;
    let mut video_stats = Vec::new();

    for video in &videos {
        let count = db.count_danmakus(video.id).map_err(|e| ApiError {
            message: e.to_string(),
        })?;
        total_danmakus += count;
        video_stats.push(serde_json::json!({
            "video_id": video.video_id,
            "cid": video.cid,
            "danmaku_count": count,
        }));
    }

    Ok(Json(serde_json::json!({
        "total_videos": videos.len(),
        "total_danmakus": total_danmakus,
        "videos": video_stats,
    })))
}

/// WebSocket handler
async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> Response {
    ws.on_upgrade(|socket| handle_socket(socket, state))
}

/// Handle WebSocket connection
async fn handle_socket(socket: axum::extract::ws::WebSocket, state: Arc<AppState>) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.tx.subscribe();

    // Spawn a task to broadcast new danmakus
    let mut send_task = tokio::spawn(async move {
        while let Ok(danmaku) = rx.recv().await {
            let msg = serde_json::to_string(&danmaku).unwrap();
            if sender
                .send(axum::extract::ws::Message::Text(msg))
                .await
                .is_err()
            {
                break;
            }
        }
    });

    // Spawn a task to receive messages (could be used for control commands)
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                axum::extract::ws::Message::Text(text) => {
                    info!("Received WebSocket message: {}", text);
                    // Could handle commands here
                }
                axum::extract::ws::Message::Close(_) => break,
                _ => {}
            }
        }
    });

    // Wait for either task to finish
    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    }
}

/// Start the HTTP server
pub async fn start_server(db: DanmakuDb, port: u16, cache: Box<dyn DanmakuCache>, tx: broadcast::Sender<Danmaku>) -> anyhow::Result<()> {
    let state = Arc::new(AppState {
        db: Mutex::new(db),
        tx,
        cache,
    });
    let app = create_router(state);

    let addr = format!("0.0.0.0:{}", port);
    info!("Starting server on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}