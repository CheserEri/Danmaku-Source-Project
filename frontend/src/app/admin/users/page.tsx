'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { motion } from 'framer-motion'
import {
  Users, Shield, ShieldCheck, ShieldOff,
  Search, Edit, ArrowLeft, Check, X
} from 'lucide-react'

interface User {
  id: number
  username: string
  email?: string
  nickname?: string
  avatar?: string
  role: string
  roleLabel: string
  isActive: boolean
  createdAt: string
}

const roleLabels: Record<string, { label: string; color: string; icon: any }> = {
  USER: { label: '普通用户', color: 'bg-gray-500/20 text-gray-400', icon: ShieldOff },
  EDITOR: { label: '编辑者', color: 'bg-blue-500/20 text-blue-400', icon: Shield },
  ADMIN: { label: '管理员', color: 'bg-purple-500/20 text-purple-400', icon: ShieldCheck },
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.code === 200) {
        setUsers(data.data)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8080/api/users/${userId}/role?role=${role}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.code === 200) {
        setUsers(users.map((u) => (u.id === userId ? data.data : u)))
        setEditingUser(null)
      }
    } catch (error) {
      console.error('修改角色失败:', error)
    }
  }

  const handleToggleStatus = async (userId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8080/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.code === 200) {
        setUsers(users.map((u) => (u.id === userId ? data.data : u)))
      }
    } catch (error) {
      console.error('修改状态失败:', error)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.nickname && user.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-bg-deep">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <a
            href="/admin"
            className="inline-flex items-center text-text-secondary hover:text-text-bright transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回管理后台
          </a>
          <h1 className="text-3xl font-display font-bold flex items-center space-x-3">
            <Users className="w-8 h-8 text-primary-500" />
            <span>用户管理</span>
          </h1>
          <p className="text-text-secondary mt-2">管理用户账号和权限</p>
        </div>

        {/* 搜索 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索用户名、邮箱或昵称..."
              className="w-full pl-12 pr-4 py-3 bg-bg-surface border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        {/* 用户表格 */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">用户</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">邮箱</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">角色</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">状态</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">注册时间</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-text-secondary">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                      加载中...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                      暂无用户数据
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-600/20 rounded-full flex items-center justify-center">
                            <span className="text-primary-400 font-medium">
                              {(user.nickname || user.username)[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            {user.nickname && (
                              <p className="text-sm text-text-muted">{user.nickname}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{user.email || '-'}</td>
                      <td className="px-6 py-4">
                        {editingUser?.id === user.id ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={newRole}
                              onChange={(e) => setNewRole(e.target.value)}
                              className="px-3 py-1 bg-bg-surface border border-white/10 rounded-lg text-sm"
                            >
                              <option value="USER">普通用户</option>
                              <option value="EDITOR">编辑者</option>
                              <option value="ADMIN">管理员</option>
                            </select>
                            <button
                              onClick={() => handleRoleChange(user.id, newRole)}
                              className="p-1 text-green-400 hover:bg-green-400/10 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
                              roleLabels[user.role]?.color || 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {(() => {
                              const Icon = roleLabels[user.role]?.icon || ShieldOff
                              return <Icon className="w-3 h-3" />
                            })()}
                            <span>{user.roleLabel}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center space-x-1 ${
                            user.isActive ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              user.isActive ? 'bg-green-400' : 'bg-red-400'
                            }`}
                          />
                          <span className="text-sm">{user.isActive ? '活跃' : '禁用'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(user)
                              setNewRole(user.role)
                            }}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="修改权限"
                          >
                            <Edit className="w-4 h-4 text-text-secondary" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isActive
                                ? 'hover:bg-red-400/10 text-red-400'
                                : 'hover:bg-green-400/10 text-green-400'
                            }`}
                            title={user.isActive ? '禁用' : '启用'}
                          >
                            {user.isActive ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}