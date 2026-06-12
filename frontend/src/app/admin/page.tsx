'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { motion } from 'framer-motion'
import { 
  Users, Film, MessageSquare, Settings, 
  Shield, ChevronRight, BarChart3, Database
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalSeries: number
  totalDanmakus: number
  totalDiscussions: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSeries: 0,
    totalDanmakus: 0,
    totalDiscussions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟数据
    setStats({
      totalUsers: 1250,
      totalSeries: 350,
      totalDanmakus: 2500000,
      totalDiscussions: 890,
    })
    setLoading(false)
  }, [])

  const menuItems = [
    {
      title: '用户管理',
      description: '管理用户账号、权限提权',
      icon: Users,
      href: '/admin/users',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: '影视库',
      description: '管理影视剧数据',
      icon: Film,
      href: '/admin/series',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: '讨论组',
      description: '管理番剧讨论组',
      icon: MessageSquare,
      href: '/admin/discussions',
      color: 'from-green-500 to-green-600',
    },
    {
      title: '数据统计',
      description: '查看平台数据统计',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: '弹幕管理',
      description: '管理弹幕数据、导入导出',
      icon: Database,
      href: '/admin/danmakus',
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: '系统设置',
      description: '平台配置、权限设置',
      icon: Settings,
      href: '/admin/settings',
      color: 'from-gray-500 to-gray-600',
    },
  ]

  return (
    <div className="min-h-screen bg-bg-deep">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary-500" />
            <span>管理后台</span>
          </h1>
          <p className="text-text-secondary mt-2">管理平台数据和用户权限</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '用户数', value: stats.totalUsers, icon: Users },
            { label: '影视数', value: stats.totalSeries, icon: Film },
            { label: '弹幕数', value: stats.totalDanmakus.toLocaleString(), icon: Database },
            { label: '讨论数', value: stats.totalDiscussions, icon: MessageSquare },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-primary-400" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item, index) => (
            <motion.a
              key={item.title}
              href={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group glass rounded-xl p-6 hover:border-primary-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-medium mb-1 group-hover:text-primary-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary-400 transition-colors" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}