# 影视数据平台 - 设计文档

## 📌 项目转型概述

从"弹幕数据服务"转型为"影视数据平台"，整合影视剧信息、剧集数据、封面资源和多平台弹幕。

---

## 🎯 核心定位

**影视数据聚合平台**

- 聚合多平台影视剧元数据
- 整合多源弹幕数据
- 提供标准化 API 服务
- 构建自有影视数据资产

---

## 🧱 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      数据源层                                │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  B站     │  腾讯    │  爱奇艺   │  优酷    │  元数据源       │
│  弹幕    │  弹幕    │  弹幕     │  弹幕    │  TMDB/豆瓣      │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴───────┬─────────┘
     │          │          │          │             │
     ▼          ▼          ▼          ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Provider 抽象层                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ 弹幕Provider │  │ 元数据Provider│  │ 图片Provider        │  │
│  │ (Danmaku)   │  │ (Metadata)  │  │ (Image)             │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     数据处理层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 数据清洗  │  │ 数据标准化│  │ 去重合并  │  │ 索引构建  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     数据存储层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ SQLite       │  │ Redis Cache  │  │ 文件存储          │  │
│  │ (结构化数据)  │  │ (热点数据)   │  │ (图片/封面)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     API 服务层                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 影视剧API │  │ 剧集API  │  │ 弹幕API  │  │ 图片API  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 数据模型设计

### 1. 影视剧 (Series)

```rust
pub struct Series {
    pub id: i64,
    pub title: String,              // 标题
    pub original_title: Option<String>, // 原始标题
    pub aliases: Vec<String>,       // 别名
    pub description: Option<String>, // 简介
    pub cover_url: Option<String>,  // 封面URL
    pub backdrop_url: Option<String>, // 背景图URL
    pub series_type: SeriesType,    // 类型：电影/电视剧/动漫/综艺
    pub genres: Vec<String>,        // 类型标签：动作、喜剧、爱情等
    pub country: Option<String>,    // 国家/地区
    pub language: Option<String>,   // 语言
    pub release_date: Option<String>, // 首播日期
    pub year: Option<i32>,          // 年份
    pub status: SeriesStatus,       // 状态：连载中/已完结
    pub rating: Option<f64>,        // 评分
    pub rating_count: Option<i64>,  // 评分人数
    pub popularity: Option<f64>,    // 热度
    pub tags: Vec<String>,          // 标签
    pub created_at: String,
    pub updated_at: String,
}

pub enum SeriesType {
    Movie,      // 电影
    TvSeries,   // 电视剧
    Anime,      // 动漫
    Variety,    // 综艺
    Documentary,// 纪录片
}

pub enum SeriesStatus {
    Airing,     // 连载中
    Completed,  // 已完结
    Upcoming,   // 即将上映
}
```

### 2. 剧集 (Episode)

```rust
pub struct Episode {
    pub id: i64,
    pub series_id: i64,             // 关联影视剧ID
    pub season_number: i32,         // 季数
    pub episode_number: i32,        // 集数
    pub title: Option<String>,      // 集标题
    pub description: Option<String>, // 集简介
    pub cover_url: Option<String>,  // 集封面
    pub duration: Option<i32>,      // 时长（秒）
    pub air_date: Option<String>,   // 播出日期
    pub created_at: String,
}
```

### 3. 演职人员 (Cast)

```rust
pub struct Person {
    pub id: i64,
    pub name: String,               // 姓名
    pub original_name: Option<String>, // 原名
    pub avatar_url: Option<String>, // 头像
    pub biography: Option<String>,  // 简介
    pub birthday: Option<String>,   // 生日
    pub place_of_birth: Option<String>, // 出生地
}

pub struct SeriesCast {
    pub series_id: i64,
    pub person_id: i64,
    pub role: String,               // 角色名
    pub cast_type: CastType,        // 类型：演员/导演/编剧
    pub order: i32,                 // 排序
}

pub enum CastType {
    Actor,      // 演员
    Director,   // 导演
    Screenwriter, // 编剧
    Producer,   // 制片人
}
```

### 4. 弹幕 (Danmaku) - 已有，需扩展

```rust
pub struct Danmaku {
    pub id: i64,
    pub episode_id: i64,            // 关联剧集ID
    pub time: f64,                  // 统一后的时间点（秒）
    pub content: String,            // 内容
    pub danmaku_type: String,       // 类型：滚动/顶部/底部
    pub color: String,              // 颜色
    pub font_size: Option<i32>,     // 字体大小
    pub source: String,             // 来源平台: bilibili/tencent/user
    pub source_id: Option<String>,  // 来源平台弹幕ID
    pub source_time: Option<f64>,   // 原始时间点（秒，平台原始值）
    pub user_id: Option<String>,    // 用户ID（本地用户发送的弹幕）
    pub user_hash: Option<String>,  // 用户哈希（第三方平台）
    pub ip_address: Option<String>, // IP地址（可选，用于反垃圾）
    pub is_local: bool,             // 是否本地用户发送
    pub created_at: String,
}

pub enum DanmakuSource {
    Bilibili,   // B站
    Tencent,    // 腾讯视频
    IQiyi,      // 爱奇艺
    Youku,      // 优酷
    User,       // 本地用户发送
    Import,     // 导入的第三方弹幕
}
```

### 4.1 跨平台弹幕统一模型

```rust
// 平台时间偏移配置
pub struct PlatformTimeOffset {
    pub id: i64,
    pub episode_id: i64,
    pub platform: String,           // 平台代码
    pub offset_seconds: f64,        // 时间偏移量（秒）
    pub offset_type: OffsetType,    // 偏移类型
    pub confidence: f64,            // 置信度 (0.0-1.0)
    pub created_at: String,
    pub updated_at: String,
}

pub enum OffsetType {
    Manual,     // 手动设置
    Auto,       // 自动计算
    Verified,   // 已验证
}

// 弹幕匹配记录（用于跨平台去重）
pub struct DanmakuMatch {
    pub id: i64,
    pub danmaku_id_1: i64,          // 弹幕1 ID
    pub danmaku_id_2: i64,          // 弹幕2 ID
    pub similarity: f64,            // 相似度 (0.0-1.0)
    pub match_type: MatchType,      // 匹配类型
    pub created_at: String,
}

pub enum MatchType {
    Exact,      // 完全相同
    Similar,    // 相似内容
    TimeSync,   // 时间同步
}

// 剧集弹幕统计
pub struct EpisodeDanmakuStats {
    pub episode_id: i64,
    pub total_count: i64,           // 总弹幕数
    pub source_counts: HashMap<String, i64>,  // 各平台弹幕数
    pub merged_count: i64,          // 合并后的弹幕数
    pub duplicate_count: i64,       // 重复弹幕数
}
```

### 5. 平台信息 (Platform)

```rust
pub struct Platform {
    pub id: i64,
    pub name: String,               // 平台名称
    pub code: String,               // 平台代码：bilibili/tencent/iqiyi/youku
    pub base_url: Option<String>,   // 平台URL
    pub icon_url: Option<String>,   // 平台图标
}

pub struct SeriesPlatform {
    pub series_id: i64,
    pub platform_id: i64,
    pub platform_series_id: String, // 平台上的影视剧ID
    pub platform_url: Option<String>, // 平台链接
    pub is_available: bool,         // 是否可用
}
```

### 6. 图片资源 (Image)

```rust
pub struct Image {
    pub id: i64,
    pub series_id: Option<i64>,
    pub episode_id: Option<i64>,
    pub person_id: Option<i64>,
    pub image_type: ImageType,      // 类型：封面/海报/剧照/头像
    pub url: String,                // 图片URL
    pub local_path: Option<String>, // 本地路径
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub size: Option<i64>,          // 文件大小
    pub source: String,             // 来源
    pub created_at: String,
}

pub enum ImageType {
    Cover,      // 封面
    Poster,     // 海报
    Backdrop,   // 背景图
    Still,      // 剧照
    Avatar,     // 头像
}
```

---

## 🔌 Provider 设计

### 1. 元数据 Provider

```rust
#[async_trait]
pub trait MetadataProvider: Send + Sync {
    fn name(&self) -> &str;
    
    // 搜索影视剧
    async fn search(&self, keyword: &str) -> Result<Vec<Series>>;
    
    // 获取影视剧详情
    async fn get_series_detail(&self, id: &str) -> Result<Series>;
    
    // 获取剧集列表
    async fn get_episodes(&self, series_id: &str) -> Result<Vec<Episode>>;
    
    // 获取演职人员
    async fn get_cast(&self, series_id: &str) -> Result<Vec<SeriesCast>>;
    
    // 获取图片
    async fn get_images(&self, series_id: &str) -> Result<Vec<Image>>;
}
```

**实现：**
- `TmdbProvider` - TMDB API
- `DouBanProvider` - 豆瓣数据
- `BilibiliMetadataProvider` - B站元数据

### 2. 弹幕 Provider - 已有，需扩展

```rust
#[async_trait]
pub trait DanmakuProvider: Send + Sync {
    fn name(&self) -> &str;
    
    // 根据剧集获取弹幕
    async fn fetch_danmaku(&self, episode_id: &str) -> Result<Vec<Danmaku>>;
    
    // 根据平台ID获取弹幕
    async fn fetch_danmaku_by_platform_id(&self, platform_id: &str) -> Result<Vec<Danmaku>>;
}
```

**实现：**
- `BilibiliDanmakuProvider` - B站弹幕
- `TencentDanmakuProvider` - 腾讯弹幕
- `IQiyiDanmakuProvider` - 爱奇艺弹幕

### 3. 图片 Provider

```rust
#[async_trait]
pub trait ImageProvider: Send + Sync {
    fn name(&self) -> &str;
    
    // 下载图片
    async fn download_image(&self, url: &str, save_path: &str) -> Result<Image>;
    
    // 获取封面
    async fn get_cover(&self, series_id: &str) -> Result<Image>;
    
    // 获取海报
    async fn get_posters(&self, series_id: &str) -> Result<Vec<Image>>;
}
```

---

## 📡 API 设计

### 影视剧 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/series` | GET | 搜索影视剧 |
| `/api/series/:id` | GET | 获取影视剧详情 |
| `/api/series/:id/episodes` | GET | 获取剧集列表 |
| `/api/series/:id/cast` | GET | 获取演职人员 |
| `/api/series/:id/images` | GET | 获取图片列表 |
| `/api/series/:id/danmakus` | GET | 获取所有弹幕 |
| `/api/series/trending` | GET | 热门影视剧 |
| `/api/series/latest` | GET | 最新影视剧 |

### 剧集 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/episodes/:id` | GET | 获取剧集详情 |
| `/api/episodes/:id/danmakus` | GET | 获取剧集弹幕 |
| `/api/episodes/:id/danmakus/range` | GET | 时间范围弹幕 |

### 弹幕写入 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/episodes/:id/danmakus` | POST | 用户发送弹幕 |
| `/api/danmaku/import` | POST | 从第三方平台导入弹幕 |
| `/api/danmaku/merge` | POST | 合并多平台弹幕 |
| `/api/episodes/:id/danmakus/merged` | GET | 获取合并后的弹幕 |
| `/api/episodes/:id/time-offset` | POST | 设置时间偏移 |

#### 用户发送弹幕

```http
POST /api/episodes/123/danmakus
Content-Type: application/json

{
  "time": 12.5,
  "content": "前方高能",
  "type": "scroll",
  "color": "#ffffff",
  "user_id": "user_123"  // 可选，用户标识
}
```

**响应：**
```json
{
  "id": 456,
  "episode_id": 123,
  "time": 12.5,
  "content": "前方高能",
  "type": "scroll",
  "color": "#ffffff",
  "source": "user",
  "created_at": "2026-06-12T10:30:00Z"
}
```

#### 第三方弹幕导入

```http
POST /api/danmaku/import
Content-Type: application/json

{
  "platform": "bilibili",
  "platform_id": "BV1xx411c7mD",
  "episode_id": 123,  // 可选，关联到本地剧集
  "series_id": 456    // 可选，关联到本地影视剧
}
```

**响应：**
```json
{
  "success": true,
  "imported": 1250,
  "duplicates": 30,
  "episode_id": 123,
  "source": "bilibili"
}
```

#### 批量导入（通过URL）

```http
POST /api/danmaku/import/url
Content-Type: application/json

{
  "url": "https://www.bilibili.com/video/BV1xx411c7mD",
  "episode_id": 123
}
```

#### 跨平台弹幕合并

```http
POST /api/danmaku/merge
Content-Type: application/json

{
  "episode_id": 123,
  "sources": ["bilibili", "tencent", "iqiyi"],
  "options": {
    "deduplicate": true,           // 是否去重
    "similarity_threshold": 0.85,  // 相似度阈值
    "time_alignment": true,        // 是否时间对齐
    "merge_strategy": "best"       // 合并策略：best/all/weighted
  }
}
```

**响应：**
```json
{
  "success": true,
  "episode_id": 123,
  "before_merge": {
    "bilibili": 1250,
    "tencent": 980,
    "iqiyi": 1100,
    "total": 3330
  },
  "after_merge": {
    "total": 1850,
    "duplicates_removed": 480,
    "time_aligned": 1850
  }
}
```

#### 获取合并后的弹幕

```http
GET /api/episodes/123/danmakus/merged?sources=bilibili,tencent&time_start=10&time_end=60
```

**响应：**
```json
{
  "episode_id": 123,
  "total": 150,
  "danmakus": [
    {
      "id": 1,
      "time": 12.5,
      "content": "前方高能",
      "type": "scroll",
      "color": "#ffffff",
      "sources": ["bilibili", "tencent"],
      "primary_source": "bilibili"
    }
  ]
}
```

#### 设置时间偏移

```http
POST /api/episodes/123/time-offset
Content-Type: application/json

{
  "platform": "tencent",
  "offset_seconds": 2.5,
  "offset_type": "manual"
}
```

**响应：**
```json
{
  "success": true,
  "episode_id": 123,
  "platform": "tencent",
  "offset_seconds": 2.5,
  "affected_danmakus": 980
}
```

### 图片 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/images/:id` | GET | 获取图片 |
| `/api/images/cover/:series_id` | GET | 获取封面 |
| `/api/images/poster/:series_id` | GET | 获取海报 |

### WebSocket

| 接口 | 说明 |
|------|------|
| `/ws/danmaku/:episode_id` | 实时弹幕推送（收发双向） |

---

## 🔄 弹幕数据流

### 1. 用户发送弹幕流程

```
用户客户端
    │
    ▼
POST /api/episodes/:id/danmakus
    │
    ▼
┌─────────────────┐
│ 参数验证        │ ← 内容过滤、频率限制
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 去重检查        │ ← 检查是否重复
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 存入数据库      │ ← source = "user", is_local = true
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ WebSocket广播   │ ← 推送给同一剧集的所有用户
└─────────────────┘
```

### 2. 第三方弹幕导入流程

```
API请求 /api/danmaku/import
    │
    ▼
┌─────────────────┐
│ 创建导入任务    │ ← import_logs 表记录
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 调用Provider    │ ← 根据 platform 选择对应 Provider
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 获取第三方弹幕  │ ← 从 B站/腾讯/爱奇艺 抓取
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 数据标准化      │ ← 转换为统一格式
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 批量去重写入    │ ← source = "bilibili", is_local = false
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 更新导入记录    │ ← 记录导入数量、状态
└─────────────────┘
```

### 3. WebSocket 双向通信

```
客户端A                    服务端                    客户端B
   │                         │                         │
   │─── 连接 /ws/danmaku/:id ──►│                         │
   │                         │◄── 连接 /ws/danmaku/:id ──│
   │                         │                         │
   │─── 发送弹幕 ────────────►│                         │
   │                         │─── 广播弹幕 ────────────►│
   │                         │                         │
   │                         │◄── 发送弹幕 ─────────────│
   │◄── 广播弹幕 ────────────│                         │
```

### 4. 跨平台弹幕统一流程

```
API请求 /api/danmaku/merge
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                    获取多平台弹幕                            │
├──────────┬──────────┬──────────┬────────────────────────────┤
│  B站     │  腾讯    │  爱奇艺   │  其他平台                   │
│  弹幕    │  弹幕    │  弹幕     │  弹幕                       │
└────┬─────┴────┬─────┴────┬─────┴───────────┬────────────────┘
     │          │          │                 │
     ▼          ▼          ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    时间轴对齐                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 1. 应用平台时间偏移 (time_offset)                    │    │
│  │ 2. 统一时间基准                                      │    │
│  │ 3. 时间点标准化                                      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    内容去重合并                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 1. 文本相似度计算 (编辑距离/余弦相似度)               │    │
│  │ 2. 时间窗口匹配 (±1秒内相同内容)                      │    │
│  │ 3. 标记重复弹幕 (danmaku_matchs表)                   │    │
│  │ 4. 保留最优弹幕 (按平台优先级/时间精度)               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    生成统一弹幕流                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ {                                                    │    │
│  │   "time": 12.5,                                      │    │
│  │   "content": "前方高能",                              │    │
│  │   "sources": ["bilibili", "tencent"],                │    │
│  │   "primary_source": "bilibili",                      │    │
│  │   "is_merged": true                                  │    │
│  │ }                                                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 5. 时间偏移自动检测

```
┌─────────────────────────────────────────────────────────────┐
│                   时间偏移检测算法                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  输入: 平台A弹幕列表, 平台B弹幕列表                          │
│                                                             │
│  步骤1: 内容匹配                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 找到两个平台中内容相同/相似的弹幕对                   │    │
│  │ 例如: A平台 "前方高能" @10.5s, B平台 "前方高能" @13.0s│    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  步骤2: 计算时间差                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 差值 = B平台时间 - A平台时间 = 13.0 - 10.5 = 2.5s    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  步骤3: 统计分析                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 对所有匹配对计算差值，取中位数作为偏移量              │    │
│  │ 过滤异常值 (超过2个标准差)                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  步骤4: 输出                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ {                                                    │    │
│  │   "platform": "tencent",                             │    │
│  │   "offset": 2.5,                                     │    │
│  │   "confidence": 0.92,                                │    │
│  │   "matched_count": 85                                │    │
│  │ }                                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ 数据库设计

### 表结构

```sql
-- 影视剧表
CREATE TABLE series (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    original_title TEXT,
    description TEXT,
    cover_url TEXT,
    backdrop_url TEXT,
    series_type TEXT NOT NULL DEFAULT 'tv_series',
    genres TEXT,  -- JSON array
    country TEXT,
    language TEXT,
    release_date TEXT,
    year INTEGER,
    status TEXT NOT NULL DEFAULT 'airing',
    rating REAL,
    rating_count INTEGER,
    popularity REAL,
    tags TEXT,  -- JSON array
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 剧集表
CREATE TABLE episodes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER NOT NULL,
    season_number INTEGER NOT NULL DEFAULT 1,
    episode_number INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    cover_url TEXT,
    duration INTEGER,
    air_date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (series_id) REFERENCES series(id),
    UNIQUE(series_id, season_number, episode_number)
);

-- 演职人员表
CREATE TABLE persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    original_name TEXT,
    avatar_url TEXT,
    biography TEXT,
    birthday TEXT,
    place_of_birth TEXT
);

-- 影视剧-人员关联表
CREATE TABLE series_cast (
    series_id INTEGER NOT NULL,
    person_id INTEGER NOT NULL,
    role TEXT,
    cast_type TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    PRIMARY KEY (series_id, person_id, cast_type),
    FOREIGN KEY (series_id) REFERENCES series(id),
    FOREIGN KEY (person_id) REFERENCES persons(id)
);

-- 弹幕表（扩展）
CREATE TABLE danmakus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    time REAL NOT NULL,             -- 统一后的时间（已应用偏移）
    source_time REAL,               -- 原始时间（平台原始值）
    content TEXT NOT NULL,
    danmaku_type TEXT NOT NULL DEFAULT 'scroll',
    color TEXT NOT NULL DEFAULT '#ffffff',
    font_size INTEGER DEFAULT 25,
    source TEXT NOT NULL,           -- 来源：bilibili/tencent/user
    source_id TEXT,                 -- 第三方平台弹幕ID
    user_id TEXT,                   -- 本地用户ID
    user_hash TEXT,                 -- 第三方用户哈希
    ip_address TEXT,                -- IP地址（反垃圾）
    is_local BOOLEAN NOT NULL DEFAULT 0,  -- 是否本地发送
    is_merged BOOLEAN NOT NULL DEFAULT 0, -- 是否已合并
    merge_group TEXT,               -- 合并组ID（相同内容的弹幕组）
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (episode_id) REFERENCES episodes(id)
);

-- 弹幕导入记录表
CREATE TABLE import_logs (
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
    FOREIGN KEY (episode_id) REFERENCES episodes(id)
);

-- 平台时间偏移表
CREATE TABLE platform_time_offsets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    platform TEXT NOT NULL,         -- 平台代码：bilibili/tencent/iqiyi
    offset_seconds REAL NOT NULL DEFAULT 0.0,  -- 时间偏移量（秒）
    offset_type TEXT NOT NULL DEFAULT 'manual', -- manual/auto/verified
    confidence REAL DEFAULT 1.0,    -- 置信度 (0.0-1.0)
    matched_count INTEGER DEFAULT 0, -- 匹配的弹幕数量
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (episode_id) REFERENCES episodes(id),
    UNIQUE(episode_id, platform)
);

-- 弹幕匹配记录表（跨平台去重）
CREATE TABLE danmaku_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    danmaku_id_1 INTEGER NOT NULL,
    danmaku_id_2 INTEGER NOT NULL,
    similarity REAL NOT NULL,       -- 相似度 (0.0-1.0)
    match_type TEXT NOT NULL,       -- exact/similar/time_sync
    time_diff REAL,                 -- 时间差（秒）
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (danmaku_id_1) REFERENCES danmakus(id),
    FOREIGN KEY (danmaku_id_2) REFERENCES danmakus(id),
    UNIQUE(danmaku_id_1, danmaku_id_2)
);

-- 弹幕合并记录表
CREATE TABLE merge_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    episode_id INTEGER NOT NULL,
    sources TEXT NOT NULL,          -- JSON array of platforms
    total_before INTEGER NOT NULL,  -- 合并前总数
    total_after INTEGER NOT NULL,   -- 合并后总数
    duplicates_removed INTEGER NOT NULL DEFAULT 0,
    merge_options TEXT,             -- JSON: 合并选项
    status TEXT NOT NULL DEFAULT 'pending',  -- pending/completed/failed
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    FOREIGN KEY (episode_id) REFERENCES episodes(id)
);

-- 平台表
CREATE TABLE platforms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    base_url TEXT,
    icon_url TEXT
);

-- 影视剧-平台关联表
CREATE TABLE series_platforms (
    series_id INTEGER NOT NULL,
    platform_id INTEGER NOT NULL,
    platform_series_id TEXT NOT NULL,
    platform_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT 1,
    PRIMARY KEY (series_id, platform_id),
    FOREIGN KEY (series_id) REFERENCES series(id),
    FOREIGN KEY (platform_id) REFERENCES platforms(id)
);

-- 图片表
CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER,
    episode_id INTEGER,
    person_id INTEGER,
    image_type TEXT NOT NULL,
    url TEXT NOT NULL,
    local_path TEXT,
    width INTEGER,
    height INTEGER,
    size INTEGER,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (series_id) REFERENCES series(id),
    FOREIGN KEY (episode_id) REFERENCES episodes(id),
    FOREIGN KEY ( person_id) REFERENCES persons(id)
);

-- 索引
CREATE INDEX idx_series_title ON series(title);
CREATE INDEX idx_series_type ON series(series_type);
CREATE INDEX idx_series_year ON series(year);
CREATE INDEX idx_series_rating ON series(rating);
CREATE INDEX idx_episodes_series_id ON episodes(series_id);
CREATE INDEX idx_episodes_season ON episodes(series_id, season_number);
CREATE INDEX idx_danmakus_episode_id ON danmakus(episode_id);
CREATE INDEX idx_danmakus_time ON danmakus(time);
CREATE INDEX idx_danmakus_source ON danmakus(source);
CREATE INDEX idx_danmakus_merge_group ON danmakus(merge_group);
CREATE INDEX idx_danmakus_is_merged ON danmakus(is_merged);
CREATE INDEX idx_series_platforms_series ON series_platforms(series_id);
CREATE INDEX idx_series_platforms_platform ON series_platforms(platform_id);
CREATE INDEX idx_images_series ON images(series_id);
CREATE INDEX idx_images_episode ON images(episode_id);
CREATE INDEX idx_time_offsets_episode ON platform_time_offsets(episode_id);
CREATE INDEX idx_time_offsets_platform ON platform_time_offsets(platform);
CREATE INDEX idx_danmaku_matches_1 ON danmaku_matches(danmaku_id_1);
CREATE INDEX idx_danmaku_matches_2 ON danmaku_matches(danmaku_id_2);
CREATE INDEX idx_merge_logs_episode ON merge_logs(episode_id);
```

---

## 🚀 开发阶段规划

### 第一阶段：数据模型重构

- [ ] 扩展数据模型（Series、Episode、Person、Image）
- [ ] 重构数据库表结构
- [ ] 数据迁移脚本

### 第二阶段：元数据 Provider

- [ ] 实现 TMDB Provider
- [ ] 实现豆瓣 Provider
- [ ] 元数据搜索和同步

### 第三阶段：多平台弹幕

- [ ] 扩展现有 Bilibili Provider
- [ ] 实现腾讯视频 Provider
- [ ] 实现爱奇艺 Provider
- [ ] 弹幕与剧集关联

### 第四阶段：弹幕写入与导入

- [ ] 用户发送弹幕 API (POST)
- [ ] 第三方弹幕导入 API
- [ ] 批量导入（通过URL）
- [ ] 导入任务队列
- [ ] 去重和冲突处理
- [ ] 反垃圾机制（IP限制、频率限制）

### 第五阶段：跨平台弹幕统一

- [ ] 时间偏移检测算法
- [ ] 时间轴自动对齐
- [ ] 内容相似度计算
- [ ] 跨平台弹幕去重
- [ ] 弹幕合并 API
- [ ] 合并后弹幕查询 API
- [ ] 偏移量手动/自动设置

### 第六阶段：图片服务

- [ ] 图片下载和存储
- [ ] 封面/海报管理
- [ ] 图片 API

### 第七阶段：API 完善

- [ ] 影视剧 CRUD API
- [ ] 剧集查询 API
- [ ] 搜索和推荐 API
- [ ] API 文档

### 第八阶段：数据采集自动化

- [ ] 定时任务调度
- [ ] 数据同步策略
- [ ] 增量更新机制

---

## 📦 技术栈

| 组件 | 选型 | 说明 |
|------|------|------|
| 语言 | Rust | 高性能、内存安全 |
| 异步运行时 | tokio | 异步IO |
| Web框架 | axum | HTTP/WebSocket |
| 数据库 | SQLite | 本地存储 |
| 缓存 | Redis | 可选 |
| HTTP客户端 | reqwest | API调用 |
| XML解析 | quick-xml | B站弹幕解析 |
| 序列化 | serde/serde_json | JSON处理 |
| 任务调度 | tokio-cron-scheduled | 定时任务 |

---

## 🔗 数据源参考

### 元数据源

| 平台 | API | 说明 |
|------|-----|------|
| TMDB | https://api.themoviedb.org | 国际影视数据库 |
| 豆瓣 | 爬虫 | 中文影视评分 |
| B站 | https://api.bilibili.com | 动漫/番剧信息 |

### 弹幕源

| 平台 | 弹幕格式 | 说明 |
|------|----------|------|
| B站 | XML/Protobuf | 已实现 |
| 腾讯视频 | JSON | 待实现 |
| 爱奇艺 | JSON | 待实现 |
| 优酷 | JSON | 待实现 |

---

## 💡 项目愿景

打造一个：

> **"属于自己的影视数据网络"**

整合多平台影视资源，构建完整的影视数据生态系统。