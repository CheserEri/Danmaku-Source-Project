'use client'

/**
 * 更新时间表组件
 * 
 * 功能:
 * - 显示今日/本周的影视剧更新时间
 * - 按星期筛选
 * - 显示更新时间、平台、备注等信息
 * - 支持点击跳转到影视剧详情
 * 
 * 使用场景:
 * - 首页的更新时间表区域
 * - 热播剧集的更新日历
 * 
 * 使用示例:
 * <UpdateSchedule />
 */

import { useState, useEffect } from 'react'

/**
 * 更新时间表数据接口
 * 定义单个更新时间表条目的数据结构
 */
interface ScheduleItem {
  seriesId: number      // 影视剧ID
  title: string         // 影视剧标题
  coverUrl: string      // 封面URL
  seriesType: string    // 类型：ANIME/MOVIE/TV_SERIES等
  rating: number        // 评分
  dayOfWeek: string     // 更新星期：MONDAY~SUNDAY
  updateTime: string    // 更新时间，如 "20:00"
  episodeCount: number  // 当前集数
  seasonInfo: string    // 季信息，如 "第二季"
  platform: string      // 更新平台：bilibili/tencent/iqiyi
  remark: string        // 备注，如 "会员提前看"
  nextUpdate: string    // 下次更新时间（ISO格式）
  isToday: boolean      // 是否今天更新
}

/**
 * 每日时间表接口
 */
interface DaySchedule {
  day: string           // 星期代码
  items: ScheduleItem[] // 该日的更新列表
}

/**
 * 星期标签映射
 * 将英文星期代码转换为中文
 */
const DAY_LABELS: Record<string, string> = {
  MONDAY: '周一',
  TUESDAY: '周二',
  WEDNESDAY: '周三',
  THURSDAY: '周四',
  FRIDAY: '周五',
  SATURDAY: '周六',
  SUNDAY: '周日',
}

/**
 * 类型颜色映射
 * 不同影视类型对应的主题颜色
 */
const TYPE_COLORS: Record<string, string> = {
  ANIME: 'bg-pink-500/20 text-pink-400',        // 动漫 - 粉色
  MOVIE: 'bg-red-500/20 text-red-400',          // 电影 - 红色
  TV_SERIES: 'bg-orange-500/20 text-orange-400', // 电视剧 - 橙色
  MUSIC: 'bg-green-500/20 text-green-400',       // 音乐 - 绿色
  VARIETY: 'bg-yellow-500/20 text-yellow-400',   // 综艺 - 黄色
  DOCUMENTARY: 'bg-blue-500/20 text-blue-400',   // 纪录片 - 蓝色
}

/**
 * 更新时间表组件
 * 
 * 主要功能:
 * 1. 获取更新时间表数据
 * 2. 按星期分组
 * 3. 支持按星期筛选
 * 4. 显示今日更新（默认）
 */
export function UpdateSchedule() {
  /** 更新时间表数据 */
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  
  /** 选中的星期（空字符串表示今日） */
  const [selectedDay, setSelectedDay] = useState<string>('')
  
  /** 加载状态 */
  const [loading, setLoading] = useState(true)

  /** 组件挂载时获取数据 */
  useEffect(() => {
    fetchSchedules()
  }, [])

  /**
   * 获取更新时间表数据
   * 
   * 注意: 目前使用模拟数据，后续需要替换为实际 API 调用
   * API: GET /api/schedules/week
   */
  const fetchSchedules = async () => {
    try {
      setLoading(true)
      // TODO: 替换为实际 API 调用
      // const response = await fetch('/api/schedules/week')
      // const data = await response.json()
      // setSchedules(data)

      // 模拟数据（开发环境）
      const mockData: ScheduleItem[] = [
        {
          seriesId: 1,
          title: '进击的巨人 最终季',
          coverUrl: '/placeholder.jpg',
          seriesType: 'ANIME',
          rating: 9.5,
          dayOfWeek: 'WEDNESDAY',
          updateTime: '20:00',
          episodeCount: 87,
          seasonInfo: '最终季 Part.3',
          platform: 'bilibili',
          remark: '会员提前看',
          nextUpdate: '2026-06-12T20:00:00',
          isToday: true,
        },
        {
          seriesId: 2,
          title: '三体',
          coverUrl: '/placeholder.jpg',
          seriesType: 'TV_SERIES',
          rating: 8.7,
          dayOfWeek: 'FRIDAY',
          updateTime: '21:00',
          episodeCount: 30,
          seasonInfo: '第一季',
          platform: 'tencent',
          remark: '',
          nextUpdate: '2026-06-14T21:00:00',
          isToday: false,
        },
        {
          seriesId: 3,
          title: '鬼灭之刃 柱训练篇',
          coverUrl: '/placeholder.jpg',
          seriesType: 'ANIME',
          rating: 9.2,
          dayOfWeek: 'SUNDAY',
          updateTime: '22:00',
          episodeCount: 8,
          seasonInfo: '第四季',
          platform: 'bilibili',
          remark: '同步日本',
          nextUpdate: '2026-06-15T22:00:00',
          isToday: false,
        },
      ]
      setSchedules(mockData)
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 按星期分组
   * 将更新时间表数据按星期分组，方便筛选显示
   */
  const groupedSchedules = schedules.reduce<Record<string, ScheduleItem[]>>((acc, item) => {
    if (!acc[item.dayOfWeek]) {
      acc[item.dayOfWeek] = []
    }
    acc[item.dayOfWeek].push(item)
    return acc
  }, {})

  /**
   * 获取有更新的星期列表
   * 按照星期顺序排序
   */
  const daysWithSchedules = Object.keys(groupedSchedules).sort(
    (a, b) => Object.keys(DAY_LABELS).indexOf(a) - Object.keys(DAY_LABELS).indexOf(b)
  )

  /**
   * 获取当前显示的更新列表
   * - 如果选中了星期，显示该星期的更新
   * - 如果没有选中，显示今日更新
   */
  const displaySchedules = selectedDay
    ? groupedSchedules[selectedDay] || []
    : schedules.filter((s) => s.isToday)

  /** 加载状态显示骨架屏 */
  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl p-6 animate-pulse">
        {/* 标题骨架 */}
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
        {/* 星期标签骨架 */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-16 bg-white/10 rounded-full" />
          ))}
        </div>
        {/* 列表骨架 */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/10 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6">
      {/* 头部：标题和切换按钮 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="text-2xl">📅</span>
          {selectedDay ? DAY_LABELS[selectedDay] + '更新' : '今日更新'}
        </h3>
        {selectedDay && (
          <button
            onClick={() => setSelectedDay('')}
            className="text-sm text-primary-400 hover:text-primary-300"
          >
            查看今日
          </button>
        )}
      </div>

      {/* 星期标签栏 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {daysWithSchedules.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day === selectedDay ? '' : day)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              day === selectedDay
                ? 'bg-primary-500 text-white'  // 选中状态
                : 'bg-white/10 text-text-secondary hover:bg-white/20'  // 未选中状态
            }`}
          >
            {DAY_LABELS[day]}
            {/* 显示该星期的更新数量 */}
            {groupedSchedules[day]?.length > 0 && (
              <span className="ml-1 text-xs opacity-75">({groupedSchedules[day].length})</span>
            )}
          </button>
        ))}
      </div>

      {/* 更新列表 */}
      <div className="space-y-3">
        {displaySchedules.length === 0 ? (
          // 空状态
          <div className="text-center py-8 text-text-muted">
            <p className="text-4xl mb-2">📭</p>
            <p>{selectedDay ? '该日暂无更新' : '今日暂无更新'}</p>
          </div>
        ) : (
          // 渲染更新列表
          displaySchedules.map((item) => (
            <ScheduleCard key={item.seriesId} item={item} />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * 更新时间表卡片组件
 * 
 * 显示单个影视剧的更新时间信息
 * 
 * @param item 更新时间表数据
 */
function ScheduleCard({ item }: { item: ScheduleItem }) {
  return (
    <a
      href={`/series/${item.seriesId}`}
      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
    >
      {/* 更新时间 */}
      <div className="text-center min-w-[60px]">
        <div className="text-lg font-bold text-primary-400">{item.updateTime}</div>
        {item.isToday && (
          <div className="text-xs text-green-400 font-medium">今天</div>
        )}
      </div>

      {/* 封面图片 */}
      <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      {/* 信息区域 */}
      <div className="flex-1 min-w-0">
        {/* 标题 */}
        <h4 className="font-medium truncate group-hover:text-primary-400 transition-colors">
          {item.title}
        </h4>
        {/* 标签 */}
        <div className="flex items-center gap-2 mt-1">
          {/* 类型标签 */}
          <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[item.seriesType] || 'bg-gray-500/20 text-gray-400'}`}>
            {item.seriesType === 'ANIME' ? '动漫' : 
             item.seriesType === 'MOVIE' ? '电影' :
             item.seriesType === 'TV_SERIES' ? '电视剧' :
             item.seriesType === 'MUSIC' ? '音乐' :
             item.seriesType === 'VARIETY' ? '综艺' : '纪录片'}
          </span>
          {/* 季信息 */}
          {item.seasonInfo && (
            <span className="text-xs text-text-muted">{item.seasonInfo}</span>
          )}
          {/* 集数 */}
          <span className="text-xs text-text-muted">第{item.episodeCount}集</span>
        </div>
      </div>

      {/* 平台标签 */}
      {item.platform && (
        <div className="text-xs text-text-muted bg-white/10 px-2 py-1 rounded">
          {item.platform}
        </div>
      )}

      {/* 备注标签 */}
      {item.remark && (
        <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
          {item.remark}
        </div>
      )}
    </a>
  )
}
