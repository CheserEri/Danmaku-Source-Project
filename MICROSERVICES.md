# 影视数据平台 - 微服务架构设计

## 🏗️ 微服务拆分

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              客户端                                      │
│                     Next.js Web / Mobile App                            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API Gateway                                   │
│                        (Spring Cloud Gateway)                          │
│                    路由 / 认证 / 限流 / 熔断                            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  用户服务     │      │  影视服务     │      │  弹幕服务     │
│  user-service │      │ series-service│      │danmaku-service│
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
│discussion-svc │      │crawler-service│      │ file-service  │
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

                    ┌───────────────┐
                    │  Nacos        │
                    │  注册中心     │
                    │  配置中心     │
                    └───────────────┘
```

---

## 📦 微服务清单

| 服务名 | 端口 | 职责 |
|--------|------|------|
| `gateway-service` | 8080 | API网关，路由/认证/限流 |
| `user-service` | 8081 | 用户注册/登录/权限 |
| `series-service` | 8082 | 影视剧/剧集/演职人员 |
| `danmaku-service` | 8083 | 弹幕CRUD/导入/合并 |
| `discussion-service` | 8084 | 讨论组/回复 |
| `crawler-service` | 8085 | 多平台数据采集 |
| `file-service` | 8086 | 文件上传/存储 |
| `nacos` | 8848 | 注册中心/配置中心 |

---

## 🛠️ 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| Spring Boot | 3.2.x | 基础框架 |
| Spring Cloud | 2023.x | 微服务框架 |
| Spring Cloud Alibaba | 2023.x | 阿里巴巴微服务组件 |
| Spring Security | 6.x | 安全框架 |
| MyBatis-Plus | 3.5.x | ORM |
| Nacos | 2.3.x | 注册中心/配置中心 |
| Spring Cloud Gateway | 4.1.x | API网关 |
| Sentinel | 1.8.x | 限流熔断 |

### 数据存储

| 技术 | 用途 |
|------|------|
| MySQL 8.0 | 主数据库 |
| Redis | 缓存/会话 |
| MinIO | 文件存储 |

### 工具库

| 技术 | 用途 |
|------|------|
| JWT | Token认证 |
| MapStruct | 对象映射 |
| Knife4j | API文档 |
| Protobuf | B站弹幕解析 |
| OkHttp | HTTP客户端 |

---

## 📁 项目结构

```
movie-data-platform/
├── pom.xml                          # 父POM
│
├── movie-gateway/                   # API网关
│   ├── pom.xml
│   └── src/main/java/
│       └── com/movie/gateway/
│
├── movie-user/                      # 用户服务
│   ├── pom.xml
│   └── src/main/java/
│       └── com/movie/user/
│           ├── controller/
│           ├── service/
│           ├── mapper/
│           └── entity/
│
├── movie-series/                    # 影视服务
│   ├── pom.xml
│   └── src/main/java/
│       └── com/movie/series/
│
├── movie-danmaku/                   # 弹幕服务
│   ├── pom.xml
│   └── src/main/java/
│       └── com/movie/danmaku/
│
├── movie-discussion/                # 讨论服务
│   ├── pom.xml
│   └── src/main/java/
│       └── com/movie/discussion/
│
├── movie-crawler/                   # 采集服务
│   ├── pom.xml
│   └── src/main/java/
│       └── com/movie/crawler/
│
├── movie-file/                      # 文件服务
│   ├── pom.xml
│   └── src/main/java/
│       └── com/movie/file/
│
└── movie-common/                    # 公共模块
    ├── pom.xml
    └── src/main/java/
        └── com/movie/common/
            ├── result/              # 统一返回
            ├── exception/           # 异常处理
            ├── utils/               # 工具类
            └── config/              # 公共配置
```

---

## 🔐 认证授权

### JWT Token流程

```
客户端                          网关                        用户服务
   │                             │                            │
   │── POST /auth/login ────────►│                            │
   │                             │── 转发到user-service ─────►│
   │                             │                            │
   │                             │◄── 返回JWT token ──────────│
   │◄── 返回token ──────────────│                            │
   │                             │                            │
   │── GET /api/series ─────────►│                            │
   │   Authorization: Bearer xxx │                            │
   │                             │── 验证token ───────────────│
   │                             │── 解析用户信息 ────────────│
   │                             │── 转发请求 ────────────────►│
   │                             │                            │
   │◄── 返回数据 ───────────────│◄── 返回数据 ───────────────│
```

### 权限模型

```java
public enum Role {
    USER("普通用户", new String[]{"read"}),
    EDITOR("编辑者", new String[]{"read", "edit_series", "upload_cover"}),
    ADMIN("管理员", new String[]{"read", "edit_series", "upload_cover", "manage_users", "manage_all"});
    
    private final String label;
    private final String[] permissions;
}
```

---

## 📡 API设计

### 网关路由

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
            - Path=/api/series/**, /api/episodes/**
          
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

### 服务间调用

```java
@FeignClient(name = "series-service")
public interface SeriesClient {
    
    @GetMapping("/internal/series/{id}")
    SeriesVO getSeries(@PathVariable Long id);
    
    @PostMapping("/internal/series/batch")
    List<SeriesVO> getSeriesBatch(@RequestBody List<Long> ids);
}
```

---

## 🗄️ 数据库设计

### 用户服务 (user_db)

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 影视服务 (series_db)

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
    year INT,
    status VARCHAR(20),
    rating DECIMAL(3,1),
    rating_count INT DEFAULT 0,
    popularity DOUBLE DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 剧集表
CREATE TABLE episode (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    series_id BIGINT NOT NULL,
    season_number INT DEFAULT 1,
    episode_number INT NOT NULL,
    title VARCHAR(200),
    duration INT,
    air_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 弹幕服务 (danmaku_db)

```sql
-- 弹幕表
CREATE TABLE danmaku (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    episode_id BIGINT NOT NULL,
    time DECIMAL(10,3) NOT NULL,
    content VARCHAR(500) NOT NULL,
    danmaku_type VARCHAR(20) DEFAULT 'scroll',
    color VARCHAR(10) DEFAULT '#ffffff',
    font_size INT DEFAULT 25,
    source VARCHAR(20),
    source_id VARCHAR(100),
    user_id BIGINT,
    is_local TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_episode_time (episode_id, time)
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 快速开始

### 1. 启动基础设施

```bash
# 启动Nacos
docker run -d --name nacos -p 8848:8848 -p 9848:9848 nacos/nacos-server:v2.3.0

# 启动MySQL
docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0

# 启动Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### 2. 启动微服务

```bash
# 启动网关
cd movie-gateway && mvn spring-boot:run

# 启动用户服务
cd movie-user && mvn spring-boot:run

# 启动影视服务
cd movie-series && mvn spring-boot:run

# 启动弹幕服务
cd movie-danmaku && mvn spring-boot:run
```

### 3. 访问服务

| 服务 | 地址 |
|------|------|
| API网关 | http://localhost:8080 |
| Nacos控制台 | http://localhost:8848/nacos |
| API文档 | http://localhost:8080/doc.html |