/**
 * 首页组件
 * 
 * 功能:
 * - Hero 轮播区域
 * - 分类导航
 * - 更新时间表
 * - 热门推荐
 * - 最新更新
 * 
 * 布局结构:
 * 1. Hero 区域 - 大图轮播，展示精选内容
 * 2. 分类导航 - 快速跳转到各分类页面
 * 3. 更新时间表 - 今日/本周热播剧集更新
 * 4. 热门推荐 - 按热度排序的影视剧
 * 5. 最新更新 - 按创建时间排序的影视剧
 */

import { Header } from '@/components/layout/header'
import { SeriesCard } from '@/components/series/series-card'
import { UpdateSchedule } from '@/components/schedule/update-schedule'

/**
 * 模拟数据 - 热门推荐
 * 
 * 注意: 生产环境需要从 API 获取
 * API: GET /api/series/trending
 */
const trendingSeries = [
  {
    id: 1,
    title: '三体',
    series_type: 'tv_series' as const,
    genres: ['科幻', '剧情'],
    year: 2023,
    rating: 8.7,
    cover_url: '/placeholder.jpg',
    status: 'completed' as const,
  },
  {
    id: 2,
    title: '狂飙',
    series_type: 'tv_series' as const,
    genres: ['犯罪', '剧情'],
    year: 2023,
    rating: 8.5,
    cover_url: '/placeholder.jpg',
    status: 'completed' as const,
  },
  {
    id: 3,
    title: '漫长的季节',
    series_type: 'tv_series' as const,
    genres: ['悬疑', '剧情'],
    year: 2023,
    rating: 9.4,
    cover_url: '/placeholder.jpg',
    status: 'completed' as const,
  },
]

/**
 * 分类导航数据
 * 
 * 定义首页显示的分类入口
 */
const categories = [
  { type: 'anime', name: '动漫', icon: '🎨', color: 'from-pink-500 to-purple-500', count: 1250 },
  { type: 'movie', name: '电影', icon: '🎬', color: 'from-red-500 to-orange-500', count: 3420 },
  { type: 'music', name: '音乐', icon: '🎵', color: 'from-green-500 to-teal-500', count: 890 },
  { type: 'variety', name: '综艺', icon: '🎭', color: 'from-yellow-500 to-amber-500', count: 567 },
  { type: 'documentary', name: '纪录片', icon: '📹', color: 'from-blue-500 to-indigo-500', count: 432 },
]

/**
 * 首页组件
 * 
 * 渲染首页的所有内容区域
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-bg-deep">
      {/* 头部导航 */}
      <Header />

      {/* Hero 区域 */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-deep" />
        
        {/* 内容 */}
        <div className="relative z-10 text-center">
          {/* 标题 */}
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 gradient-text">
            影视数据平台
          </h1>
          {/* 描述 */}
          <p className="text-xl text-text-secondary mb-8">
            多平台影视数据聚合与弹幕服务
          </p>
          {/* 操作按钮 */}
          <div className="flex justify-center space-x-4">
            <a
              href="/search"
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 rounded-full font-medium transition-colors"
            >
              开始探索
            </a>
            <a
              href="/trending"
              className="px-8 py-3 border border-white/10 hover:border-white/20 rounded-full font-medium transition-colors"
            >
              热门推荐
            </a>
          </div>
        </div>
      </section>

      {/* 分类导航区域 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-display font-bold mb-8">📺 分类浏览</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <a
              key={category.type}
              href={`/category/${category.type}`}
              className="group relative overflow-hidden rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-xl"
            >
              {/* 渐变背景 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
              
              {/* 内容 */}
              <div className="relative z-10">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-bold mb-1">{category.name}</h3>
                <p className="text-sm text-text-muted">{category.count} 部作品</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 更新时间表区域 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <UpdateSchedule />
      </section>

      {/* 热门推荐区域 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold">🔥 热门推荐</h2>
          <a href="/trending" className="text-primary-400 hover:text-primary-300 transition-colors">
            查看更多 →
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {trendingSeries.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      </section>

      {/* 最新更新区域 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold">🆕 最新更新</h2>
          <a href="/latest" className="text-primary-400 hover:text-primary-300 transition-colors">
            查看更多 →
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {trendingSeries.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-muted">
          <p>© 2026 影视数据平台. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
