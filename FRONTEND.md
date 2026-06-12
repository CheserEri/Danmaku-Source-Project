# 影视数据平台 - 前端设计文档

## 🎨 设计理念

### 核心美学

**「光影流转，沉浸无界」**

- **电影级质感** - 深邃暗调、光影层次、胶片颗粒感
- **流体动画** - 丝滑过渡、自然缓动、物理反馈
- **极简主义** - 留白呼吸、信息层次、视觉焦点
- **沉浸体验** - 全屏沉浸、无干扰界面、内容为王

---

## 🌈 视觉系统

### 色彩体系

```css
:root {
  /* ═══ 主色系 - 星空紫蓝 ═══ */
  --primary-50: #f0f0ff;
  --primary-100: #e0e0ff;
  --primary-200: #c7c7fe;
  --primary-300: #a5a5fc;
  --primary-400: #8b85f8;
  --primary-500: #7c6cf1;  /* 主色 */
  --primary-600: #6d50e6;
  --primary-700: #5e3ed4;
  --primary-800: #4d32b0;
  --primary-900: #3f2b8d;
  
  /* ═══ 背景系 - 深空黑 ═══ */
  --bg-void: #050510;        /* 最深 */
  --bg-deep: #0a0a1a;        /* 主背景 */
  --bg-surface: #12122a;     /* 卡片 */
  --bg-elevated: #1a1a3e;    /* 悬浮 */
  --bg-overlay: rgba(10, 10, 26, 0.85);  /* 遮罩 */
  
  /* ═══ 玻璃态 ═══ */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  
  /* ═══ 文字系 ═══ */
  --text-bright: #f8fafc;    /* 标题 */
  --text-primary: #e2e8f0;   /* 正文 */
  --text-secondary: #94a3b8; /* 次要 */
  --text-muted: #475569;     /* 弱化 */
  
  /* ═══ 强调色 ═══ */
  --accent-gold: #fbbf24;    /* 评分/星级 */
  --accent-amber: #f59e0b;   /* 热门 */
  --accent-emerald: #34d399; /* 在线/成功 */
  --accent-rose: #fb7185;    /* 高能/热门 */
  --accent-sky: #38bdf8;     /* 信息/链接 */
  --accent-violet: #a78bfa;  /* 特殊标记 */
  
  /* ═══ 渐变系 ═══ */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-warm: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --gradient-cool: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --gradient-dark: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%);
  
  /* ═══ 弹幕色 ═══ */
  --danmaku-white: rgba(255, 255, 255, 0.95);
  --danmaku-cyan: #00ffff;
  --danmaku-lime: #00ff00;
  --danmaku-pink: #ff69b4;
  --danmaku-gold: #ffd700;
}
```

### 字体系统

```css
/* 优雅字体栈 */
--font-display: 'SF Pro Display', 'Inter', system-ui, sans-serif;
--font-body: 'SF Pro Text', 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* 字体大小 - 模块化缩放 */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
--text-hero: 5rem;     /* 80px - 首页大标题 */
```

### 圆角系统

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.5rem;    /* 24px */
--radius-full: 9999px;   /* 全圆 */
```

### 阴影系统

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
--shadow-glow: 0 0 20px rgba(124, 108, 241, 0.3);
--shadow-glow-lg: 0 0 40px rgba(124, 108, 241, 0.4);
```

---

## ✨ 动画系统

### 缓动函数

```css
/* 自然缓动 */
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* 弹性缓动 */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

/* 电影级缓动 */
--ease-cinematic: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-dramatic: cubic-bezier(0.6, -0.28, 0.735, 0.045);
```

### 时长系统

```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-dramatic: 800ms;
--duration-cinematic: 1200ms;
```

### 核心动画

#### 1. 页面入场 - 幕布升起

```css
@keyframes curtain-rise {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

.page-enter {
  animation: curtain-rise var(--duration-cinematic) var(--ease-cinematic);
}
```

#### 2. 卡片悬浮 - 光影浮现

```css
@keyframes card-hover-glow {
  0% {
    box-shadow: var(--shadow-md);
  }
  50% {
    box-shadow: var(--shadow-glow-lg);
  }
  100% {
    box-shadow: var(--shadow-glow);
  }
}

.series-card {
  transition: all var(--duration-normal) var(--ease-smooth);
}

.series-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-glow);
  border-color: var(--glass-border);
}

.series-card:hover .card-image {
  transform: scale(1.08);
  filter: brightness(1.1) contrast(1.05);
}

.series-card:hover .card-overlay {
  opacity: 1;
  backdrop-filter: blur(20px);
}
```

#### 3. 文字渐显 - 墨迹晕染

```css
@keyframes text-reveal {
  0% {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.text-reveal {
  animation: text-reveal var(--duration-slow) var(--ease-out) both;
}

/* 逐字延迟 */
.text-reveal-delay-1 { animation-delay: 100ms; }
.text-reveal-delay-2 { animation-delay: 200ms; }
.text-reveal-delay-3 { animation-delay: 300ms; }
```

#### 4. 弹幕流动 - 星河流淌

```css
@keyframes danmaku-scroll {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  95% {
    opacity: 1;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
}

@keyframes danmaku-fade-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

.danmaku-item {
  animation: danmaku-fade-in var(--duration-fast) var(--ease-spring);
  will-change: transform, opacity;
}
```

#### 5. 评分展现 - 星辰点亮

```css
@keyframes star-pulse {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.2);
    filter: brightness(1.3) drop-shadow(0 0 8px var(--accent-gold));
  }
}

.rating-star {
  animation: star-pulse 2s var(--ease-smooth) infinite;
}

.rating-star:nth-child(2) { animation-delay: 0.2s; }
.rating-star:nth-child(3) { animation-delay: 0.4s; }
.rating-star:nth-child(4) { animation-delay: 0.6s; }
.rating-star:nth-child(5) { animation-delay: 0.8s; }
```

#### 6. 加载动效 - 光粒子汇聚

```css
@keyframes particle-converge {
  0% {
    transform: translate(var(--x), var(--y)) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-surface) 25%,
    var(--bg-elevated) 50%,
    var(--bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

#### 7. 模态弹出 - 光圈扩散

```css
@keyframes modal-enter {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

@keyframes overlay-enter {
  0% {
    opacity: 0;
    backdrop-filter: blur(0);
  }
  100% {
    opacity: 1;
    backdrop-filter: blur(20px);
  }
}

.modal {
  animation: modal-enter var(--duration-slow) var(--ease-spring);
}

.modal-overlay {
  animation: overlay-enter var(--duration-normal) var(--ease-smooth);
}
```

#### 8. 页面切换 - 胶片转场

```css
@keyframes film-strip {
  0% {
    clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  }
  100% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}

@keyframes fade-slide-up {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-transition-enter {
  animation: fade-slide-up var(--duration-dramatic) var(--ease-cinematic);
}
```

---

## 🏠 首页设计

### Hero Banner - 全屏沉浸

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │              全屏背景图 (动态模糊)                   │    │
│  │                                                     │    │
│  │    ┌──────────┐                                     │    │
│  │    │          │     ┌─────────────────────────┐     │    │
│  │    │  封面    │     │                         │     │    │
│  │    │  (3D    │     │    三  体                │     │    │
│  │    │  翻转)  │     │                         │     │    │
│  │    │          │     │    The Three-Body       │     │    │
│  │    └──────────┘     │    Problem              │     │    │
│  │                     │                         │     │    │
│  │                     │    ⭐ 8.7 · 2023 · 科幻  │     │    │
│  │                     │                         │     │    │
│  │                     │    ▶ 立即观看   📋 片单  │     │    │
│  │                     │                         │     │    │
│  │                     └─────────────────────────┘     │    │
│  │                                                     │    │
│  │                     ○ ○ ● ○ ○                       │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  渐变遮罩: 底部 → 深色过渡                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**动画细节：**
- 背景图缓慢缩放 (Ken Burns 效果)
- 封面 3D 翻转入场
- 标题逐字显现
- 评分星星依次点亮
- 按钮光晕脉动

### 内容区 - 流体布局

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ── 🔥 热门推荐 ─────────────────────────────────────── [→] │
│                                                             │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐        │
│  │       │ │       │ │       │ │       │ │       │        │
│  │ 封面  │ │ 封面  │ │ 封面  │ │ 封面  │ │ 封面  │        │
│  │       │ │       │ │       │ │       │ │       │        │
│  ├───────┤ ├───────┤ ├───────┤ ├───────┤ ├───────┤        │
│  │标题   │ │标题   │ │标题   │ │标题   │ │标题   │        │
│  │⭐ 8.7 │ │⭐ 9.0 │ │⭐ 8.5 │ │⭐ 8.8 │ │⭐ 9.2 │        │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘        │
│                                                             │
│  ── 🆕 最新更新 ─────────────────────────────────────── [→] │
│                                                             │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐        │
│  │       │ │       │ │       │ │       │ │       │        │
│  │ 封面  │ │ 封面  │ │ 封面  │ │ 封面  │ │ 封面  │        │
│  │       │ │       │ │       │ │       │ │       │        │
│  ├───────┤ ├───────┤ ├───────┤ ├───────┤ ├───────┤        │
│  │标题   │ │标题   │ │标题   │ │标题   │ │标题   │        │
│  │2023   │ │2023   │ │2023   │ │2023   │ │2023   │        │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**动画细节：**
- 卡片交错入场 (stagger)
- 水平滚动惯性滑动
- 悬浮卡片浮起 + 光晕
- 封面图懒加载渐显

---

## 📺 详情页设计

### 顶部 - 电影海报感

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │              背景大图 (视差滚动)                     │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │                                             │    │    │
│  │  │  渐变遮罩 (左→右, 深→透明)                  │    │    │
│  │  │                                             │    │    │
│  │  │  ┌────────┐   三  体                        │    │    │
│  │  │  │        │   The Three-Body Problem         │    │    │
│  │  │  │ 封面   │                                  │    │    │
│  │  │  │ (悬停  │   ⭐ 8.7 (12.5万人评分)          │    │    │
│  │  │  │  浮动) │                                  │    │    │
│  │  │  │        │   2023 · 中国大陆 · 科幻 · 剧情   │    │    │
│  │  │  └────────┘   共30集 · 每集45分钟             │    │    │
│  │  │                                             │    │    │
│  │  │   [▶ 立即观看]  [📥 导入弹幕]  [📋 加入片单]  │    │    │
│  │  │                                             │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 剧集列表 - 时间轴设计

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ── 剧集列表 ───────────────────────────────────────────── │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  ● ─────────────────────────────────────────────    │    │
│  │  │                                                  │    │
│  │  ├── E01  科学边界                    45m            │    │
│  │  │    ┌────────────────────────────────────────┐    │    │
│  │  │    │ 🔵 B站: 1,250  🟢 腾讯: 980  📊 合并: 1,850 │ │    │
│  │  │    └────────────────────────────────────────┘    │    │
│  │  │                                                  │    │
│  │  ├── E02  射手和农场主                42m            │    │
│  │  │    ┌────────────────────────────────────────┐    │    │
│  │  │    │ 🔵 B站: 1,100  🟢 腾讯: 850  📊 合并: 1,600 │ │    │
│  │  │    └────────────────────────────────────────┘    │    │
│  │  │                                                  │    │
│  │  └── E03  幽灵倒计时                  44m            │    │
│  │       ┌────────────────────────────────────────┐    │    │
│  │       │ 🔵 B站: 1,050  🟢 腾讯: 800  📊 合并: 1,500 │ │    │
│  │       └────────────────────────────────────────┘    │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**动画细节：**
- 时间轴线条逐渐延伸
- 剧集项交错入场
- 悬浮时展开详情面板
- 弹幕数量柱状图动画

---

## ▶️ 播放页设计

### 全屏播放器

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │                                                     │    │
│  │                    视频画面                         │    │
│  │                                                     │    │
│  │         ┌─────────────────────────────────┐         │    │
│  │         │ ← 前方高能                       │         │    │
│  │         │         太强了 →                 │         │    │
│  │         │                名场面 →          │         │    │
│  │         │ ← 泪目                          │         │    │
│  │         │                    三体人来了 →  │         │    │
│  │         └─────────────────────────────────┘         │    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  三体 · E01 · 科学边界                       │    │    │
│  │  ├─────────────────────────────────────────────┤    │    │
│  │  │                                             │    │    │
│  │  │  ════════════●═══════════════════════════  │    │    │
│  │  │  12:30 / 45:00                              │    │    │
│  │  │                                             │    │    │
│  │  │  [▶] [⏭] [🔊 ═══════] [⚙️] [💬] [⛶]        │    │    │
│  │  │                                             │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 弹幕控制面板 - 侧边抽屉

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────────────────────────────┐                      │
│  │                                  │                      │
│  │  ── 弹幕设置 ──                  │                      │
│  │                                  │                      │
│  │  显示弹幕          [━━━━●━━━]    │                      │
│  │                                  │                      │
│  │  ── 弹幕来源 ──                  │                      │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐    │                      │
│  │  │ B站 │ │腾讯│ │用户│ │全部│    │                      │
│  │  │ ✓  │ │ ✓ │ │ ✓ │ │ ✓ │    │                      │
│  │  └────┘ └────┘ └────┘ └────┘    │                      │
│  │                                  │                      │
│  │  ── 显示设置 ──                  │                      │
│  │  字体大小    [━━━━●━━━] 25px     │                      │
│  │  透明度      [━━━━━━●━] 80%     │                      │
│  │  显示区域    [全屏] [半屏]       │                      │
│  │  滚动速度    [━━●━━━━━] 慢       │                      │
│  │                                  │                      │
│  │  ── 时间偏移 ──                  │                      │
│  │  B站:   0.0s                    │                      │
│  │  腾讯: [━━●━━] 2.5s             │                      │
│  │                                  │                      │
│  │  [🔄 自动检测偏移]               │                      │
│  │                                  │                      │
│  │  ── 发送弹幕 ──                  │                      │
│  │  ┌────────────────────────┐     │                      │
│  │  │ 输入弹幕内容...        │     │                      │
│  │  └────────────────────────┘     │                      │
│  │  [颜色] [类型]         [发送]   │                      │
│  │                                  │                      │
│  └──────────────────────────────────┘                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**动画细节：**
- 面板滑入滑出
- 开关切换弹性动画
- 滑块拖拽实时反馈
- 发送按钮光晕脉动

---

## 🔍 搜索页设计

### 搜索体验

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │   🔍  ┌─────────────────────────────────────────┐   │    │
│  │       │ 输入影视剧名称、演员、导演...           │   │    │
│  │       └─────────────────────────────────────────┘   │    │
│  │                                                     │    │
│  │   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │    │
│  │   │ 全部 │ │ 电影 │ │ 电视剧│ │ 动漫 │ │ 综艺 │    │    │
│  │   └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │    │
│  │                                                     │    │
│  │   年份: [全部 ▼]  评分: [全部 ▼]  地区: [全部 ▼]   │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ── 找到 12 个结果 ─────────────────────────────────────── │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ┌────────┐                                         │    │
│  │  │        │  三体                                    │    │
│  │  │  封面  │  The Three-Body Problem                  │    │
│  │  │        │  ⭐ 8.7 · 2023 · 科幻 · 30集             │    │
│  │  └────────┘  根据刘慈欣同名小说改编...               │    │
│  │                                                     │    │
│  │  弹幕统计: 🔵 B站 15,000 · 🟢 腾讯 8,000 · 📊 合并 19,000 │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ┌────────┐                                         │    │
│  │  │        │  三体 (动画版)                           │    │
│  │  │  封面  │  The Three-Body Problem (Animation)      │    │
│  │  │        │  ⭐ 6.5 · 2024 · 科幻 · 26集             │    │
│  │  └────────┘                                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**动画细节：**
- 搜索框聚焦扩展
- 筛选标签点击弹性
- 结果列表交错入场
- 无结果时插画动画

---

## 🎭 特效系统

### 1. 玻璃态效果

```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

### 2. 光晕效果

```css
.glow-effect {
  position: relative;
}

.glow-effect::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: var(--gradient-primary);
  border-radius: inherit;
  z-index: -1;
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-smooth);
  filter: blur(10px);
}

.glow-effect:hover::before {
  opacity: 0.5;
}
```

### 3. 视差效果

```css
.parallax-container {
  perspective: 1000px;
  overflow: hidden;
}

.parallax-layer {
  transform-style: preserve-3d;
  transition: transform var(--duration-slow) var(--ease-smooth);
}

.parallax-container:hover .parallax-layer-back {
  transform: translateZ(-50px) scale(1.1);
}

.parallax-container:hover .parallax-layer-front {
  transform: translateZ(20px);
}
```

### 4. 噪点纹理

```css
.noise-overlay::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,...");
  opacity: 0.03;
  pointer-events: none;
  z-index: 9999;
}
```

### 5. 渐变边框

```css
.gradient-border {
  position: relative;
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: var(--gradient-primary);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

---

## 📱 响应式设计

### 移动端优化

```
┌─────────────────────┐
│  ☰  🔍 搜索        │
├─────────────────────┤
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │    封面       │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│  三体               │
│  ⭐ 8.7 · 2023      │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │    封面       │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│  狂飙               │
│  ⭐ 8.5 · 2023      │
│                     │
└─────────────────────┘
```

**移动端动画优化：**
- 减少复杂动画
- 使用 `prefers-reduced-motion`
- 优化触摸反馈
- 简化视差效果

---

## 🛠️ 技术栈

| 组件 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | SSR/SSG/RSC |
| 样式 | Tailwind CSS + CSS Modules | 原子化 + 作用域 |
| 组件库 | shadcn/ui + Radix | 可访问性 |
| 动画 | Framer Motion + GSAP | 物理动画 + 复杂时间线 |
| 状态 | Zustand + Jotai | 轻量级 + 原子化 |
| 数据 | TanStack Query | 缓存/同步/乐观更新 |
| 弹幕 | danmaku-anywhere | 开源弹幕引擎 |
| 播放器 | Vidstack | 现代播放器 |
| 图标 | Lucide + Phosphor | 丰富图标库 |
| 字体 | next/font | 字体优化 |

---

## 📁 项目结构

```
frontend/
├── public/
│   ├── fonts/
│   ├── images/
│   └── videos/
├── src/
│   ├── app/
│   │   ├── (home)/
│   │   │   └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── series/[id]/
│   │   │   └── page.tsx
│   │   ├── watch/[id]/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── sidebar.tsx
│   │   ├── series/
│   │   │   ├── series-card.tsx
│   │   │   ├── series-grid.tsx
│   │   │   └── series-hero.tsx
│   │   ├── danmaku/
│   │   │   ├── danmaku-renderer.tsx
│   │   │   ├── danmaku-controls.tsx
│   │   │   └── danmaku-import.tsx
│   │   └── player/
│   │       ├── video-player.tsx
│   │       ├── player-controls.tsx
│   │       └── player-overlay.tsx
│   ├── hooks/
│   │   ├── use-danmaku.ts
│   │   ├── use-player.ts
│   │   └── use-series.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── stores/
│   │   ├── player-store.ts
│   │   ├── danmaku-store.ts
│   │   └── user-store.ts
│   └── types/
│       ├── series.ts
│       ├── episode.ts
│       └── danmaku.ts
├── tailwind.config.ts
├── next.config.ts
└── package.json
```