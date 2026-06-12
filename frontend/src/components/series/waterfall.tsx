'use client'

/**
 * 瀑布流布局组件
 * 
 * 功能:
 * - 自适应列数的瀑布流布局
 * - 无限滚动加载更多
 * - 平滑的动画过渡效果
 * - 响应式设计
 * 
 * 使用场景:
 * - 分类页面的内容展示
 * - 搜索结果展示
 * - 首页推荐内容
 * 
 * 使用示例:
 * <Waterfall
 *   items={seriesList}
 *   columns={5}
 *   gap={16}
 *   onLoadMore={handleLoadMore}
 *   hasMore={hasMoreData}
 *   loading={isLoading}
 * />
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { SeriesCard } from './series-card'

/**
 * 影视剧数据接口
 * 定义瀑布流中每个卡片的数据结构
 */
interface Series {
  id: number           // 影视剧ID
  title: string        // 标题
  cover_url: string    // 封面URL
  series_type: string  // 类型：ANIME/MOVIE/TV_SERIES等
  rating: number       // 评分
  status: string       // 状态：AIRING/COMPLETED/UPCOMING
  genres: string[]     // 类型标签数组
  year: number         // 年份
}

/**
 * 瀑布流组件属性
 */
interface WaterfallProps {
  items: Series[]           // 数据列表
  columns?: number          // 列数，默认5
  gap?: number              // 卡片间距，默认16px
  onLoadMore?: () => void   // 加载更多回调函数
  hasMore?: boolean         // 是否还有更多数据
  loading?: boolean         // 是否正在加载中
}

/**
 * 瀑布流组件
 * 
 * 实现原理:
 * 1. 计算每列的宽度
 * 2. 遍历所有卡片，找到最短的列
 * 3. 将卡片放置在最短列的顶部
 * 4. 更新列高度
 * 5. 使用 CSS transform 定位每个卡片
 */
export function Waterfall({
  items,
  columns = 5,
  gap = 16,
  onLoadMore,
  hasMore = false,
  loading = false,
}: WaterfallProps) {
  /** 容器 DOM 引用 */
  const containerRef = useRef<HTMLDivElement>(null)
  
  /** 每列的高度数组 */
  const [columnHeights, setColumnHeights] = useState<number[]>(new Array(columns).fill(0))
  
  /** 每个卡片的位置数组 */
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([])

  /**
   * 计算所有卡片的位置
   * 
   * 算法:
   * 1. 获取容器宽度，计算每列宽度
   * 2. 遍历所有卡片
   * 3. 找到当前最短的列
   * 4. 将卡片放在该列顶部
   * 5. 更新该列的高度
   */
  const calculatePositions = useCallback(() => {
    if (!containerRef.current || items.length === 0) return

    // 计算容器宽度和列宽
    const containerWidth = containerRef.current.offsetWidth
    const columnWidth = (containerWidth - gap * (columns - 1)) / columns
    
    // 初始化每列高度为0
    const newHeights = new Array(columns).fill(0)
    const newPositions: { x: number; y: number }[] = []

    // 遍历所有卡片，计算位置
    items.forEach((_, index) => {
      // 找到最短的列
      const minHeight = Math.min(...newHeights)
      const columnIndex = newHeights.indexOf(minHeight)

      // 计算卡片位置
      const x = columnIndex * (columnWidth + gap)  // x坐标 = 列索引 * (列宽 + 间距)
      const y = newHeights[columnIndex]             // y坐标 = 该列当前高度

      newPositions.push({ x, y })

      // 估算卡片高度（封面比例 2:3 + 信息区域高度）
      const estimatedHeight = columnWidth * 1.4 + 120
      newHeights[columnIndex] += estimatedHeight + gap
    })

    setColumnHeights(newHeights)
    setPositions(newPositions)
  }, [items, columns, gap])

  /** 当数据变化时重新计算位置 */
  useEffect(() => {
    calculatePositions()
  }, [calculatePositions])

  /**
   * 无限滚动加载
   * 
   * 监听滚动事件，当滚动到底部附近时触发加载更多。
   * 使用 500px 的阈值，提前加载。
   */
  useEffect(() => {
    if (!onLoadMore || !hasMore) return

    const handleScroll = () => {
      // 判断是否滚动到底部附近（距离底部 500px）
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 &&
        !loading
      ) {
        onLoadMore()
      }
    }

    // 添加滚动监听
    window.addEventListener('scroll', handleScroll)
    
    // 清理函数：移除滚动监听
    return () => window.removeEventListener('scroll', handleScroll)
  }, [onLoadMore, hasMore, loading])

  /** 计算容器最大高度 */
  const maxHeight = Math.max(...columnHeights)

  return (
    <div className="relative" style={{ height: maxHeight }}>
      {/* 卡片容器 */}
      <div ref={containerRef} className="absolute inset-0">
        {items.map((series, index) => (
          <div
            key={series.id}
            className="absolute transition-all duration-300"
            style={{
              // 使用 transform 定位，性能更好
              transform: `translate(${positions[index]?.x || 0}px, ${positions[index]?.y || 0}px)`,
              // 计算卡片宽度
              width: `calc((100% - ${gap * (columns - 1)}px) / ${columns})`,
            }}
          >
            <SeriesCard series={series} />
          </div>
        ))}
      </div>

      {/* 加载指示器 */}
      {loading && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
