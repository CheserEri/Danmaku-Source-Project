# 影视数据平台 - 完整技术方案

## 📌 项目概述

**影视数据平台** - 多平台影视剧数据聚合与弹幕服务系统

### 核心功能

- 影视剧元数据聚合（标题、简介、封面、演职人员）
- 多平台弹幕采集（B站、腾讯、爱奇艺）
- 弹幕统一与合并（时间轴对齐、内容去重）
- 用户系统（登录注册、权限管理）
- 讨论组功能（用户讨论、管理员管理）

---

## 🏗️ 系统架构

### 整体架构图

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
└───────┬───────┘      └───────┬───────┘      └───────┬───────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│    MySQL      │      │    MySQL      │      │    MySQL      │
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
│ - 回复管理    │      │ - 腾讯采集    │      │ - 图片存储    │
│ - 置顶/锁定   │      │ - 定时任务    │      │ - CDN分发     │
└───────┬───────┘      └───────┬───────┘      └───────┬───────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│    MySQL      │      │    MySQL      │      │  MinIO/OSS    │
│   讨论库      │      │   采集库      │      │  文件存储     │
└───────────────┘      └───────────────┘      └───────────────┘

                    ┌───────────────┐      ┌───────────────┐
                    │  Nacos        │      │    Redis      │
                    │  注册中心     │      │    缓存       │
                    │  配置中心     │      │              │
                    └───────────────┘      └───────────────┘
```

---

## 🛠️ 技术栈

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Java** | 17 | 主语言 |
| **Spring Boot** | 3.2.x | 基础框架 |
| **Spring Cloud** | 2023.x | 微服务框架 |
| **Spring Cloud Alibaba** | 2023.x | 阿里巴巴微服务组件 |
| **Spring Security** | 6.x | 安全框架 |
| **MyBatis-Plus** | 3.5.x | ORM |
| **Nacos** | 2.3.x | 注册中心/配置中心 |
| **Spring Cloud Gateway** | 4.1.x | API网关 |
| **Sentinel** | 1.8.x | 限流熔断 |
| **MySQL** | 8.0 | 主数据库 |
| **Redis** | 7.x | 缓存/会话 |
| **MinIO** | 最新 | 文件存储 |
| **JWT** | 0.12.x | Token认证 |
| **MapStruct** | 1.5.x | 对象映射 |
| **Knife4j** | 4.4.x | API文档 |
| **Protobuf** | 3.x | B站弹幕解析 |
| **OkHttp** | 4.12.x | HTTP客户端 |

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 14.x | React框架 (SSR/SSG) |
| **React** | 18.x | UI库 |
| **TypeScript** | 5.x | 类型安全 |
| **Tailwind CSS** | 3.4.x | 样式框架 |
| **Framer Motion** | 11.x | 动画库 |
| **Zustand** | 4.x | 状态管理 |
| **TanStack Query** | 5.x | 数据请求 |
| **Lucide Icons** | 0.400.x | 图标库 |
| **Axios** | 1.x | HTTP客户端 |

### 基础设施

| 技术 | 用途 |
|------|------|
| **Docker** | 容器化 |
| **Nginx** | 反向代理 |
| **MinIO** | 对象存储 |

---

## 📦 微服务清单

| 服务名 | 端口 | 职责 | 数据库 |
|--------|------|------|--------|
| `gateway-service` | 8080 | API网关，路由/认证/限流 | - |
| `user-service` | 8081 | 用户注册/登录/权限 | user_db |
| `series-service` | 8082 | 影视剧/剧集/演职人员 | series_db |
| `danmaku-service` | 8083 | 弹幕CRUD/导入/合并 | danmaku_db |
| `discussion-service` | 8084 | 讨论组/回复 | discussion_db |
| `crawler-service` | 8085 | 多平台数据采集 | crawler_db |
| `file-service` | 8086 | 文件上传/存储 | - |

---

## 🗄️ 数据库设计

### 用户库 (user_db)

```sql
-- 用户表
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    nickname VARCHAR(50),
    avatar VARCHAR(500),
    role VARCHAR(20) DEFAULT 'USER',
    status TINYINT DEFAULT 1,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE sys_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    permission VARCHAR(50) NOT NULL,
    series_id BIGINT,
    granted_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
);

-- 用户操作日志
CREATE TABLE user_activity_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id BIGINT,
    details JSON,
    ip_address VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action)
);
```

### 影视库 (series_db)

```sql
-- 影视剧表
CREATE TABLE series (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    original_title VARCHAR(200),
    description TEXT,
    cover_url VARCHAR(500),
    backdrop_url VARCHAR(500),
    series_type VARCHAR(20),
    genres VARCHAR(200),
    country VARCHAR(50),
    language VARCHAR(50),
    release_date DATE,
    year INT,
    status VARCHAR(20),
    rating DECIMAL(3,1),
    rating_count INT DEFAULT 0,
    popularity DOUBLE DEFAULT 0,
    tags VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_type (series_type),
    INDEX idx_year (year),
    INDEX idx_rating (rating)
);

-- 剧集表
CREATE TABLE episode (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    series_id BIGINT NOT NULL,
    season_number INT DEFAULT 1,
    episode_number INT NOT NULL,
    title VARCHAR(200),
    description TEXT,
    cover_url VARCHAR(500),
    duration INT,
    air_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_series_id (series_id),
    UNIQUE KEY uk_series_episode (series_id, season_number, episode_number)
);

-- 演职人员表
CREATE TABLE person (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    original_name VARCHAR(100),
    avatar_url VARCHAR(500),
    biography TEXT,
    birthday DATE,
    place_of_birth VARCHAR(200)
);

-- 影视剧-人员关联表
CREATE TABLE series_cast (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    series_id BIGINT NOT NULL,
    person_id BIGINT NOT NULL,
    role VARCHAR(100),
    cast_type VARCHAR(20) NOT NULL,
    sort_order INT DEFAULT 0,
    INDEX idx_series_id (series_id),
    INDEX idx_person_id (person_id)
);

-- 平台表
CREATE TABLE platform (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    base_url VARCHAR(200),
    icon_url VARCHAR(500)
);

-- 影视剧-平台关联表
CREATE TABLE series_platform (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    series_id BIGINT NOT NULL,
    platform_id BIGINT NOT NULL,
    platform_series_id VARCHAR(100),
    platform_url VARCHAR(500),
    is_available TINYINT DEFAULT 1,
    INDEX idx_series_id (series_id),
    INDEX idx_platform_id (platform_id)
);
```

### 弹幕库 (danmaku_db)

```sql
-- 弹幕表
CREATE TABLE danmaku (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    episode_id BIGINT NOT NULL,
    time DECIMAL(10,3) NOT NULL,
    source_time DECIMAL(10,3),
    content VARCHAR(500) NOT NULL,
    danmaku_type VARCHAR(20) DEFAULT 'scroll',
    color VARCHAR(10) DEFAULT '#ffffff',
    font_size INT DEFAULT 25,
    source VARCHAR(20) NOT NULL,
    source_id VARCHAR(100),
    user_id BIGINT,
    user_hash VARCHAR(100),
    is_local TINYINT DEFAULT 0,
    is_merged TINYINT DEFAULT 0,
    merge_group VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_episode_time (episode_id, time),
    INDEX idx_source (source),
    INDEX idx_merge_group (merge_group)
);

-- 导入记录表
CREATE TABLE import_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    episode_id BIGINT NOT NULL,
    platform VARCHAR(20),
    platform_id VARCHAR(100),
    imported_count INT DEFAULT 0,
    duplicate_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    INDEX idx_episode_id (episode_id)
);

-- 平台时间偏移表
CREATE TABLE platform_time_offset (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    episode_id BIGINT NOT NULL,
    platform VARCHAR(20) NOT NULL,
    offset_seconds DECIMAL(10,3) DEFAULT 0,
    offset_type VARCHAR(20) DEFAULT 'manual',
    confidence DECIMAL(3,2) DEFAULT 1.00,
    matched_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_episode_platform (episode_id, platform)
);

-- 弹幕匹配记录表
CREATE TABLE danmaku_match (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    danmaku_id_1 BIGINT NOT NULL,
    danmaku_id_2 BIGINT NOT NULL,
    similarity DECIMAL(3,2) NOT NULL,
    match_type VARCHAR(20) NOT NULL,
    time_diff DECIMAL(10,3),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_danmaku_1 (danmaku_id_1),
    INDEX idx_danmaku_2 (danmaku_id_2)
);
```

### 讨论库 (discussion_db)

```sql
-- 讨论组表
CREATE TABLE discussion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    series_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    creator_id BIGINT NOT NULL,
    is_pinned TINYINT DEFAULT 0,
    is_locked TINYINT DEFAULT 0,
    reply_count INT DEFAULT 0,
    last_reply_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_series_id (series_id),
    INDEX idx_creator_id (creator_id)
);

-- 讨论回复表
CREATE TABLE discussion_reply (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    discussion_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    parent_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    INDEX idx_discussion_id (discussion_id),
    INDEX idx_user_id (user_id)
);
```

---

## 🔐 认证授权

### 角色权限模型

```java
public enum Role {
    USER("普通用户", new String[]{
        "series:read",
        "danmaku:read",
        "danmaku:send",
        "discussion:read",
        "discussion:create"
    }),
    
    EDITOR("编辑者", new String[]{
        "series:read",
        "series:edit",
        "series:upload_cover",
        "danmaku:read",
        "danmaku:send",
        "danmaku:import",
        "discussion:read",
        "discussion:create",
        "discussion:moderate"
    }),
    
    ADMIN("管理员", new String[]{
        "series:read",
        "series:edit",
        "series:delete",
        "series:upload_cover",
        "danmaku:read",
        "danmaku:send",
        "danmaku:import",
        "danmaku:delete",
        "discussion:read",
        "discussion:create",
        "discussion:moderate",
        "discussion:delete",
        "user:read",
        "user:edit",
        "user:manage_role"
    });
}
```

### JWT Token流程

```
客户端                      网关                      用户服务
   │                         │                          │
   │── POST /auth/login ────►│                          │
   │                         │── 转发 ─────────────────►│
   │                         │                          │── 验证密码
   │                         │                          │── 生成JWT
   │                         │◄── 返回token ────────────│
   │◄── 返回token ──────────│                          │
   │                         │                          │
   │── GET /api/series ─────►│                          │
   │   Authorization: Bearer │                          │
   │                         │── 验证token ─────────────│
   │                         │── 解析用户/权限 ─────────│
   │                         │── 转发请求 ──────────────►│
   │                         │                          │
   │◄── 返回数据 ───────────│◄── 返回数据 ─────────────│
```

---

## 📡 API设计

### 网关路由配置

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/auth/**, /api/users/**
          
        - id: series-service
          uri: lb://series-service
          predicates:
            - Path=/api/series/**, /api/episodes/**, /api/persons/**
          
        - id: danmaku-service
          uri: lb://danmaku-service
          predicates:
            - Path=/api/danmakus/**
          
        - id: discussion-service
          uri: lb://discussion-service
          predicates:
            - Path=/api/discussions/**
          
        - id: file-service
          uri: lb://file-service
          predicates:
            - Path=/api/files/**
```

### 用户服务API

| 接口 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/auth/register` | POST | 用户注册 | 公开 |
| `/api/auth/login` | POST | 用户登录 | 公开 |
| `/api/auth/logout` | POST | 用户登出 | 登录 |
| `/api/users/me` | GET | 获取当前用户 | 登录 |
| `/api/users/me` | PUT | 更新个人信息 | 登录 |
| `/api/users/{id}` | GET | 获取用户信息 | 登录 |
| `/api/users/{id}/role` | PUT | 修改用户角色 | ADMIN |
| `/api/users` | GET | 用户列表 | ADMIN |

### 影视服务API

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
| `/api/series/{id}/cover` | POST | 上传封面 | EDITOR |
| `/api/series/trending` | GET | 热门影视剧 | 公开 |
| `/api/series/latest` | GET | 最新影视剧 | 公开 |

### 弹幕服务API

| 接口 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/danmakus/episode/{id}` | GET | 获取剧集弹幕 | 公开 |
| `/api/danmakus/episode/{id}/range` | GET | 时间范围弹幕 | 公开 |
| `/api/danmakus/episode/{id}/merged` | GET | 获取合并弹幕 | 公开 |
| `/api/danmakus/episode/{id}` | POST | 发送弹幕 | 登录 |
| `/api/danmakus/import` | POST | 导入弹幕 | EDITOR |
| `/api/danmakus/merge` | POST | 合并弹幕 | EDITOR |
| `/api/danmakus/episode/{id}/offset` | POST | 设置时间偏移 | EDITOR |

### 讨论服务API

| 接口 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/discussions/series/{id}` | GET | 获取讨论列表 | 公开 |
| `/api/discussions/{id}` | GET | 获取讨论详情 | 公开 |
| `/api/discussions` | POST | 创建讨论 | 登录 |
| `/api/discussions/{id}/replies` | GET | 获取回复列表 | 公开 |
| `/api/discussions/{id}/replies` | POST | 发表回复 | 登录 |
| `/api/discussions/{id}/pin` | PUT | 置顶讨论 | MODERATOR |
| `/api/discussions/{id}/lock` | PUT | 锁定讨论 | MODERATOR |

### 文件服务API

| 接口 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/api/files/upload` | POST | 上传文件 | EDITOR |
| `/api/files/{id}` | GET | 获取文件 | 公开 |
| `/api/files/{id}` | DELETE | 删除文件 | ADMIN |

---

## 🎨 前端设计

### 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 热门推荐、最新更新 |
| `/search` | 搜索页 | 搜索影视剧 |
| `/login` | 登录页 | 用户登录/注册 |
| `/profile` | 个人中心 | 片单、弹幕、讨论 |
| `/series/[id]` | 详情页 | 影视信息、剧集、讨论组 |
| `/watch/[id]` | 播放页 | 视频播放、弹幕 |
| `/admin` | 管理后台 | 管理面板 |
| `/admin/users` | 用户管理 | 用户提权、禁用 |
| `/admin/series` | 影视管理 | 影视剧数据管理 |
| `/admin/discussions` | 讨论管理 | 讨论组管理 |

### 设计风格

- **深空黑主题** - 星空紫蓝主色调
- **玻璃态效果** - 毛玻璃 + 光影层次
- **流体动画** - Framer Motion
- **响应式设计** - 移动端适配

---

## 🚀 部署方案

### Docker Compose

```yaml
version: '3.8'

services:
  # 基础设施
  nacos:
    image: nacos/nacos-server:v2.3.0
    ports:
      - "8848:8848"
      - "9848:9848"
    environment:
      - MODE=standalone
  
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=root
    volumes:
      - mysql-data:/var/lib/mysql
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=admin
      - MINIO_ROOT_PASSWORD=admin123
    command: server /data --console-address ":9001"
  
  # 微服务
  gateway:
    build: ./movie-gateway
    ports:
      - "8080:8080"
    depends_on:
      - nacos
  
  user-service:
    build: ./movie-user
    ports:
      - "8081:8081"
    depends_on:
      - nacos
      - mysql
      - redis
  
  series-service:
    build: ./movie-series
    ports:
      - "8082:8082"
    depends_on:
      - nacos
      - mysql
  
  danmaku-service:
    build: ./movie-danmaku
    ports:
      - "8083:8083"
    depends_on:
      - nacos
      - mysql
  
  # 前端
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - gateway

volumes:
  mysql-data:
```

### 启动顺序

```bash
# 1. 启动基础设施
docker-compose up -d nacos mysql redis minio

# 2. 启动微服务
docker-compose up -d gateway user-service series-service danmaku-service

# 3. 启动前端
docker-compose up -d frontend
```

---

## 📁 项目结构

```
Danmaku-Source-Project-main/
├── TECH_STACK.md                    # 本文档
├── DESIGN.md                        # 后端设计文档
├── FRONTEND.md                      # 前端设计文档
├── MICROSERVICES.md                 # 微服务架构文档
│
├── java-backend/                    # Java后端
│   ├── pom.xml                      # 父POM
│   ├── movie-common/                # 公共模块
│   ├── movie-user/                  # 用户服务
│   └── movie-danmaku/               # 弹幕服务
│
└── frontend/                        # Next.js前端
    ├── package.json
    ├── src/
    │   ├── app/                     # 页面
    │   ├── components/              # 组件
    │   ├── hooks/                   # Hooks
    │   ├── lib/                     # 工具函数
    │   ├── stores/                  # 状态管理
    │   └── types/                   # 类型定义
    └── public/                      # 静态资源
```

---

## 📊 开发阶段

### 第一阶段：基础搭建 ✅

- [x] 项目架构设计
- [x] 微服务拆分
- [x] 数据库设计
- [x] API设计

### 第二阶段：核心服务

- [ ] 用户服务开发
- [ ] 影视服务开发
- [ ] 弹幕服务开发
- [ ] API网关配置

### 第三阶段：业务功能

- [ ] 弹幕采集（B站、腾讯）
- [ ] 弹幕合并功能
- [ ] 讨论组功能
- [ ] 文件上传服务

### 第四阶段：前端开发

- [ ] 页面框架搭建
- [ ] 搜索功能
- [ ] 详情页
- [ ] 播放页
- [ ] 管理后台

### 第五阶段：测试部署

- [ ] 单元测试
- [ ] 集成测试
- [ ] Docker部署
- [ ] 性能优化

---

## 💡 核心创新点

### 1. 多平台弹幕聚合

- 统一不同平台的弹幕格式
- 时间轴自动对齐
- 内容去重合并

### 2. 弹幕数据资产化

- 弹幕持久化存储
- 弹幕搜索引擎
- 弹幕数据分析

### 3. 权限精细化管理

- 基于角色的权限控制
- 特定番剧的细粒度权限
- 操作日志审计

### 4. 开放API服务

- 标准化REST接口
- WebSocket实时推送
- 第三方接入支持