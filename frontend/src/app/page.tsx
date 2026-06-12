import { Header } from '@/components/layout/header'
import { SeriesCard } from '@/components/series/series-card'

// 模拟数据
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

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-deep">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-deep" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-4 gradient-text">
            影视数据平台
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            多平台影视数据聚合与弹幕服务
          </p>
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

      {/* Trending Section */}
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

      {/* Latest Section */}
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

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-muted">
          <p>© 2026 影视数据平台. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}