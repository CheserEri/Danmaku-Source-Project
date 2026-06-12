# 影视数据平台（Movie Data Platform）

## 📌 项目简介

"影视数据平台"是一个以 **影视剧数据聚合与分发为核心** 的后端服务系统。

核心目标：

> **从多个平台聚合影视剧信息、剧集数据、封面资源和弹幕数据，构建统一影视数据库，并对外提供 API 服务。**

---

## 🎯 核心定位

* 🎬 影视剧元数据聚合
* 📺 剧集信息管理
* 🖼️ 封面/海报资源
* 💬 多平台弹幕整合
* 🔌 标准化 API 服务

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
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     数据存储层                               │
│         SQLite (结构化数据) + Redis (缓存) + 文件存储 (图片)  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     API 服务层                               │
│    影视剧API | 剧集API | 弹幕API | 图片API | WebSocket      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 数据模型

### 影视剧 (Series)

```json
{
  "id": 1,
  "title": "三体",
  "series_type": "tv_series",
  "genres": ["科幻", "剧情"],
  "year": 2023,
  "rating": 8.7,
  "cover_url": "https://...",
  "status": "completed"
}
```

### 剧集 (Episode)

```json
{
  "id": 1,
  "series_id": 1,
  "season_number": 1,
  "episode_number": 1,
  "title": "科学边界",
  "duration": 45,
  "air_date": "2023-01-15"
}
```

### 弹幕 (Danmaku)

```json
{
  "episode_id": 1,
  "time": 12.5,
  "content": "前方高能",
  "type": "scroll",
  "color": "#ffffff",
  "source": "bilibili"
}
```

---

## 🔌 API 接口

### 影视剧

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/series` | GET | 搜索影视剧 |
| `/api/series/:id` | GET | 获取详情 |
| `/api/series/:id/episodes` | GET | 获取剧集列表 |
| `/api/series/:id/cast` | GET | 获取演职人员 |
| `/api/series/:id/images` | GET | 获取图片 |
| `/api/series/trending` | GET | 热门影视剧 |

### 剧集

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/episodes/:id` | GET | 剧集详情 |
| `/api/episodes/:id/danmakus` | GET | 获取弹幕 |
| `/api/episodes/:id/danmakus/range` | GET | 时间范围弹幕 |

### 图片

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/images/cover/:series_id` | GET | 获取封面 |
| `/api/images/poster/:series_id` | GET | 获取海报 |

### WebSocket

| 接口 | 说明 |
|------|------|
| `/ws/danmaku/:episode_id` | 实时弹幕 |

---

## ⚙️ 技术选型

| 组件 | 选型 | 说明 |
|------|------|------|
| 语言 | Rust | 高性能、内存安全 |
| 异步运行时 | tokio | 异步IO |
| Web框架 | axum | HTTP/WebSocket |
| 数据库 | SQLite | 本地存储 |
| 缓存 | Redis | 可选 |
| HTTP客户端 | reqwest | API调用 |
| XML解析 | quick-xml | B站弹幕解析 |
| 序列化 | serde | JSON处理 |

---

## 🚀 快速开始

```bash
# 获取影视剧信息
danmaku-server series search --keyword "三体"

# 获取剧集列表
danmaku-server series episodes --id 1

# 获取弹幕
danmaku-server danmaku fetch --episode 1

# 启动 API 服务器
danmaku-server serve --port 3000
```

---

## 📦 项目结构

```
backend/
├── Cargo.toml
└── src/
    ├── main.rs
    ├── models/         # 数据模型
    ├── provider/       # 数据源提供者
    │   ├── metadata/   # 元数据Provider
    │   ├── danmaku/    # 弹幕Provider
    │   └── image/      # 图片Provider
    ├── db/             # 数据库
    ├── cache/          # 缓存
    ├── server/         # API服务
    └── crawler/        # 数据采集
```

---

## 🗺️ 开发计划

- [x] 第一阶段：弹幕采集基础
- [x] 第二阶段：数据存储
- [x] 第三阶段：API 服务
- [ ] 第四阶段：数据模型扩展
- [ ] 第五阶段：元数据 Provider
- [ ] 第六阶段：多平台弹幕
- [ ] 第七阶段：图片服务

---

## 💡 项目愿景

打造一个：

> **"属于自己的影视数据网络"**

整合多平台影视资源，构建完整的影视数据生态系统。

---

## 📜 License

MIT License