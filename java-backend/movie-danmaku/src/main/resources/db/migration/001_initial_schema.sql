-- 影视数据平台 - 数据库初始化脚本
-- 版本: 1.0.0
-- 日期: 2026-06-12

-- ===========================================
-- 影视剧表
-- ===========================================
CREATE TABLE IF NOT EXISTS series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    original_title TEXT,
    description TEXT,
    cover_url TEXT,
    backdrop_url TEXT,
    series_type TEXT NOT NULL DEFAULT 'tv_series',  -- movie/tv_series/anime/variety/documentary
    genres TEXT,  -- JSON array: ["科幻","剧情"]
    country TEXT,
    language TEXT,
    release_date TEXT,
    year INTEGER,
    status TEXT NOT NULL DEFAULT 'airing',  -- airing/completed/upcoming
    rating REAL,
    rating_count INTEGER DEFAULT 0,
    popularity REAL DEFAULT 0,
    tags TEXT,  -- JSON array
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ===========================================
-- 剧集表
-- ===========================================
CREATE TABLE IF NOT EXISTS episodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER NOT NULL,
    season_number INTEGER NOT NULL DEFAULT 1,
    episode_number INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    cover_url TEXT,
    duration INTEGER,  -- 时长（秒）
    air_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    UNIQUE(series_id, season_number, episode_number)
);

-- ===========================================
-- 演职人员表
-- ===========================================
CREATE TABLE IF NOT EXISTS persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    original_name TEXT,
    avatar_url TEXT,
    biography TEXT,
    birthday TEXT,
    place_of_birth TEXT
);

-- ===========================================
-- 影视剧-人员关联表
-- ===========================================
CREATE TABLE IF NOT EXISTS series_cast (
    series_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    role TEXT,
    cast_type TEXT NOT NULL,  -- actor/director/screenwriter/producer
    "order" INTEGER DEFAULT 0,
    PRIMARY KEY (series_id, person_id, cast_type),
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
);

-- ===========================================
-- 平台表
-- ===========================================
CREATE TABLE IF NOT EXISTS platforms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,  -- bilibili/tencent/iqiyi/youku
    base_url TEXT,
    icon_url TEXT
);

-- ===========================================
-- 影视剧-平台关联表
-- ===========================================
CREATE TABLE IF NOT EXISTS series_platforms (
    series_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    platform_series_id TEXT NOT NULL,  -- 平台上的影视剧ID
    platform_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT 1,
    PRIMARY KEY (series_id, platform_id),
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- ===========================================
-- 弹幕表
-- ===========================================
CREATE TABLE IF NOT EXISTS danmakus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    time REAL NOT NULL,             -- 统一后的时间（秒）
    source_time REAL,               -- 原始时间（秒）
    content TEXT NOT NULL,
    danmaku_type TEXT NOT NULL DEFAULT 'scroll',  -- scroll/top/bottom/ltr
    color TEXT NOT NULL DEFAULT '#ffffff',
    font_size INTEGER DEFAULT 25,
    source TEXT NOT NULL,           -- bilibili/tencent/user
    source_id TEXT,                 -- 第三方平台弹幕ID
    user_id TEXT,                   -- 本地用户ID
    user_hash TEXT,                 -- 第三方用户哈希
    ip_address TEXT,
    is_local BOOLEAN NOT NULL DEFAULT 0,
    is_merged BOOLEAN NOT NULL DEFAULT 0,
    merge_group TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
);

-- ===========================================
-- 弹幕导入记录表
-- ===========================================
CREATE TABLE IF NOT EXISTS import_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    platform_id TEXT NOT NULL,
    imported_count INTEGER NOT NULL DEFAULT 0,
    duplicate_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending/completed/failed
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
);

-- ===========================================
-- 平台时间偏移表
-- ===========================================
CREATE TABLE IF NOT EXISTS platform_time_offsets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    offset_seconds REAL NOT NULL DEFAULT 0.0,
    offset_type TEXT NOT NULL DEFAULT 'manual',  -- manual/auto/verified
    confidence REAL DEFAULT 1.0,
    matched_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    UNIQUE(episode_id, platform)
);

-- ===========================================
-- 弹幕匹配记录表
-- ===========================================
CREATE TABLE IF NOT EXISTS danmaku_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    danmaku_id_1 INTEGER NOT NULL,
    danmaku_id_2 INTEGER NOT NULL,
    similarity REAL NOT NULL,
    match_type TEXT NOT NULL,  -- exact/similar/time_sync
    time_diff REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (danmaku_id_1) REFERENCES danmakus(id) ON DELETE CASCADE,
    FOREIGN KEY (danmaku_id_2) REFERENCES danmakus(id) ON DELETE CASCADE,
    UNIQUE(danmaku_id_1, danmaku_id_2)
);

-- ===========================================
-- 弹幕合并记录表
-- ===========================================
CREATE TABLE IF NOT EXISTS merge_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    sources TEXT NOT NULL,          -- JSON array
    total_before INTEGER NOT NULL,
    total_after INTEGER NOT NULL,
    duplicates_removed INTEGER NOT NULL DEFAULT 0,
    merge_options TEXT,             -- JSON
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
);

-- ===========================================
-- 图片表
-- ===========================================
CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER,
    episode_id INTEGER,
    person_id INTEGER,
    image_type TEXT NOT NULL,  -- cover/poster/backdrop/still/avatar
    url TEXT NOT NULL,
    local_path TEXT,
    width INTEGER,
    height INTEGER,
    size INTEGER,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
);

-- ===========================================
-- 用户表
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login TEXT
);

-- ===========================================
-- 用户片单表
-- ===========================================
CREATE TABLE IF NOT EXISTS user_watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    series_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'watching',  -- watching/completed/planned/dropped
    progress INTEGER DEFAULT 0,  -- 看到第几集
    rating REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    UNIQUE(user_id, series_id)
);

-- ===========================================
-- 索引
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_series_title ON series(title);
CREATE INDEX IF NOT EXISTS idx_series_type ON series(series_type);
CREATE INDEX IF NOT EXISTS idx_series_year ON series(year);
CREATE INDEX IF NOT EXISTS idx_series_rating ON series(rating);
CREATE INDEX IF NOT EXISTS idx_series_popularity ON series(popularity);

CREATE INDEX IF NOT EXISTS idx_episodes_series_id ON episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(series_id, season_number);

CREATE INDEX IF NOT EXISTS idx_danmakus_episode_id ON danmakus(episode_id);
CREATE INDEX IF NOT EXISTS idx_danmakus_time ON danmakus(time);
CREATE INDEX IF NOT EXISTS idx_danmakus_source ON danmakus(source);
CREATE INDEX IF NOT EXISTS idx_danmakus_merge_group ON danmakus(merge_group);
CREATE INDEX IF NOT EXISTS idx_danmakus_is_merged ON danmakus(is_merged);

CREATE INDEX IF NOT EXISTS idx_series_platforms_series ON series_platforms(series_id);
CREATE INDEX IF NOT EXISTS idx_series_platforms_platform ON series_platforms(platform_id);

CREATE INDEX IF NOT EXISTS idx_images_series ON images(series_id);
CREATE INDEX IF NOT EXISTS idx_images_episode ON images(episode_id);
CREATE INDEX IF NOT EXISTS idx_images_person ON images(person_id);

CREATE INDEX IF NOT EXISTS idx_time_offsets_episode ON platform_time_offsets(episode_id);
CREATE INDEX IF NOT EXISTS idx_time_offsets_platform ON platform_time_offsets(platform);

CREATE INDEX IF NOT EXISTS idx_danmaku_matches_1 ON danmaku_matches(danmaku_id_1);
CREATE INDEX IF NOT EXISTS idx_danmaku_matches_2 ON danmaku_matches(danmaku_id_2);

CREATE INDEX IF NOT EXISTS idx_merge_logs_episode ON merge_logs(episode_id);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON user_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_series ON user_watchlist(series_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON user_watchlist(status);

-- ===========================================
-- 初始数据
-- ===========================================
INSERT OR IGNORE INTO platforms (name, code, base_url) VALUES
    ('哔哩哔哩', 'bilibili', 'https://www.bilibili.com'),
    ('腾讯视频', 'tencent', 'https://v.qq.com'),
    ('爱奇艺', 'iqiyi', 'https://www.iqiyi.com'),
    ('优酷', 'youku', 'https://www.youku.com');
