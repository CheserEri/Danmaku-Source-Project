'use client'

/**
 * 分类页面布局组件
 * 
 * 功能:
 * - 根据分类显示不同的主题风格
 * - 瀑布流展示该分类的影视剧
 * - 支持筛选排序
 * - 分类特有的视觉效果
 * 
 * 使用场景:
 * - /category/anime - 动漫分类
 * - /category/movie - 电影分类
 * - /category/music - 音乐分类
 * - /category/variety - 综艺分类
 * - /category/documentary - 纪录片分类
 * 
 * 使用示例:
 * <CategoryLayout category="ANIME" />
 */

import { useState, useEffect } from 'react'
import { Waterfall } from '@/components/series/waterfall'

/**
 * 分类主题配置接口
 * 定义分类的视觉风格
 */
interface CategoryTheme {
  code: string           // 分类代码
  name: string           // 分类名称
  icon: string           // 图标（Emoji）
  primaryColor: string   // 主色调（十六进制）
  gradientStart: string  // 渐变起始色
  gradientEnd: string    // 渐变结束色
  backgroundPattern: string // 背景图案
  cardStyle: string      // 卡片样式
  count: number          // 该分类的作品数量
}

/**
 * 影视剧数据接口
 */
interface Series {
  id: number
  title: string
  cover_url: string
  series_type: string
  rating: number
  status: string
  genres: string[]
  year: number
}

/**
 * 组件属性
 */
interface CategoryLayoutProps {
  category: string  // 分类代码：ANIME/MOVIE/MUSIC/VARIETY/DOCUMENTARY
}

/**
 * 分类渐变色配置
 * 每个分类对应不同的渐变背景色
 */
const CATEGORY_GRADIENTS: Record<string, string> = {
  ANIME: 'from-pink-500/20 to-purple-500/20',        // 动漫：粉色到紫色
  MOVIE: 'from-red-500/20 to-orange-500/20',         // 电影：红色到橙色
  TV_SERIES: 'from-orange-500/20 to-yellow-500/20',  // 电视剧：橙色到黄色
  MUSIC: 'from-green-500/20 to-teal-500/20',         // 音乐：绿色到青色
  VARIETY: 'from-yellow-500/20 to-amber-500/20',     // 综艺：黄色到琥珀色
  DOCUMENTARY: 'from-blue-500/20 to-indigo-500/20',  // 纪录片：蓝色到靛色
}

/**
 * 分类背景图案配置
 * 使用 CSS 渐变创建独特的背景效果
 */
const CATEGORY_PATTERNS: Record<string, string> = {
  ANIME: 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,105,180,0.1)_0%,transparent_50%)]',
  MOVIE: 'bg-[radial-gradient(circle_at_50%_50%,rgba(229,9,20,0.1)_0%,transparent_50%)]',
  MUSIC: 'bg-[radial-gradient(circle_at_50%_50%,rgba(29,185,84,0.1)_0%,transparent_50%)]',
  VARIETY: 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1)_0%,transparent_50%)]',
  DOCUMENTARY: 'bg-[radial-gradient(circle_at_50%_50%,rgba(65,105,225,0.1)_0%,transparent_50%)]',
}

/**
 * 分类页面布局组件
 * 
 * 主要功能:
 * 1. 获取分类主题配置
 * 2. 获取该分类的影视剧列表
 * 3. 应用分类特有的视觉风格
 * 4. 瀑布流展示内容
 */
export function CategoryLayout({ category }: CategoryLayoutProps) {
  /** 分类主题配置 */
  const [theme, setTheme] = useState<CategoryTheme | null>(null)
  
  /** 影视剧列表 */
  const [series, setSeries] = useState<Series[]>([])
  
  /** 加载状态 */
  const [loading, setLoading] = useState(true)
  
  /** 是否有更多数据 */
  const [hasMore, setHasMore] = useState(true)

  /** 组件挂载或分类变化时获取数据 */
  useEffect(() => {
    fetchCategoryData()
  }, [category])

  /**
   * 获取分类数据
   * 
   * 包括:
   * - 分类主题配置
   * - 该分类的影视剧列表
   */
  const fetchCategoryData = async () => {
    try {
      setLoading(true)
      // TODO: 替换为实际 API 调用
      // const [themeRes, seriesRes] = await Promise.all([
      //   fetch(`/api/categories/${category}/theme`),
      //   fetch(`/api/series/category/${category}`)
      // ])
      // const themeData = await themeRes.json()
      // const seriesData = await seriesRes.json()
      // setTheme(themeData)
      // setSeries(seriesData)

      // 模拟数据（开发环境）
      setTheme({
        code: category,
        name: getCategoryName(category),
        icon: getCategoryIcon(category),
        primaryColor: getCategoryColor(category),
        gradientStart: '#1a001a',
        gradientEnd: '#4a004a',
        backgroundPattern: 'sakura',
        cardStyle: 'anime',
        count: 1250,
      })

      setSeries([
        {
          id: 1,
          title: '进击的巨人 最终季',
          cover_url: '/placeholder.jpg',
          series_type: category,
          rating: 9.5,
          status: 'airing',
          genres: ['动作', '奇幻'],
          year: 2024,
        },
        {
          id: 2,
          title: '鬼灭之刃 柱训练篇',
          cover_url: '/placeholder.jpg',
          series_type: category,
          rating: 9.2,
          status: 'airing',
          genres: ['动作', '奇幻'],
          year: 2024,
        },
        {
          id: 3,
          title: '咒术回战 第二季',
          cover_url: '/placeholder.jpg',
          series_type: category,
          rating: 9.0,
          status: 'completed',
          genres: ['动作', '奇幻'],
          year: 2023,
        },
      ])
    } catch (error) {
      console.error('Failed to fetch category data:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载更多数据
   * 
   * 注意: 目前直接设置 hasMore 为 false，后续需要实现分页
   */
  const loadMore = async () => {
    // TODO: 实现分页加载
    setHasMore(false)
  }

  /** 获取分类渐变色类名 */
  const gradientClass = CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.ANIME
  
  /** 获取分类背景图案类名 */
  const patternClass = CATEGORY_PATTERNS[category] || CATEGORY_PATTERNS.ANIME

  return (
    <div className={`min-h-screen ${patternClass}`}>
      {/* Hero 横幅区域 */}
      <div className={`relative h-[40vh] bg-gradient-to-b ${gradientClass} to-transparent`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* 分类图标 */}
            <div className="text-6xl mb-4">{theme?.icon || getCategoryIcon(category)}</div>
            {/* 分类名称 */}
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {theme?.name || getCategoryName(category)}
            </h1>
            {/* 作品数量 */}
            <p className="text-text-secondary">
              共 {theme?.count || 0} 部作品
            </p>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 筛选工具栏 */}
        <div className="flex items-center gap-4 mb-8">
          {/* 状态筛选 */}
          <select className="bg-white/10 text-white rounded-lg px-4 py-2 text-sm">
            <option value="">全部状态</option>
            <option value="airing">连载中</option>
            <option value="completed">已完结</option>
            <option value="upcoming">即将上映</option>
          </select>
          
          {/* 排序方式 */}
          <select className="bg-white/10 text-white rounded-lg px-4 py-2 text-sm">
            <option value="popularity">按热度</option>
            <option value="rating">按评分</option>
            <option value="latest">按更新</option>
          </select>
        </div>

        {/* 瀑布流内容 */}
        {loading ? (
          // 加载骨架屏
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/10 rounded-xl aspect-[2/3] mb-3" />
                <div className="bg-white/10 rounded h-4 w-3/4 mb-2" />
                <div className="bg-white/10 rounded h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          // 瀑布流组件
          <Waterfall
            items={series}
            columns={5}
            gap={24}
            onLoadMore={loadMore}
            hasMore={hasMore}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}

/**
 * 获取分类中文名称
 * 
 * @param code 分类代码
 * @returns 中文名称
 */
function getCategoryName(code: string): string {
  const names: Record<string, string> = {
    ANIME: '动漫',
    MOVIE: '电影',
    TV_SERIES: '电视剧',
    MUSIC: '音乐',
    VARIETY: '综艺',
    DOCUMENTARY: '纪录片',
  }
  return names[code] || code
}

/**
 * 获取分类图标
 * 
 * @param code 分类代码
 * @returns Emoji 图标
 */
function getCategoryIcon(code: string): string {
  const icons: Record<string, string> = {
    ANIME: '🎨',     // 动漫：调色板
    MOVIE: '🎬',     // 电影：场记板
    TV_SERIES: '📺', // 电视剧：电视
    MUSIC: '🎵',     // 音乐：音符
    VARIETY: '🎭',   // 综艺：面具
    DOCUMENTARY: '📹', // 纪录片：摄像机
  }
  return icons[code] || '📺'
}

/**
 * 获取分类主色调
 * 
 * @param code 分类代码
 * @returns 十六进制颜色值
 */
function getCategoryColor(code: string): string {
  const colors: Record<string, string> = {
    ANIME: '#FF69B4',      // 动漫：粉色
    MOVIE: '#E50914',      // 电影：红色
    TV_SERIES: '#FF6B35',  // 电视剧：橙色
    MUSIC: '#1DB954',      // 音乐：绿色
    VARIETY: '#FFD700',    // 综艺：金色
    DOCUMENTARY: '#4169E1', // 纪录片：蓝色
  }
  return colors[code] || '#FF69B4'
}
