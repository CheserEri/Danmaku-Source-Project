use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{Duration, Instant};

/// Rate limiter for API requests
/// Based on danmaku-anywhere's throttle pattern (200ms between requests)
pub struct Throttle {
    last_request: Arc<Mutex<Instant>>,
    interval: Duration,
}

impl Throttle {
    /// Create a new throttle with minimum interval in milliseconds
    pub fn new(interval_ms: u64) -> Self {
        Self {
            last_request: Arc::new(Mutex::new(Instant::now() - Duration::from_millis(interval_ms))),
            interval: Duration::from_millis(interval_ms),
        }
    }

    /// Wait until enough time has passed since last request
    pub async fn wait(&self) {
        let mut last = self.last_request.lock().await;
        let now = Instant::now();
        let elapsed = now.duration_since(*last);

        if elapsed < self.interval {
            let wait_time = self.interval - elapsed;
            tokio::time::sleep(wait_time).await;
        }

        *last = Instant::now();
    }

    /// Execute a future with rate limiting
    pub async fn throttle<F, T>(&self, f: F) -> T
    where
        F: std::future::Future<Output = T>,
    {
        self.wait().await;
        f.await
    }
}

impl Clone for Throttle {
    fn clone(&self) -> Self {
        Self {
            last_request: Arc::clone(&self.last_request),
            interval: self.interval,
        }
    }
}

/// Default throttle for Bilibili API (200ms between requests)
pub fn bilibili_throttle() -> Throttle {
    Throttle::new(200)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_throttle_rate_limiting() {
        let throttle = Throttle::new(100);
        let start = Instant::now();

        throttle.wait().await;
        throttle.wait().await;
        throttle.wait().await;

        let elapsed = start.elapsed();
        assert!(elapsed >= Duration::from_millis(200));
    }

    #[tokio::test]
    async fn test_throttle_clone() {
        let throttle = bilibili_throttle();
        let cloned = throttle.clone();

        throttle.wait().await;
        cloned.wait().await;
    }
}
