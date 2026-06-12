'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { motion } from 'framer-motion'
import { 
  User, Mail, Calendar, Shield, Edit2, 
  Film, MessageSquare, Heart, Settings
} from 'lucide-react'

interface UserProfile {
  id: number
  username: string
  email: string
  role: string
  avatar_url?: string
  bio?: string
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'watchlist' | 'discussions' | 'danmakus'>('watchlist')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-deep">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-text-secondary mb-4">请先登录</p>
            <a href="/login" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
              去登录
            </a>
          </div>
        </div>
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    user: '普通用户',
    editor: '编辑者',
    admin: '管理员',
  }

  return (
    <div className="min-h-screen bg-bg-deep">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {user.username[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <div className="flex items-center space-x-4 mt-2 text-text-secondary">
                  <span className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>加入于 {user.created_at}</span>
                  </span>
                </div>
                <div className="mt-3">
                  <span className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm flex items-center space-x-1 w-fit">
                    <Shield className="w-3 h-3" />
                    <span>{roleLabels[user.role]}</span>
                  </span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Edit2 className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {user.bio && (
            <p className="mt-6 text-text-secondary border-t border-white/5 pt-6">
              {user.bio}
            </p>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-bg-surface rounded-xl p-1">
          {[
            { id: 'watchlist', label: '我的片单', icon: Film },
            { id: 'discussions', label: '我的讨论', icon: MessageSquare },
            { id: 'danmakus', label: '我的弹幕', icon: Heart },
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
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'watchlist' && (
            <div className="space-y-4">
              {[
                { title: '三体', status: '观看中', progress: '15/30' },
                { title: '狂飙', status: '已看完', progress: '39/39' },
                { title: '漫长的季节', status: '想看', progress: '-' },
              ].map((item, index) => (
                <div key={index} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-20 bg-bg-elevated rounded-lg flex items-center justify-center">
                      <Film className="w-6 h-6 text-text-muted" />
                    </div>
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-text-secondary">进度: {item.progress}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'discussions' && (
            <div className="space-y-4">
              {[
                { title: '三体剧情讨论', replies: 125, lastReply: '2小时前' },
                { title: '狂飙角色分析', replies: 89, lastReply: '1天前' },
              ].map((item, index) => (
                <div key={index} className="glass rounded-xl p-4">
                  <h3 className="font-medium mb-2">{item.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{item.replies} 回复</span>
                    </span>
                    <span>最后回复: {item.lastReply}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'danmakus' && (
            <div className="space-y-4">
              {[
                { content: '前方高能预警！', series: '三体', time: '12:30' },
                { content: '这段太震撼了', series: '三体', time: '25:10' },
                { content: '泪目', series: '狂飙', time: '40:20' },
              ].map((item, index) => (
                <div key={index} className="glass rounded-xl p-4">
                  <p className="mb-2">"{item.content}"</p>
                  <div className="flex items-center space-x-4 text-sm text-text-secondary">
                    <span>{item.series}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}