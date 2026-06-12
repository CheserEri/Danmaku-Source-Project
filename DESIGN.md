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

```java
@Data
@Entity
@Table(name = "series")
public class Series {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;              // 标题
    private String originalTitle;      // 原始标题
    private String description;        // 简介
    private String coverUrl;           // 封面URL
    private String backdropUrl;        // 背景图URL
    
    @Enumerated(EnumType.STRING)
    private SeriesType seriesType;     // 类型：电影/电视剧/动漫/综艺
    
    private String genres;             // JSON数组：["动作","喜剧"]
    private String country;            // 国家/地区
    private String language;           // 语言
    private String releaseDate;        // 首播日期
    private Integer year;              // 年份
    
    @Enumerated(EnumType.STRING)
    private SeriesStatus status;       // 状态：连载中/已完结
    
    private Double rating;             // 评分
    private Long ratingCount;          // 评分人数
    private Double popularity;         // 热度
    private String tags;               // JSON数组
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

public enum SeriesType {
    MOVIE,      // 电影
    TV_SERIES,  // 电视剧
    ANIME,      // 动漫
    MUSIC,      // 音乐
    VARIETY,    // 综艺
    DOCUMENTARY // 纪录片
}

public enum SeriesStatus {
    AIRING,     // 连载中
    COMPLETED,  // 已完结
    UPCOMING,   // 即将上映
}
```

### 1.1 分类视觉主题

```java
@Data
public class CategoryTheme {
    private String category;           // 分类代码
    private String name;               // 分类名称
    private String icon;               // 图标
    private String primaryColor;       // 主色调
    private String gradientStart;      // 渐变起始色
    private String gradientEnd;        // 渐变结束色
    private String backgroundPattern;  // 背景图案
    private String cardStyle;          // 卡片样式
}

// 预设主题配置
public enum CategoryThemeConfig {
    MOVIE("movie", "电影", "🎬", "#E50914", "#1a0000", "#4a0000", "film-grain", "cinema"),
    TV_SERIES("tv_series", "电视剧", "📺", "#FF6B35", "#1a0a00", "#4a1a00", "wave", "standard"),
    ANIME("anime", "动漫", "🎨", "#FF69B4", "#1a001a", "#4a004a", "sakura", "anime"),
    MUSIC("music", "音乐", "🎵", "#1DB954", "#001a0a", "#004a1a", "sound-wave", "album"),
    VARIETY("variety", "综艺", "🎭", "#FFD700", "#1a1a00", "#4a4a00", "spotlight", "bright"),
    DOCUMENTARY("documentary", "纪录片", "📹", "#4169E1", "#000a1a", "#001a4a", "film-strip", "minimal");
    
    private final String code;
    private final String name;
    private final String icon;
    private final String primaryColor;
    private final String gradientStart;
    private final String gradientEnd;
    private final String backgroundPattern;
    private final String cardStyle;
}
```

### 2. 剧集 (Episode)

```java
@Data
@Entity
@Table(name = "episodes")
public class Episode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long seriesId;             // 关联影视剧ID
    private Integer seasonNumber;      // 季数
    private Integer episodeNumber;     // 集数
    private String title;              // 集标题
    private String description;        // 集简介
    private String coverUrl;           // 集封面
    private Integer duration;          // 时长（秒）
    private String airDate;            // 播出日期
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### 2.1 更新时间表 (UpdateSchedule)

```java
@Data
@Entity
@Table(name = "update_schedules")
public class UpdateSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long seriesId;             // 关联影视剧ID
    
    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;       // 更新星期：MONDAY~SUNDAY
    
    private String updateTime;         // 更新时间，如 "20:00"
    private Integer episodeCount;      // 本集数（第几集）
    private String seasonInfo;         // 季信息，如 "第二季"
    private String platform;           // 更新平台：bilibili/tencent/iqiyi
    private String remark;             // 备注，如 "会员提前看"
    
    @Enumerated(EnumType.STRING)
    private ScheduleStatus status;     // 状态
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

public enum DayOfWeek {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}

public enum ScheduleStatus {
    AIRING,      // 连载中
    PAUSED,      // 暂停
    COMPLETED,   // 已完结
    CANCELLED    // 已取消
}

// 更新时间表查询结果
@Data
public class ScheduleVO {
    private Long seriesId;
    private String title;
    private String coverUrl;
    private SeriesType seriesType;
    private Double rating;
    private DayOfWeek dayOfWeek;
    private String updateTime;
    private Integer episodeCount;
    private String seasonInfo;
    private String platform;
    private String remark;
    private LocalDateTime nextUpdate;  // 下次更新时间
    private Boolean isToday;           // 是否今天更新
}
```

### 3. 演职人员 (Cast)

```java
@Data
@Entity
@Table(name = "persons")
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;               // 姓名
    private String originalName;       // 原名
    private String avatarUrl;          // 头像
    private String biography;          // 简介
    private String birthday;           // 生日
    private String placeOfBirth;       // 出生地
}

@Data
@Entity
@Table(name = "series_cast")
public class SeriesCast {
    @EmbeddedId
    private SeriesCastId id;
    
    private String role;               // 角色名
    
    @Enumerated(EnumType.STRING)
    private CastType castType;         // 类型：演员/导演/编剧
    
    private Integer order;             // 排序
}

public enum CastType {
    ACTOR,         // 演员
    DIRECTOR,      // 导演
    SCREENWRITER,  // 编剧
    PRODUCER       // 制片人
}
```

### 4. 弹幕 (Danmaku) - 已有，需扩展

```java
@Data
@Entity
@Table(name = "danmakus")
public class DanmakuEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long episodeId;            // 关联剧集ID
    private Double time;               // 统一后的时间点（秒）
    private String content;            // 内容
    
    @Enumerated(EnumType.STRING)
    private DanmakuType danmakuType;   // 类型：滚动/顶部/底部
    
    private String color;              // 颜色
    private Integer fontSize;          // 字体大小
    
    @Enumerated(EnumType.STRING)
    private DanmakuSource source;      // 来源平台
    
    private String sourceId;           // 来源平台弹幕ID
    private Double sourceTime;         // 原始时间点（秒）
    private String userId;             // 用户ID（本地用户发送的弹幕）
    private String userHash;           // 用户哈希（第三方平台）
    private String ipAddress;          // IP地址
    private Boolean isLocal;           // 是否本地用户发送
    private Boolean isMerged;          // 是否已合并
    private String mergeGroup;         // 合并组
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}

public enum DanmakuType {
    SCROLL,  // 滚动
    TOP,     // 顶部
    BOTTOM,  // 底部
    LTR      // 逆向
}

public enum DanmakuSource {
    BILIBILI,  // B站
    TENCENT,   // 腾讯视频
    IQIYI,     // 爱奇艺
    YOUKU,     // 优酷
    USER,      // 本地用户发送
    IMPORT     // 导入的第三方弹幕
}
```

### 4.1 跨平台弹幕统一模型

```java
// 平台时间偏移配置
@Data
@Entity
@Table(name = "platform_time_offsets")
public class PlatformTimeOffset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long episodeId;
    private String platform;           // 平台代码
    private Double offsetSeconds;      // 时间偏移量（秒）
    
    @Enumerated(EnumType.STRING)
    private OffsetType offsetType;     // 偏移类型
    
    private Double confidence;         // 置信度 (0.0-1.0)
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

public enum OffsetType {
    MANUAL,    // 手动设置
    AUTO,      // 自动计算
    VERIFIED   // 已验证
}

// 弹幕匹配记录（用于跨平台去重）
@Data
@Entity
@Table(name = "danmaku_matches")
public class DanmakuMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long danmakuId1;           // 弹幕1 ID
    private Long danmakuId2;           // 弹幕2 ID
    private Double similarity;         // 相似度 (0.0-1.0)
    
    @Enumerated(EnumType.STRING)
    private MatchType matchType;       // 匹配类型
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}

public enum MatchType {
    EXACT,     // 完全相同
    SIMILAR,   // 相似内容
    TIME_SYNC  // 时间同步
}

// 剧集弹幕统计
@Data
public class EpisodeDanmakuStats {
    private Long episodeId;
    private Long totalCount;           // 总弹幕数
    private Map<String, Long> sourceCounts;  // 各平台弹幕数
    private Long mergedCount;          // 合并后的弹幕数
    private Long duplicateCount;       // 重复弹幕数
}
```

### 5. 平台信息 (Platform)

```java
@Data
@Entity
@Table(name = "platforms")
public class Platform {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;               // 平台名称
    private String code;               // 平台代码：bilibili/tencent/iqiyi/youku
    private String baseUrl;            // 平台URL
    private String iconUrl;            // 平台图标
}

@Data
@Entity
@Table(name = "series_platforms")
public class SeriesPlatform {
    @EmbeddedId
    private SeriesPlatformId id;
    
    private String platformSeriesId;   // 平台上的影视剧ID
    private String platformUrl;        // 平台链接
    private Boolean isAvailable;       // 是否可用
}
```

### 6. 图片资源 (Image)

```java
@Data
@Entity
@Table(name = "images")
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long seriesId;
    private Long episodeId;
    private Long personId;
    
    @Enumerated(EnumType.STRING)
    private ImageType imageType;       // 类型：封面/海报/剧照/头像
    
    private String url;                // 图片URL
    private String localPath;          // 本地路径
    private Integer width;
    private Integer height;
    private Long size;                 // 文件大小
    private String source;             // 来源
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}

public enum ImageType {
    COVER,     // 封面
    POSTER,    // 海报
    BACKDROP,  // 背景图
    STILL,     // 剧照
    AVATAR     // 头像
}
```

---

## 🔌 Provider 设计

### 1. 元数据 Provider

```java
public interface MetadataProvider {
    String getName();
    
    // 搜索影视剧
    List<Series> search(String keyword) throws Exception;
    
    // 获取影视剧详情
    Series getSeriesDetail(String id) throws Exception;
    
    // 获取剧集列表
    List<Episode> getEpisodes(String seriesId) throws Exception;
    
    // 获取演职人员
    List<SeriesCast> getCast(String seriesId) throws Exception;
    
    // 获取图片
    List<Image> getImages(String seriesId) throws Exception;
}
```

**实现：**
- `TmdbProvider` - TMDB API
- `DouBanProvider` - 豆瓣数据
- `BilibiliMetadataProvider` - B站元数据

### 2. 弹幕 Provider - 已有，需扩展

```java
public interface DanmakuProvider {
    String getName();
    
    // 根据剧集获取弹幕
    List<DanmakuDto> fetchDanmaku(String episodeId) throws Exception;
    
    // 根据平台ID获取弹幕
    List<DanmakuDto> fetchDanmakuByPlatformId(String platformId) throws Exception;
}
```

**实现：**
- `BilibiliDanmakuProvider` - B站弹幕
- `TencentDanmakuProvider` - 腾讯弹幕
- `IQiyiDanmakuProvider` - 爱奇艺弹幕

### 3. 图片 Provider

```java
public interface ImageProvider {
    String getName();
    
    // 下载图片
    Image downloadImage(String url, String savePath) throws Exception;
    
    // 获取封面
    Image getCover(String seriesId) throws Exception;
    
    // 获取海报
    async fn get_posters(&self, series_id: &str) -> Result<Vec<Image>>;
}
```

---

## 📡 API 设计

### 分类与筛选 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/categories` | GET | 获取所有分类及主题配置 |
| `/api/categories/{type}/theme` | GET | 获取分类主题 |
| `/api/series/category/{type}` | GET | 按分类筛选影视剧 |
| `/api/series/category/{type}/trending` | GET | 分类热门 |
| `/api/series/category/{type}/latest` | GET | 分类最新 |

#### 分类列表响应

```json
{
  "categories": [
    {
      "code": "anime",
      "name": "动漫",
      "icon": "🎨",
      "primaryColor": "#FF69B4",
      "gradientStart": "#1a001a",
      "gradientEnd": "#4a004a",
      "backgroundPattern": "sakura",
      "cardStyle": "anime",
      "count": 1250
    },
    {
      "code": "movie",
      "name": "电影",
      "icon": "🎬",
      "primaryColor": "#E50914",
      "gradientStart": "#1a0000",
      "gradientEnd": "#4a0000",
      "backgroundPattern": "film-grain",
      "cardStyle": "cinema",
      "count": 3420
    }
  ]
}
```

### 更新时间表 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/schedules/today` | GET | 今日更新 |
| `/api/schedules/week` | GET | 本周更新表 |
| `/api/schedules/week/{day}` | GET | 指定星期更新 |
| `/api/schedules/series/{id}` | GET | 剧集更新时间 |
| `/api/schedules` | POST | 设置更新时间 |

#### 今日更新响应

```json
{
  "day": "WEDNESDAY",
  "date": "2026-06-12",
  "schedules": [
    {
      "seriesId": 1,
      "title": "进击的巨人 最终季",
      "coverUrl": "https://...",
      "seriesType": "ANIME",
      "rating": 9.5,
      "dayOfWeek": "WEDNESDAY",
      "updateTime": "20:00",
      "episodeCount": 87,
      "seasonInfo": "最终季 Part.3",
      "platform": "bilibili",
      "remark": "会员提前看",
      "nextUpdate": "2026-06-12T20:00:00",
      "isToday": true
    }
  ],
  "total": 5
}
```

#### 本周更新表响应

```json
{
  "weekStart": "2026-06-09",
  "weekEnd": "2026-06-15",
  "schedule": {
    "MONDAY": [],
    "TUESDAY": [],
    "WEDNESDAY": [
      { "seriesId": 1, "title": "进击的巨人", "updateTime": "20:00", "seriesType": "ANIME" }
    ],
    "THURSDAY": [],
    "FRIDAY": [
      { "seriesId": 2, "title": "三体", "updateTime": "21:00", "seriesType": "TV_SERIES" }
    ],
    "SATURDAY": [],
    "SUNDAY": []
  }
}
```

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
    FOREIGN KEY (person_id) REFERENCES persons(id)
);

-- 更新时间表
CREATE TABLE update_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    series_id INTEGER NOT NULL,
    day_of_week TEXT NOT NULL,         -- MONDAY~SUNDAY
    update_time TEXT NOT NULL,         -- 更新时间，如 "20:00"
    episode_count INTEGER DEFAULT 0,   -- 当前集数
    season_info TEXT,                  -- 季信息
    platform TEXT,                     -- 更新平台
    remark TEXT,                       -- 备注
    status TEXT NOT NULL DEFAULT 'AIRING',  -- AIRING/PAUSED/COMPLETED/CANCELLED
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (series_id) REFERENCES series(id)
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

### 第九阶段：分类与时间表

- [ ] 分类体系实现
- [ ] 瀑布流组件
- [ ] 更新时间表功能
- [ ] 分类主题定制

---

## 🎨 前端设计

### 页面结构

```
┌─────────────────────────────────────────────────────────────┐
│                         导航栏                               │
│  首页 | 动漫 | 电影 | 音乐 | 综艺 | 纪录片 | 搜索           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Hero 轮播                         │   │
│  │              热门推荐 / 新番上线                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 今日更新时间表                        │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │   │
│  │  │20:00│ │21:00│ │22:00│ │     │ │     │           │   │
│  │  │动漫A│ │电影B│ │综艺C│ │     │ │     │           │   │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    瀑布流内容                         │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │   │
│  │  │      │ │      │ │      │ │      │ │      │     │   │
│  │  │ 卡片 │ │ 卡片 │ │ 卡片 │ │ 卡片 │ │ 卡片 │     │   │
│  │  │  A   │ │  B   │ │  C   │ │  D   │ │  E   │     │   │
│  │  │      │ │      │ │      │ │      │ │      │     │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │   │
│  │  │ 卡片 │ │ 卡片 │ │ 卡片 │ │ 卡片 │ │ 卡片 │     │   │
│  │  │  F   │ │  G   │ │  H   │ │  I   │ │  J   │     │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 分类页面主题

| 分类 | 主色调 | 背景效果 | 卡片风格 |
|------|--------|----------|----------|
| 动漫 | #FF69B4 (粉色) | 樱花飘落 | 圆角、柔和阴影 |
| 电影 | #E50914 (红色) | 胶片颗粒 | 直角、硬朗阴影 |
| 音乐 | #1DB954 (绿色) | 声波律动 | 圆形封面、渐变 |
| 综艺 | #FFD700 (金色) | 聚光灯效 | 鲜艳、活泼 |
| 纪录片 | #4169E1 (蓝色) | 胶片条纹 | 简约、克制 |

### 瀑布流实现

```typescript
// 瀑布流组件
interface WaterfallProps {
  columns: number;           // 列数
  gap: number;               // 间距
  items: SeriesCard[];       // 内容列表
  category: SeriesType;      // 分类
  onLoadMore: () => void;    // 加载更多
}

// 内容卡片
interface SeriesCard {
  id: number;
  title: string;
  coverUrl: string;
  seriesType: SeriesType;
  rating: number;
  status: SeriesStatus;
  latestEpisode: string;     // "更新至第12集"
  tags: string[];
}
```

### 更新时间表组件

```typescript
// 周时间表
interface WeekSchedule {
  [key: string]: ScheduleItem[];  // MONDAY -> [...]
}

interface ScheduleItem {
  seriesId: number;
  title: string;
  coverUrl: string;
  updateTime: string;        // "20:00"
  episodeCount: number;
  platform: string;
  seriesType: SeriesType;
}

// 时间轴展示
TimelineView -> 横向时间轴，按小时排列
  ┌────┬────┬────┬────┬────┬────┬────┬────┐
  │10:00│11:00│12:00│13:00│14:00│15:00│16:00│17:00│
  │    │    │    │    │    │    │    │    │
  │ 🎬 │    │ 🎵 │    │    │ 📺 │    │ 🎭 │
  └────┴────┴────┴────┴────┴────┴────┴────┘
```

---

## 📦 技术栈

| 组件 | 选型 | 说明 |
|------|------|------|
| 语言 | Java 17 | 生态成熟、稳定可靠 |
| 框架 | Spring Boot 3.2 | 微服务架构 |
| 数据库 | SQLite | 本地存储 |
| 缓存 | Redis | 可选 |
| HTTP客户端 | OkHttp | API调用 |
| XML解析 | Dom4j | B站弹幕解析 |
| 序列化 | Jackson | JSON处理 |
| API文档 | Knife4j | OpenAPI 3.0 |

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