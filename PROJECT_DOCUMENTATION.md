# 影视数据平台 - 项目完整文档

## 📑 目录

1. [项目概述](#1-项目概述)
2. [系统架构](#2-系统架构)
3. [技术栈](#3-技术栈)
4. [项目结构](#4-项目结构)
5. [微服务详解](#5-微服务详解)
6. [数据模型](#6-数据模型)
7. [API 接口文档](#7-api-接口文档)
8. [前端设计](#8-前端设计)
9. [部署指南](#9-部署指南)
10. [开发指南](#10-开发指南)

---

## 1. 项目概述

### 1.1 项目定位

**影视数据聚合平台** - 整合多平台影视剧资源，构建完整的影视数据生态系统。

### 1.2 核心价值

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    数据聚合          标准化服务           生态构建           │
│                                                             │
│    多平台弹幕        统一 API             影视数据库         │
│    影视元数据        弹幕融合             弹幕资产           │
│    封面资源          实时推送             开放接口           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 核心功能

| 功能模块 | 说明 | 状态 |
|----------|------|------|
| 用户系统 | 注册、登录、权限管理 | ✅ 已完成 |
| 影视管理 | 影视剧、剧集、演职人员 | ✅ 已完成 |
| 弹幕系统 | 采集、存储、合并、实时推送 | ✅ 已完成 |
| 分类浏览 | 动漫、电影、音乐、综艺、纪录片 | ✅ 已完成 |
| 更新时间表 | 热播剧集更新日历 | ✅ 已完成 |
| 讨论系统 | 讨论组、回复 | ✅ 已完成 |
| 文件服务 | 图片上传、存储 | ✅ 已完成 |
| 数据采集 | B站弹幕采集 | ✅ 已完成 |

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              客户端                                      │
│                     Next.js 14 Web Application                         │
│            TypeScript + Tailwind CSS + Framer Motion                   │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API Gateway                                   │
│                    Spring Cloud Gateway (8080)                         │
│                  路由 / 认证 / 限流 / 熔断                              │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  用户服务     │      │  影视服务     │      │  弹幕服务     │
│  (8081)       │      │  (8082)       │      │  (8083)       │
│               │      │               │      │               │
│ - 注册登录    │      │ - 影视剧CRUD  │      │ - 弹幕CRUD    │
│ - 权限管理    │      │ - 剧集管理    │      │ - 弹幕导入    │
│ - 用户信息    │      │ - 演职人员    │      │ - 弹幕合并    │
│ - 更新时间表  │      │ - 分类主题    │      │ - WebSocket   │
└───────┬───────┘      └───────┬───────┘      └───────┬───────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│    H2/MySQL   │      │    H2/MySQL   │      │    H2/MySQL   │
│   用户库      │      │   影视库      │      │   弹幕库      │
└───────────────┘      └───────────────┘      └───────────────┘

        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  讨论服务     │      │  采集服务     │      │  文件服务     │
│  (8084)       │      │  (8085)       │      │  (8086)       │
│               │      │               │      │               │
│ - 讨论组      │      │ - B站采集     │      │ - 封面上传    │
│ - 回复管理    │      │ - XML解析     │      │ - 图片存储    │
│ - 置顶/锁定   │      │ - Protobuf    │      │ - CDN分发     │
└───────┬───────┘      └───────┬───────┘      └───────┬───────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│    H2/MySQL   │      │    H2/MySQL   │      │  本地文件系统 │
│   讨论库      │      │   采集库      │      │  文件存储     │
└───────────────┘      └───────────────┘      └───────────────┘
```

### 2.2 服务端口分配

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 3000 | Next.js 开发服务器 |
| API 网关 | 8080 | Spring Cloud Gateway |
| 用户服务 | 8081 | 用户认证、权限管理 |
| 影视服务 | 8082 | 影视剧、剧集、演职人员 |
| 弹幕服务 | 8083 | 弹幕采集、存储、合并 |
| 讨论服务 | 8084 | 讨论组、回复 |
| 采集服务 | 8085 | B站弹幕采集 |
| 文件服务 | 8086 | 文件上传、存储 |

---

## 3. 技术栈

### 3.1 后端技术栈

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Java** | 17 | 主语言 | LTS 版本 |
| **Spring Boot** | 3.2.5 | 基础框架 | 自动配置、内嵌服务器 |
| **Spring Cloud** | 2023.0.1 | 微服务框架 | 服务发现、配置中心 |
| **Spring Cloud Alibaba** | 2023.0.1.0 | 阿里巴巴组件 | Nacos、Sentinel |
| **Spring Security** | 6.x | 安全框架 | 认证、授权 |
| **Spring Data JPA** | 3.x | ORM 框架 | 数据库访问 |
| **MyBatis-Plus** | 3.5.6 | ORM 增强 | 简化 CRUD |
| **H2 Database** | 2.x | 内存数据库 | 开发环境 |
| **MySQL** | 8.0 | 关系数据库 | 生产环境 |
| **Redis** | 7.x | 缓存 | 会话、数据缓存 |
| **OkHttp** | 4.12.0 | HTTP 客户端 | API 调用 |
| **Protobuf** | 3.25.3 | 序列化 | B站弹幕解析 |
| **Dom4j** | 2.1.4 | XML 解析 | B站弹幕 XML |
| **Knife4j** | 4.4.0 | API 文档 | OpenAPI 3.0 |
| **JWT** | 0.12.5 | Token 认证 | 无状态认证 |
| **Lombok** | - | 代码简化 | 减少样板代码 |

### 3.2 前端技术栈

| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| **Next.js** | 14.2.0 | React 框架 | SSR/SSG |
| **React** | 18.3.0 | UI 库 | 组件化开发 |
| **TypeScript** | 5.x | 类型安全 | 静态类型检查 |
| **Tailwind CSS** | 3.4.0 | 样式框架 | 原子化 CSS |
| **Framer Motion** | 11.x | 动画库 | 流体动画 |
| **Zustand** | 4.x | 状态管理 | 轻量级 |
| **TanStack Query** | 5.x | 数据请求 | 缓存、同步 |
| **Lucide Icons** | 0.400.x | 图标库 | 矢量图标 |
| **Axios** | 1.x | HTTP 客户端 | API 调用 |

---

## 4. 项目结构

```
Danmaku-Source-Project-main/
├── README.md                          # 项目说明
├── DESIGN.md                          # 设计文档
├── TECH_STACK.md                      # 技术栈文档
├── MICROSERVICES.md                   # 微服务架构文档
├── PROJECT_OVERVIEW.md                # 项目总览
│
├── java-backend/                      # Java 后端
│   ├── pom.xml                        # 父 POM
│   │
│   ├── movie-common/                  # 公共模块
│   │   ├── pom.xml
│   │   └── src/main/java/com/movie/common/
│   │       └── result/
│   │           └── Result.java        # 统一返回结果
│   │
│   ├── movie-gateway/                 # API 网关
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/com/movie/gateway/
│   │       │   └── GatewayApplication.java
│   │       └── resources/
│   │           └── application.yml
│   │
│   ├── movie-user/                    # 用户服务
│   │   ├── pom.xml
│   │   └── src/main/java/com/movie/user/
│   │       ├── UserApplication.java   # 启动类
│   │       ├── config/
│   │       │   └── SecurityConfig.java
│   │       ├── controller/
│   │       │   ├── AuthController.java
│   │       │   └── UserController.java
│   │       ├── dto/
│   │       │   ├── LoginRequest.java
│   │       │   ├── RegisterRequest.java
│   │       │   └── UserResponse.java
│   │       ├── entity/
│   │       │   └── User.java
│   │       ├── repository/
│   │       │   └── UserRepository.java
│   │       ├── security/
│   │       │   ├── JwtAuthenticationFilter.java
│   │       │   └── JwtUtils.java
│   │       └── service/
│   │           └── UserService.java
│   │
│   ├── movie-series/                  # 影视服务
│   │   ├── pom.xml
│   │   └── src/main/java/com/movie/series/
│   │       ├── SeriesApplication.java
│   │       ├── controller/
│   │       │   ├── CategoryController.java
│   │       │   ├── ScheduleController.java
│   │       │   └── SeriesController.java
│   │       ├── dto/
│   │       │   ├── CategoryTheme.java
│   │       │   └── ScheduleVO.java
│   │       ├── entity/
│   │       │   ├── Episode.java
│   │       │   ├── Person.java
│   │       │   ├── Series.java
│   │       │   ├── SeriesCast.java
│   │       │   ├── SeriesCastId.java
│   │       │   └── UpdateSchedule.java
│   │       ├── repository/
│   │       │   ├── EpisodeRepository.java
│   │       │   ├── PersonRepository.java
│   │       │   ├── SeriesCastRepository.java
│   │       │   ├── SeriesRepository.java
│   │       │   └── UpdateScheduleRepository.java
│   │       └── service/
│   │           ├── CategoryService.java
│   │           ├── ScheduleService.java
│   │           └── SeriesService.java
│   │
│   ├── movie-danmaku/                 # 弹幕服务
│   │   ├── pom.xml
│   │   └── src/main/java/com/movie/danmaku/
│   │       ├── DanmakuApplication.java
│   │       ├── config/
│   │       │   ├── DanmakuWebSocketHandler.java
│   │       │   ├── OkHttpConfig.java
│   │       │   └── WebSocketConfig.java
│   │       ├── controller/
│   │       │   ├── DanmakuController.java
│   │       │   ├── StatsController.java
│   │       │   └── VideoController.java
│   │       ├── dto/
│   │       │   ├── DanmakuDto.java
│   │       │   └── VideoDto.java
│   │       ├── entity/
│   │       │   ├── DanmakuEntity.java
│   │       │   └── Video.java
│   │       ├── parser/
│   │       │   └── DanmakuXmlParser.java
│   │       ├── provider/
│   │       │   ├── BilibiliProvider.java
│   │       │   └── DanmakuProvider.java
│   │       ├── repository/
│   │       │   ├── DanmakuRepository.java
│   │       │   └── VideoRepository.java
│   │       ├── service/
│   │       │   ├── DanmakuService.java
│   │       │   └── VideoService.java
│   │       └── throttle/
│   │           └── RateLimiterService.java
│   │
│   ├── movie-discussion/              # 讨论服务
│   │   ├── pom.xml
│   │   └── src/main/java/com/movie/discussion/
│   │       ├── DiscussionApplication.java
│   │       ├── controller/
│   │       │   └── DiscussionController.java
│   │       ├── entity/
│   │       │   ├── Discussion.java
│   │       │   └── DiscussionReply.java
│   │       ├── repository/
│   │       │   ├── DiscussionRepository.java
│   │       │   └── DiscussionReplyRepository.java
│   │       └── service/
│   │           └── DiscussionService.java
│   │
│   ├── movie-crawler/                 # 采集服务
│   │   ├── pom.xml
│   │   └── src/main/java/com/movie/crawler/
│   │       ├── CrawlerApplication.java
│   │       ├── config/
│   │       │   └── OkHttpConfig.java
│   │       ├── controller/
│   │       │   └── CrawlerController.java
│   │       ├── dto/
│   │       │   └── DanmakuDto.java
│   │       ├── parser/
│   │       │   └── DanmakuXmlParser.java
│   │       └── provider/
│   │           ├── BilibiliProvider.java
│   │           └── DanmakuProvider.java
│   │
│   └── movie-file/                    # 文件服务
│       ├── pom.xml
│       └── src/main/java/com/movie/file/
│           ├── FileApplication.java
│           └── controller/
│               └── FileController.java
│
└── frontend/                          # Next.js 前端
    ├── package.json
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── src/
        ├── app/                       # 页面路由
        │   ├── layout.tsx             # 根布局
        │   ├── page.tsx               # 首页
        │   ├── login/page.tsx         # 登录页
        │   ├── search/page.tsx        # 搜索页
        │   ├── profile/page.tsx       # 个人中心
        │   ├── category/[type]/page.tsx # 分类页
        │   ├── series/[id]/page.tsx   # 详情页
        │   └── admin/                 # 管理后台
        │       ├── page.tsx
        │       └── users/page.tsx
        ├── components/                # 组件
        │   ├── layout/
        │   │   └── header.tsx         # 头部导航
        │   ├── series/
        │   │   ├── series-card.tsx    # 影视卡片
        │   │   └── waterfall.tsx      # 瀑布流
        │   ├── schedule/
        │   │   └── update-schedule.tsx # 更新时间表
        │   └── category/
        │       └── category-layout.tsx # 分类布局
        ├── hooks/                     # 自定义 Hooks
        ├── lib/                       # 工具函数
        ├── stores/                    # 状态管理
        └── types/                     # 类型定义
```

---

## 5. 微服务详解

### 5.1 movie-common (公共模块)

**职责**: 提供所有服务共享的工具类和通用组件。

**核心组件**:
- `Result<T>`: 统一 API 返回格式

```java
/**
 * 统一返回结果封装类
 * 
 * 所有 API 接口都使用此类封装返回结果，确保返回格式一致。
 * 
 * @param <T> 数据类型
 * 
 * 返回格式:
 * {
 *   "code": 200,      // 状态码，200 表示成功
 *   "message": "success", // 状态描述
 *   "data": {}        // 业务数据
 * }
 */
@Data
public class Result<T> implements Serializable {
    private int code;       // 状态码
    private String message; // 状态描述
    private T data;         // 业务数据
    
    // 成功返回（无数据）
    public static <T> Result<T> success() { ... }
    
    // 成功返回（有数据）
    public static <T> Result<T> success(T data) { ... }
    
    // 失败返回
    public static <T> Result<T> error(String message) { ... }
}
```

---

### 5.2 movie-gateway (API 网关)

**职责**: 统一入口、路由转发、跨域处理。

**配置说明**:
- 端口: 8080
- 路由规则: 根据路径前缀转发到对应服务
- 跨域: 允许所有来源

**路由规则**:
```
/api/auth/**, /api/users/**     → user-service (8081)
/api/series/**, /api/episodes/** → series-service (8082)
/api/danmakus/**, /api/videos/** → danmaku-service (8083)
/api/discussions/**              → discussion-service (8084)
/api/crawler/**                  → crawler-service (8085)
/api/files/**                    → file-service (8086)
```

---

### 5.3 movie-user (用户服务)

**职责**: 用户注册、登录、权限管理。

**核心功能**:
1. 用户注册 (POST /api/auth/register)
2. 用户登录 (POST /api/auth/login)
3. 获取用户信息 (GET /api/users/{id})
4. 更新用户信息 (PUT /api/users/{id})
5. 修改用户角色 (PUT /api/users/{id}/role)

**数据模型**:
```java
/**
 * 用户实体类
 * 
 * 对应数据库表: sys_user
 * 存储用户基本信息、认证信息、权限角色
 */
@Entity
@Table(name = "sys_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;              // 用户ID，自增主键
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;      // 用户名，唯一，不可为空
    
    @Column(nullable = false)
    private String password;      // 密码，BCrypt 加密存储
    
    @Column(length = 100)
    private String email;         // 邮箱，可选
    
    @Column(length = 50)
    private String nickname;      // 昵称，可选
    
    @Column(length = 500)
    private String avatar;        // 头像 URL，可选
    
    @Enumerated(EnumType.STRING)
    private Role role = Role.USER; // 角色：USER/EDITOR/ADMIN
    
    private Boolean isActive = true; // 账号是否启用
    
    @Column(columnDefinition = "TEXT")
    private String bio;           // 个人简介
    
    @CreationTimestamp
    private LocalDateTime createdAt; // 创建时间，自动填充
    
    @UpdateTimestamp
    private LocalDateTime updatedAt; // 更新时间，自动填充
}
```

**角色权限**:
```java
/**
 * 用户角色枚举
 * 
 * 定义系统中的用户角色及其权限
 */
public enum Role {
    USER("普通用户"),    // 基础权限：浏览、搜索
    EDITOR("编辑者"),    // 编辑权限：编辑影视剧、导入弹幕
    ADMIN("管理员");     // 管理权限：用户管理、数据删除
}
```

---

### 5.4 movie-series (影视服务)

**职责**: 影视剧、剧集、演职人员、更新时间表管理。

**核心功能**:
1. 影视剧 CRUD
2. 剧集管理
3. 演职人员管理
4. 分类筛选
5. 更新时间表

**数据模型**:

```java
/**
 * 影视剧实体类
 * 
 * 对应数据库表: series
 * 存储影视剧基本信息
 */
@Entity
@Table(name = "series")
public class Series {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;              // 影视剧ID
    
    @Column(nullable = false, length = 200)
    private String title;         // 标题
    
    @Column(name = "original_title", length = 200)
    private String originalTitle; // 原始标题（外语片名）
    
    @Column(columnDefinition = "TEXT")
    private String description;   // 简介
    
    @Column(name = "cover_url", length = 500)
    private String coverUrl;      // 封面 URL
    
    @Column(name = "backdrop_url", length = 500)
    private String backdropUrl;   // 背景图 URL
    
    @Column(nullable = false, length = 20)
    private String seriesType;    // 类型：MOVIE/TV_SERIES/ANIME/MUSIC/VARIETY/DOCUMENTARY
    
    @Column(length = 200)
    private String genres;        // 类型标签，JSON 数组
    
    @Column(length = 50)
    private String country;       // 国家/地区
    
    @Column(length = 50)
    private String language;      // 语言
    
    @Column(name = "release_date", length = 20)
    private String releaseDate;   // 上映日期
    
    private Integer year;         // 年份
    
    @Column(nullable = false, length = 20)
    private String status;        // 状态：AIRING/COMPLETED/UPCOMING
    
    private Double rating;        // 评分
    
    @Column(name = "rating_count")
    private Integer ratingCount = 0; // 评分人数
    
    private Double popularity = 0.0; // 热度
    
    @Column(length = 500)
    private String tags;          // 标签，JSON 数组
    
    @CreationTimestamp
    private LocalDateTime createdAt; // 创建时间
    
    @UpdateTimestamp
    private LocalDateTime updatedAt; // 更新时间
}
```

**分类主题配置**:
```java
/**
 * 分类主题配置
 * 
 * 定义每个分类的视觉风格
 * 用于前端展示不同分类的独特设计
 */
public enum CategoryThemeConfig {
    MOVIE("movie", "电影", "🎬", "#E50914", "#1a0000", "#4a0000", "film-grain", "cinema"),
    TV_SERIES("tv_series", "电视剧", "📺", "#FF6B35", "#1a0a00", "#4a1a00", "wave", "standard"),
    ANIME("anime", "动漫", "🎨", "#FF69B4", "#1a001a", "#4a004a", "sakura", "anime"),
    MUSIC("music", "音乐", "🎵", "#1DB954", "#001a0a", "#004a1a", "sound-wave", "album"),
    VARIETY("variety", "综艺", "🎭", "#FFD700", "#1a1a00", "#4a4a00", "spotlight", "bright"),
    DOCUMENTARY("documentary", "纪录片", "📹", "#4169E1", "#000a1a", "#001a4a", "film-strip", "minimal");
}
```

**更新时间表**:
```java
/**
 * 更新时间表实体类
 * 
 * 对应数据库表: update_schedules
 * 存储影视剧的更新时间信息
 * 用于展示热播剧集的更新日历
 */
@Entity
@Table(name = "update_schedules")
public class UpdateSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;              // 时间表ID
    
    @Column(name = "series_id", nullable = false)
    private Long seriesId;        // 关联影视剧ID
    
    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;  // 更新星期：MONDAY~SUNDAY
    
    @Column(name = "update_time", nullable = false, length = 10)
    private String updateTime;    // 更新时间，如 "20:00"
    
    private Integer episodeCount = 0; // 当前集数
    
    @Column(name = "season_info", length = 50)
    private String seasonInfo;    // 季信息，如 "第二季"
    
    @Column(length = 50)
    private String platform;      // 更新平台：bilibili/tencent/iqiyi
    
    @Column(length = 200)
    private String remark;        // 备注，如 "会员提前看"
    
    @Enumerated(EnumType.STRING)
    private ScheduleStatus status = ScheduleStatus.AIRING; // 状态
}
```

---

### 5.5 movie-danmaku (弹幕服务)

**职责**: 弹幕采集、存储、合并、实时推送。

**核心功能**:
1. 弹幕 CRUD
2. B站弹幕采集
3. 弹幕合并
4. WebSocket 实时推送
5. 弹幕统计

**弹幕数据模型**:
```java
/**
 * 弹幕实体类
 * 
 * 对应数据库表: danmakus
 * 存储弹幕信息，支持多平台来源
 */
@Entity
@Table(name = "danmakus")
public class DanmakuEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;              // 弹幕ID
    
    @Column(name = "video_id", nullable = false)
    private Long videoId;         // 关联视频ID
    
    @Column(nullable = false)
    private Double time;          // 弹幕出现时间（秒）
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;       // 弹幕内容
    
    @Column(name = "danmaku_type", nullable = false, length = 20)
    private String danmakuType;   // 类型：scroll/top/bottom/ltr
    
    @Column(nullable = false, length = 10)
    private String color;         // 颜色，如 "#ffffff"
    
    @Column(nullable = false, length = 50)
    private String source;        // 来源：bilibili/tencent/user
    
    @Column(name = "content_hash", nullable = false, length = 64)
    private String contentHash;   // 内容哈希，用于去重
}
```

**B站弹幕采集流程**:
```
1. 解析视频ID (BV/av/ss/ep)
2. 获取视频CID
3. 尝试 Protobuf 格式采集
4. 失败则回退到 XML 格式
5. 解析弹幕数据
6. 标准化为统一格式
7. 存储到数据库
```

**Protobuf 消息定义**:
```protobuf
// B站弹幕 Protobuf 定义
syntax = "proto3";
package bilibili.dm;

// 弹幕元素
message DanmakuElem {
    int64 id = 1;           // 弹幕ID
    int32 progress = 2;     // 出现位置（毫秒）
    int32 mode = 3;         // 类型：1-3普通 4底部 5顶部 6逆向
    int32 fontsize = 4;     // 字号
    uint32 color = 5;       // 颜色
    string midHash = 6;     // 发送者哈希
    string content = 7;     // 弹幕内容
    int64 ctime = 8;        // 发送时间
    int32 weight = 9;       // 权重（1-10）
    string action = 10;     // 动作
    int32 pool = 11;        // 弹幕池：0普通 1字幕 2特殊
    string idStr = 12;      // 弹幕ID字符串
    int32 attr = 13;        // 属性位
}

// 弹幕响应
message DmSegMobileReply {
    repeated DanmakuElem elems = 1; // 弹幕列表
    int32 state = 2;                 // 状态
}
```

---

### 5.6 movie-discussion (讨论服务)

**职责**: 讨论组管理、回复管理。

**核心功能**:
1. 创建讨论
2. 获取讨论列表
3. 发表回复
4. 置顶/锁定讨论

**数据模型**:
```java
/**
 * 讨论实体类
 * 
 * 对应数据库表: discussions
 * 存储讨论组信息
 */
@Entity
@Table(name = "discussions")
public class Discussion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;              // 讨论ID
    
    @Column(name = "series_id", nullable = false)
    private Long seriesId;        // 关联影视剧ID
    
    @Column(nullable = false, length = 200)
    private String title;         // 讨论标题
    
    @Column(columnDefinition = "TEXT")
    private String description;   // 讨论描述
    
    @Column(name = "creator_id", nullable = false)
    private Long creatorId;       // 创建者ID
    
    private Boolean isPinned = false;  // 是否置顶
    private Boolean isLocked = false;  // 是否锁定
    
    private Integer replyCount = 0;    // 回复数量
    
    @Column(name = "last_reply_at")
    private LocalDateTime lastReplyAt; // 最后回复时间
}
```

---

### 5.7 movie-crawler (采集服务)

**职责**: 多平台数据采集。

**核心功能**:
1. B站弹幕采集
2. XML 解析
3. Protobuf 解析

**采集接口**:
```java
/**
 * 弹幕提供者接口
 * 
 * 定义弹幕采集的抽象接口
 * 不同平台实现此接口
 */
public interface DanmakuProvider {
    String getName();                           // 获取提供者名称
    boolean supportsVideoId(String videoId);    // 是否支持该视频ID
    String parseVideoId(String input);          // 解析视频ID
    String getVideoCid(String videoId);         // 获取视频CID
    List<DanmakuDto> fetchDanmaku(String cid);  // 获取弹幕
}
```

---

### 5.8 movie-file (文件服务)

**职责**: 文件上传、存储。

**核心功能**:
1. 文件上传
2. 文件获取
3. 文件删除

---

## 6. 数据模型

### 6.1 数据库表结构

#### 用户表 (sys_user)
```sql
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,  -- 用户ID
    username VARCHAR(50) UNIQUE NOT NULL,  -- 用户名
    password VARCHAR(255) NOT NULL,        -- 密码（BCrypt加密）
    email VARCHAR(100),                    -- 邮箱
    nickname VARCHAR(50),                  -- 昵称
    avatar VARCHAR(500),                   -- 头像URL
    role VARCHAR(20) DEFAULT 'USER',       -- 角色
    is_active TINYINT DEFAULT 1,           -- 是否启用
    bio TEXT,                              -- 个人简介
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 影视剧表 (series)
```sql
CREATE TABLE series (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,           -- 标题
    original_title VARCHAR(200),           -- 原始标题
    description TEXT,                      -- 简介
    cover_url VARCHAR(500),                -- 封面URL
    backdrop_url VARCHAR(500),             -- 背景图URL
    series_type VARCHAR(20) NOT NULL,      -- 类型
    genres VARCHAR(200),                   -- 类型标签（JSON）
    country VARCHAR(50),                   -- 国家
    language VARCHAR(50),                  -- 语言
    release_date VARCHAR(20),              -- 上映日期
    year INT,                              -- 年份
    status VARCHAR(20) NOT NULL,           -- 状态
    rating DECIMAL(3,1),                   -- 评分
    rating_count INT DEFAULT 0,            -- 评分人数
    popularity DOUBLE DEFAULT 0,           -- 热度
    tags VARCHAR(500),                     -- 标签（JSON）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 剧集表 (episodes)
```sql
CREATE TABLE episodes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    series_id BIGINT NOT NULL,             -- 关联影视剧ID
    season_number INT DEFAULT 1,           -- 季数
    episode_number INT NOT NULL,           -- 集数
    title VARCHAR(200),                    -- 集标题
    description TEXT,                      -- 集简介
    cover_url VARCHAR(500),                -- 集封面
    duration INT,                          -- 时长（秒）
    air_date VARCHAR(20),                  -- 播出日期
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (series_id) REFERENCES series(id)
);
```

#### 更新时间表 (update_schedules)
```sql
CREATE TABLE update_schedules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    series_id BIGINT NOT NULL,             -- 关联影视剧ID
    day_of_week VARCHAR(10) NOT NULL,      -- 更新星期
    update_time VARCHAR(10) NOT NULL,      -- 更新时间
    episode_count INT DEFAULT 0,           -- 当前集数
    season_info VARCHAR(50),               -- 季信息
    platform VARCHAR(50),                  -- 更新平台
    remark VARCHAR(200),                   -- 备注
    status VARCHAR(20) DEFAULT 'AIRING',   -- 状态
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (series_id) REFERENCES series(id)
);
```

#### 弹幕表 (danmakus)
```sql
CREATE TABLE danmakus (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    video_id BIGINT NOT NULL,              -- 关联视频ID
    time DOUBLE NOT NULL,                  -- 弹幕时间（秒）
    content TEXT NOT NULL,                 -- 弹幕内容
    danmaku_type VARCHAR(20) NOT NULL,     -- 弹幕类型
    color VARCHAR(10) NOT NULL,            -- 颜色
    source VARCHAR(50) NOT NULL,           -- 来源
    content_hash VARCHAR(64) NOT NULL,     -- 内容哈希
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(video_id, content_hash, time)   -- 唯一约束，防止重复
);
```

#### 讨论表 (discussions)
```sql
CREATE TABLE discussions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    series_id BIGINT NOT NULL,             -- 关联影视剧ID
    title VARCHAR(200) NOT NULL,           -- 讨论标题
    description TEXT,                      -- 讨论描述
    creator_id BIGINT NOT NULL,            -- 创建者ID
    is_pinned TINYINT DEFAULT 0,           -- 是否置顶
    is_locked TINYINT DEFAULT 0,           -- 是否锁定
    reply_count INT DEFAULT 0,             -- 回复数量
    last_reply_at DATETIME,                -- 最后回复时间
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (series_id) REFERENCES series(id)
);
```

---

## 7. API 接口文档

### 7.1 用户服务 API

| 接口 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/auth/register` | POST | 用户注册 | 公开 |
| `/api/auth/login` | POST | 用户登录 | 公开 |
| `/api/users/{id}` | GET | 获取用户信息 | 登录 |
| `/api/users/{id}` | PUT | 更新用户信息 | 登录 |
| `/api/users/{id}/role` | PUT | 修改用户角色 | ADMIN |

### 7.2 影视服务 API

| 接口 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/series` | GET | 搜索影视剧 | 公开 |
| `/api/series/{id}` | GET | 获取详情 | 公开 |
| `/api/series` | POST | 创建影视剧 | EDITOR |
| `/api/series/{id}` | PUT | 更新影视剧 | EDITOR |
| `/api/series/{id}` | DELETE | 删除影视剧 | ADMIN |
| `/api/series/{id}/episodes` | GET | 获取剧集列表 | 公开 |
| `/api/series/{id}/episodes` | POST | 添加剧集 | EDITOR |
| `/api/series/{id}/cast` | GET | 获取演职人员 | 公开 |
| `/api/series/{id}/cast` | POST | 添加演职人员 | EDITOR |
| `/api/series/trending` | GET | 热门影视剧 | 公开 |
| `/api/series/latest` | GET | 最新影视剧 | 公开 |

### 7.3 分类 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/categories` | GET | 获取所有分类及主题 |
| `/api/categories/{type}/theme` | GET | 获取分类主题 |
| `/api/categories/{type}/series` | GET | 按分类筛选 |
| `/api/categories/{type}/trending` | GET | 分类热门 |
| `/api/categories/{type}/latest` | GET | 分类最新 |

### 7.4 更新时间表 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/schedules/today` | GET | 今日更新 |
| `/api/schedules/week` | GET | 本周更新表 |
| `/api/schedules/week/{day}` | GET | 指定星期更新 |
| `/api/schedules/series/{id}` | GET | 剧集更新时间 |
| `/api/schedules` | POST | 设置更新时间 |

### 7.5 弹幕服务 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/videos/{id}/danmakus` | GET | 获取视频弹幕 |
| `/api/videos/{id}/danmakus/range` | GET | 时间范围弹幕 |
| `/api/danmaku/fetch` | POST | 采集并保存弹幕 |
| `/api/videos/{id}/danmakus/import` | POST | 导入弹幕 |
| `/api/videos/{id}/danmakus` | DELETE | 删除弹幕 |

### 7.6 讨论服务 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/discussions/series/{id}` | GET | 获取讨论列表 |
| `/api/discussions/{id}` | GET | 获取讨论详情 |
| `/api/discussions` | POST | 创建讨论 |
| `/api/discussions/{id}/pin` | PUT | 置顶讨论 |
| `/api/discussions/{id}/lock` | PUT | 锁定讨论 |
| `/api/discussions/{id}/replies` | GET | 获取回复列表 |
| `/api/discussions/{id}/replies` | POST | 发表回复 |

### 7.7 采集服务 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/crawler/bilibili/{videoId}` | GET | 采集B站弹幕 |
| `/api/crawler/bilibili/supports/{videoId}` | GET | 检查视频ID支持 |

### 7.8 文件服务 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/files/upload` | POST | 上传文件 |
| `/api/files/{filename}` | GET | 获取文件 |
| `/api/files/{filename}` | DELETE | 删除文件 |

---

## 8. 前端设计

### 8.1 页面结构

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 热门推荐、分类导航、更新时间表 |
| `/category/[type]` | 分类页 | 分类瀑布流展示 |
| `/search` | 搜索页 | 搜索影视剧 |
| `/login` | 登录页 | 用户登录/注册 |
| `/profile` | 个人中心 | 个人资料 |
| `/series/[id]` | 详情页 | 影视详情、剧集、讨论 |
| `/admin` | 管理后台 | 管理面板 |

### 8.2 分类主题设计

| 分类 | 主色调 | 背景效果 | 卡片风格 |
|------|--------|----------|----------|
| 动漫 | #FF69B4 (粉色) | 樱花飘落 | 圆角、柔和阴影 |
| 电影 | #E50914 (红色) | 胶片颗粒 | 直角、硬朗阴影 |
| 音乐 | #1DB954 (绿色) | 声波律动 | 圆形封面、渐变 |
| 综艺 | #FFD700 (金色) | 聚光灯效 | 鲜艳、活泼 |
| 纪录片 | #4169E1 (蓝色) | 胶片条纹 | 简约、克制 |

### 8.3 核心组件

#### 瀑布流组件 (Waterfall)
```typescript
/**
 * 瀑布流布局组件
 * 
 * 功能：
 * - 自适应列数
 * - 无限滚动加载
 * - 平滑动画过渡
 */
interface WaterfallProps {
  items: Series[];           // 数据列表
  columns?: number;          // 列数，默认5
  gap?: number;              // 间距，默认16
  onLoadMore?: () => void;   // 加载更多回调
  hasMore?: boolean;         // 是否有更多数据
  loading?: boolean;         // 加载状态
}
```

#### 更新时间表组件 (UpdateSchedule)
```typescript
/**
 * 更新时间表组件
 * 
 * 功能：
 * - 显示今日/本周更新
 * - 按星期筛选
 * - 显示更新时间和平台
 */
```

#### 分类布局组件 (CategoryLayout)
```typescript
/**
 * 分类页面布局
 * 
 * 功能：
 * - 分类主题应用
 * - 瀑布流展示
 * - 筛选排序
 */
```

---

## 9. 部署指南

### 9.1 开发环境

**前置要求**:
- Java 17+
- Node.js 18+
- Maven 3.8+

**启动步骤**:

```bash
# 1. 启动前端
cd frontend
npm install
npm run dev

# 2. 启动后端（使用 dev profile，H2 内存数据库）
cd java-backend
mvn clean install -DskipTests

# 启动各个服务
java -jar movie-user/target/movie-user-1.0.0.jar --spring.profiles.active=dev
java -jar movie-series/target/movie-series-1.0.0.jar --spring.profiles.active=dev
java -jar movie-danmaku/target/movie-danmaku-1.0.0.jar
java -jar movie-discussion/target/movie-discussion-1.0.0.jar --spring.profiles.active=dev
java -jar movie-crawler/target/movie-crawler-1.0.0.jar --spring.profiles.active=dev
java -jar movie-file/target/movie-file-1.0.0.jar --spring.profiles.active=dev
```

### 9.2 生产环境

**前置要求**:
- Docker & Docker Compose
- MySQL 8.0
- Redis 7.x
- Nacos 2.3.x

**Docker Compose 部署**:
```yaml
version: '3.8'

services:
  nacos:
    image: nacos/nacos-server:v2.3.0
    ports:
      - "8848:8848"
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root
    volumes:
      - mysql-data:/var/lib/mysql
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql-data:
```

---

## 10. 开发指南

### 10.1 代码规范

**后端**:
- 使用 Lombok 减少样板代码
- 统一使用 `Result<T>` 封装返回结果
- 使用 JPA 注解定义实体
- 使用 `@Transactional` 管理事务

**前端**:
- 使用 TypeScript 进行类型检查
- 使用 Tailwind CSS 编写样式
- 使用 Framer Motion 实现动画
- 组件命名使用 PascalCase

### 10.2 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

### 10.3 分支策略

- `main`: 主分支，稳定版本
- `develop`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 紧急修复分支

---

## 附录

### A. 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `JAVA_HOME` | Java 安装路径 | - |
| `SPRING_PROFILES_ACTIVE` | Spring 激活的 profile | default |
| `SERVER_PORT` | 服务端口 | 见服务配置 |

### B. 常见问题

**Q: 服务启动失败怎么办？**
A: 检查端口是否被占用，检查数据库连接配置。

**Q: 如何切换到 MySQL？**
A: 修改 `application.yml` 中的数据源配置，移除 `--spring.profiles.active=dev` 参数。

**Q: 前端如何连接后端？**
A: 前端默认连接 `http://localhost:8080`（网关），可通过环境变量修改。

### C. 相关链接

- [Spring Boot 文档](https://spring.io/projects/spring-boot)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [B站 API 文档](https://github.com/SocialSisterYi/bilibili-API-collect)
