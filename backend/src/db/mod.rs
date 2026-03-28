use std::path::Path;

use rusqlite::{params, Connection, Result as SqliteResult};
use serde::Serialize;
use sha2::{Digest, Sha256};
use tracing::info;

use crate::models::Danmaku;

/// Database manager for danmaku storage
pub struct DanmakuDb {
    conn: Connection,
}

/// Video metadata
#[derive(Debug, Clone, Serialize)]
pub struct VideoInfo {
    pub id: i64,
    pub video_id: String,
    pub cid: String,
    pub title: Option<String>,
    pub source: String,
    pub created_at: String,
}

impl DanmakuDb {
    /// Create or open a database at the given path
    pub fn new<P: AsRef<Path>>(db_path: P) -> SqliteResult<Self> {
        let conn = Connection::open(db_path)?;
        let db = Self { conn };
        db.init_tables()?;
        Ok(db)
    }

    /// Create an in-memory database (for testing)
    pub fn memory() -> SqliteResult<Self> {
        let conn = Connection::open_in_memory()?;
        let db = Self { conn };
        db.init_tables()?;
        Ok(db)
    }

    /// Initialize database tables
    fn init_tables(&self) -> SqliteResult<()> {
        self.conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id TEXT NOT NULL,
                cid TEXT NOT NULL,
                title TEXT,
                source TEXT NOT NULL DEFAULT 'bilibili',
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                UNIQUE(video_id, cid)
            );

            CREATE TABLE IF NOT EXISTS danmakus (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                video_id INTEGER NOT NULL,
                time REAL NOT NULL,
                content TEXT NOT NULL,
                danmaku_type TEXT NOT NULL DEFAULT 'scroll',
                color TEXT NOT NULL DEFAULT '#ffffff',
                source TEXT NOT NULL DEFAULT 'bilibili',
                content_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (video_id) REFERENCES videos(id),
                UNIQUE(video_id, content_hash, time)
            );

            CREATE INDEX IF NOT EXISTS idx_danmakus_video_id ON danmakus(video_id);
            CREATE INDEX IF NOT EXISTS idx_danmakus_time ON danmakus(time);
            CREATE INDEX IF NOT EXISTS idx_danmakus_hash ON danmakus(content_hash);
            CREATE INDEX IF NOT EXISTS idx_videos_video_id ON videos(video_id);
            CREATE INDEX IF NOT EXISTS idx_videos_cid ON videos(cid);",
        )?;
        info!("Database tables initialized");
        Ok(())
    }

    /// Insert or get video info
    pub fn upsert_video(
        &self,
        video_id: &str,
        cid: &str,
        title: Option<&str>,
        source: &str,
    ) -> SqliteResult<i64> {
        self.conn.execute(
            "INSERT OR IGNORE INTO videos (video_id, cid, title, source) VALUES (?1, ?2, ?3, ?4)",
            params![video_id, cid, title, source],
        )?;

        let id: i64 = self.conn.query_row(
            "SELECT id FROM videos WHERE video_id = ?1 AND cid = ?2",
            params![video_id, cid],
            |row| row.get(0),
        )?;

        Ok(id)
    }

    /// Get video by video_id
    pub fn get_video_by_id(&self, video_id: &str) -> SqliteResult<Option<VideoInfo>> {
        let result = self.conn.query_row(
            "SELECT id, video_id, cid, title, source, created_at FROM videos WHERE video_id = ?1",
            params![video_id],
            |row| {
                Ok(VideoInfo {
                    id: row.get(0)?,
                    video_id: row.get(1)?,
                    cid: row.get(2)?,
                    title: row.get(3)?,
                    source: row.get(4)?,
                    created_at: row.get(5)?,
                })
            },
        );

        match result {
            Ok(info) => Ok(Some(info)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    /// Get video by cid
    pub fn get_video_by_cid(&self, cid: &str) -> SqliteResult<Option<VideoInfo>> {
        let result = self.conn.query_row(
            "SELECT id, video_id, cid, title, source, created_at FROM videos WHERE cid = ?1",
            params![cid],
            |row| {
                Ok(VideoInfo {
                    id: row.get(0)?,
                    video_id: row.get(1)?,
                    cid: row.get(2)?,
                    title: row.get(3)?,
                    source: row.get(4)?,
                    created_at: row.get(5)?,
                })
            },
        );

        match result {
            Ok(info) => Ok(Some(info)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    /// Compute content hash for deduplication
    pub fn compute_hash(content: &str, time: f64, source: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(content.as_bytes());
        hasher.update(time.to_be_bytes());
        hasher.update(source.as_bytes());
        hex::encode(hasher.finalize())
    }

    /// Insert a single danmaku with deduplication
    pub fn insert_danmaku(&self, video_db_id: i64, danmaku: &Danmaku) -> SqliteResult<bool> {
        let hash = Self::compute_hash(&danmaku.content, danmaku.time, &danmaku.source);

        let result = self.conn.execute(
            "INSERT OR IGNORE INTO danmakus (video_id, time, content, danmaku_type, color, source, content_hash)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                video_db_id,
                danmaku.time,
                danmaku.content,
                danmaku.danmaku_type,
                danmaku.color,
                danmaku.source,
                hash
            ],
        )?;

        Ok(result > 0)
    }

    /// Insert multiple danmakus with deduplication
    pub fn insert_danmakus(
        &self,
        video_db_id: i64,
        danmakus: &[Danmaku],
    ) -> SqliteResult<(usize, usize)> {
        let mut inserted = 0;
        let mut duplicates = 0;

        for danmaku in danmakus {
            if self.insert_danmaku(video_db_id, danmaku)? {
                inserted += 1;
            } else {
                duplicates += 1;
            }
        }

        Ok((inserted, duplicates))
    }

    /// Get danmakus for a video, sorted by time
    pub fn get_danmakus(&self, video_db_id: i64) -> SqliteResult<Vec<Danmaku>> {
        let mut stmt = self.conn.prepare(
            "SELECT time, content, danmaku_type, color, source FROM danmakus
             WHERE video_id = ?1 ORDER BY time ASC",
        )?;

        let danmakus = stmt
            .query_map(params![video_db_id], |row| {
                Ok(Danmaku {
                    time: row.get(0)?,
                    content: row.get(1)?,
                    danmaku_type: row.get(2)?,
                    color: row.get(3)?,
                    source: row.get(4)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(danmakus)
    }

    /// Get danmakus within a time range
    pub fn get_danmakus_in_range(
        &self,
        video_db_id: i64,
        start_time: f64,
        end_time: f64,
    ) -> SqliteResult<Vec<Danmaku>> {
        let mut stmt = self.conn.prepare(
            "SELECT time, content, danmaku_type, color, source FROM danmakus
             WHERE video_id = ?1 AND time >= ?2 AND time <= ?3 ORDER BY time ASC",
        )?;

        let danmakus = stmt
            .query_map(params![video_db_id, start_time, end_time], |row| {
                Ok(Danmaku {
                    time: row.get(0)?,
                    content: row.get(1)?,
                    danmaku_type: row.get(2)?,
                    color: row.get(3)?,
                    source: row.get(4)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(danmakus)
    }

    /// Count danmakus for a video
    pub fn count_danmakus(&self, video_db_id: i64) -> SqliteResult<i64> {
        let count: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM danmakus WHERE video_id = ?1",
            params![video_db_id],
            |row| row.get(0),
        )?;
        Ok(count)
    }

    /// List all videos
    pub fn list_videos(&self) -> SqliteResult<Vec<VideoInfo>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, video_id, cid, title, source, created_at FROM videos ORDER BY created_at DESC",
        )?;

        let videos = stmt
            .query_map([], |row| {
                Ok(VideoInfo {
                    id: row.get(0)?,
                    video_id: row.get(1)?,
                    cid: row.get(2)?,
                    title: row.get(3)?,
                    source: row.get(4)?,
                    created_at: row.get(5)?,
                })
            })?
            .collect::<Result<Vec<_>, _>>()?;

        Ok(videos)
    }

    /// Delete danmakus for a video
    pub fn delete_danmakus(&self, video_db_id: i64) -> SqliteResult<usize> {
        let count = self.conn.execute(
            "DELETE FROM danmakus WHERE video_id = ?1",
            params![video_db_id],
        )?;
        Ok(count)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_danmaku(time: f64, content: &str) -> Danmaku {
        Danmaku {
            time,
            content: content.to_string(),
            danmaku_type: "scroll".to_string(),
            color: "#ffffff".to_string(),
            source: "bilibili".to_string(),
        }
    }

    #[test]
    fn test_db_init() {
        let db = DanmakuDb::memory().unwrap();
        assert!(db.init_tables().is_ok());
    }

    #[test]
    fn test_upsert_video() {
        let db = DanmakuDb::memory().unwrap();
        let id = db
            .upsert_video("BV1xx", "12345", Some("Test"), "bilibili")
            .unwrap();
        assert!(id > 0);

        let id2 = db
            .upsert_video("BV1xx", "12345", Some("Test"), "bilibili")
            .unwrap();
        assert_eq!(id, id2);
    }

    #[test]
    fn test_get_video() {
        let db = DanmakuDb::memory().unwrap();
        db.upsert_video("BV1xx", "12345", Some("Test"), "bilibili")
            .unwrap();

        let video = db.get_video_by_id("BV1xx").unwrap().unwrap();
        assert_eq!(video.video_id, "BV1xx");
        assert_eq!(video.cid, "12345");
    }

    #[test]
    fn test_insert_and_get_danmakus() {
        let db = DanmakuDb::memory().unwrap();
        let video_id = db.upsert_video("BV1xx", "12345", None, "bilibili").unwrap();

        let danmakus = vec![
            create_test_danmaku(10.0, "first"),
            create_test_danmaku(20.0, "second"),
            create_test_danmaku(15.0, "third"),
        ];

        let (inserted, dupes) = db.insert_danmakus(video_id, &danmakus).unwrap();
        assert_eq!(inserted, 3);
        assert_eq!(dupes, 0);

        let retrieved = db.get_danmakus(video_id).unwrap();
        assert_eq!(retrieved.len(), 3);
        assert_eq!(retrieved[0].content, "first");
        assert_eq!(retrieved[1].content, "third");
        assert_eq!(retrieved[2].content, "second");
    }

    #[test]
    fn test_deduplication() {
        let db = DanmakuDb::memory().unwrap();
        let video_id = db.upsert_video("BV1xx", "12345", None, "bilibili").unwrap();

        let danmaku = create_test_danmaku(10.0, "hello");
        let (inserted1, _) = db.insert_danmakus(video_id, &[danmaku.clone()]).unwrap();
        let (inserted2, dupes) = db.insert_danmakus(video_id, &[danmaku]).unwrap();

        assert_eq!(inserted1, 1);
        assert_eq!(inserted2, 0);
        assert_eq!(dupes, 1);
    }

    #[test]
    fn test_time_range_query() {
        let db = DanmakuDb::memory().unwrap();
        let video_id = db.upsert_video("BV1xx", "12345", None, "bilibili").unwrap();

        let danmakus = vec![
            create_test_danmaku(5.0, "early"),
            create_test_danmaku(15.0, "middle"),
            create_test_danmaku(25.0, "late"),
        ];

        db.insert_danmakus(video_id, &danmakus).unwrap();

        let range = db.get_danmakus_in_range(video_id, 10.0, 20.0).unwrap();
        assert_eq!(range.len(), 1);
        assert_eq!(range[0].content, "middle");
    }

    #[test]
    fn test_hash_computation() {
        let hash1 = DanmakuDb::compute_hash("hello", 10.0, "bilibili");
        let hash2 = DanmakuDb::compute_hash("hello", 10.0, "bilibili");
        let hash3 = DanmakuDb::compute_hash("hello", 11.0, "bilibili");

        assert_eq!(hash1, hash2);
        assert_ne!(hash1, hash3);
    }

    #[test]
    fn test_count_danmakus() {
        let db = DanmakuDb::memory().unwrap();
        let video_id = db.upsert_video("BV1xx", "12345", None, "bilibili").unwrap();

        let danmakus = vec![
            create_test_danmaku(10.0, "a"),
            create_test_danmaku(20.0, "b"),
        ];

        db.insert_danmakus(video_id, &danmakus).unwrap();
        assert_eq!(db.count_danmakus(video_id).unwrap(), 2);
    }

    #[test]
    fn test_list_videos() {
        let db = DanmakuDb::memory().unwrap();
        db.upsert_video("BV1xx", "11111", None, "bilibili").unwrap();
        db.upsert_video("BV2yy", "22222", None, "bilibili").unwrap();

        let videos = db.list_videos().unwrap();
        assert_eq!(videos.len(), 2);
    }

    #[test]
    fn test_delete_danmakus() {
        let db = DanmakuDb::memory().unwrap();
        let video_id = db.upsert_video("BV1xx", "12345", None, "bilibili").unwrap();

        let danmakus = vec![
            create_test_danmaku(10.0, "a"),
            create_test_danmaku(20.0, "b"),
        ];

        db.insert_danmakus(video_id, &danmakus).unwrap();
        let deleted = db.delete_danmakus(video_id).unwrap();
        assert_eq!(deleted, 2);
        assert_eq!(db.count_danmakus(video_id).unwrap(), 0);
    }
}
