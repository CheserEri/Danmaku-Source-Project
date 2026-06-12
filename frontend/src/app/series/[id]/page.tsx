'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { motion } from 'framer-motion'
import { 
  Star, Play, Clock, Calendar, Globe, 
  MessageSquare, Download, Share2, Heart,
  ChevronDown, ChevronUp, Users
} from 'lucide-react'

interface Series {
  id: number
  title: string
  original_title?: string
  description?: string
  cover_url?: string
  backdrop_url?: string
  series_type: string
  genres?: string[]
  country?: string
  year?: number
  status: string
  rating?: number
  rating_count?: number
}

interface Episode {
  id: number
  season_number: number
  episode_number: number
  title?: string
  duration?: number
}

export default function SeriesDetailPage() {
  const params = useParams()
  const seriesId = params.id

  const [series, setSeries] = useState<Series | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllEpisodes, setShowAllEpisodes] = useState(false)
  const [activeTab, setActiveTab] = useState<'episodes' | 'discussions' | 'cast'>('episodes')

  useEffect(() => {
    // 模拟数据
    setSeries({
      id: Number(seriesId),
      title: '三体',
      original_title: 'The Three-Body Problem',
      description: '2007年，地球基础科学出现了异常的扰动，一时间，科学界人心惶惶，离奇自杀的科学家，近乎神迹的倒计时，行事隐秘的科学边界，神秘莫测的三体游戏……纳米科学家汪淼被警官史强带到联合作战中心，并潜入名为"科学边界"的组织协助调查。',
      series_type: 'tv_series',
      genres: ['科幻', '剧情', '悬疑'],
      country: '中国大陆',
      year: 2023,
      status: 'completed',
      rating: 8.7,
      rating_count: 125000,
    })

    setEpisodes(Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      season_number: 1,
      episode_number: i + 1,
      title: `第${i + 1}集`,
      duration: 45,
    })))

    setLoading(false)
  }, [seriesId])

  if (loading || !series) {
    return (
      <div className="min-h-screen bg-bg-deep">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const displayedEpisodes = showAllEpisodes ? episodes : episodes.slice(0, 12)

  return (
    <div className="min-h-screen bg-bg-deep">
      <Header />

      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-deep/50 to-bg-deep" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-deep via-transparent to-transparent" />
        
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12">
          <div className="flex items-end space-x-8">
            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-48 h-72 bg-bg-surface rounded-xl overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">🎬</span>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl font-display font-bold mb-2">{series.title}</h1>
              {series.original_title && (
                <p className="text-text-secondary text-lg mb-4">{series.original_title}</p>
              )}
              
              <div className="flex items-center space-x-4 mb-4">
                {series.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-accent-gold fill-accent-gold" />
                    <span className="text-xl font-bold text-accent-gold">{series.rating}</span>
                    <span className="text-text-muted">({series.rating_count?.toLocaleString()}人评分)</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {series.genres?.map((genre) => (
                  <span key={genre} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                    {genre}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-6 text-text-secondary">
                {series.year && (
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{series.year}</span>
                  </span>
                )}
                {series.country && (
                  <span className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>{series.country}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{episodes.length}集</span>
                </span>
              </div>

              <div className="flex space-x-4 mt-6">
                <button className="px-8 py-3 bg-primary-600 hover:bg-primary-700 rounded-xl font-medium transition-colors flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>立即观看</span>
                </button>
                <button className="px-6 py-3 border border-white/10 hover:border-white/20 rounded-xl transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="px-6 py-3 border border-white/10 hover:border-white/20 rounded-xl transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold mb-4">剧情简介</h2>
          <p className="text-text-secondary leading-relaxed">{series.description}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-bg-surface rounded-xl p-1">
          {[
            { id: 'episodes', label: '剧集列表', icon: Play },
            { id: 'discussions', label: '讨论组', icon: MessageSquare },
            { id: 'cast', label: '演职人员', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'text-text-secondary hover:text-text-bright'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'episodes' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {displayedEpisodes.map((episode, index) => (
                <motion.a
                  key={episode.id}
                  href={`/watch/${episode.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="group bg-bg-surface rounded-xl p-4 hover:bg-primary-600/20 transition-colors border border-white/5 hover:border-primary-500/30"
                >
                  <div className="text-lg font-bold mb-1 group-hover:text-primary-400 transition-colors">
                    E{episode.episode_number}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {episode.duration}分钟
                  </div>
                </motion.a>
              ))}
            </div>
            {episodes.length > 12 && (
              <button
                onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                className="w-full mt-4 py-3 text-center text-primary-400 hover:text-primary-300 transition-colors flex items-center justify-center space-x-2"
              >
                <span>{showAllEpisodes ? '收起' : `展开全部 ${episodes.length} 集`}</span>
                {showAllEpisodes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        )}

        {activeTab === 'discussions' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">讨论组</h3>
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm transition-colors">
                创建讨论
              </button>
            </div>
            <div className="space-y-3">
              {[
                { title: '剧情讨论：第一集细节分析', replies: 125, creator: 'user1', time: '2小时前' },
                { title: '角色分析：汪淼的人物弧光', replies: 89, creator: 'user2', time: '1天前' },
                { title: '原著与剧版对比', replies: 256, creator: 'user3', time: '3天前' },
              ].map((discussion, index) => (
                <motion.a
                  key={index}
                  href={`/series/${seriesId}/discussions/${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="block bg-bg-surface rounded-xl p-4 hover:bg-white/5 transition-colors border border-white/5"
                >
                  <h4 className="font-medium mb-2 hover:text-primary-400 transition-colors">
                    {discussion.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{discussion.replies} 回复</span>
                    </span>
                    <span>创建者: {discussion.creator}</span>
                    <span>{discussion.time}</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cast' && (
          <div className="text-center py-12 text-text-muted">
            演职人员信息加载中...
          </div>
        )}
      </div>
    </div>
  )
}