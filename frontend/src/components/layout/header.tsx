'use client'

import { useState, useEffect } from 'react'
import { Search, Menu, X, User, LogOut, Shield } from 'lucide-react'

interface UserInfo {
  id: number
  username: string
  nickname?: string
  role: string
  roleLabel: string
}

const categories = [
  { type: 'anime', name: '动漫', icon: '🎨' },
  { type: 'movie', name: '电影', icon: '🎬' },
  { type: 'music', name: '音乐', icon: '🎵' },
  { type: 'variety', name: '综艺', icon: '🎭' },
  { type: 'documentary', name: '纪录片', icon: '📹' },
]

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-display font-bold gradient-text hidden sm:block">
                影视数据平台
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-text-secondary hover:text-text-bright transition-colors">
              首页
            </a>
            
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="text-text-secondary hover:text-text-bright transition-colors flex items-center gap-1"
              >
                分类
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-bg-surface border border-white/10 rounded-xl shadow-xl overflow-hidden">
                  {categories.map((category) => (
                    <a
                      key={category.type}
                      href={`/category/${category.type}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      <span className="text-xl">{category.icon}</span>
                      <span>{category.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a href="/search" className="text-text-secondary hover:text-text-bright transition-colors">
              搜索
            </a>
            {user?.role === 'ADMIN' && (
              <a href="/admin" className="text-text-secondary hover:text-text-bright transition-colors">
                管理后台
              </a>
            )}
          </nav>

          {/* Search & User */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索影视剧..."
                  className="w-64 px-4 py-2 bg-bg-surface border border-white/10 rounded-full text-sm focus:outline-none focus:border-primary-500 transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-bright"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-text-secondary hover:text-text-bright transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* User */}
            {user ? (
              <div className="flex items-center space-x-3">
                <a
                  href="/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600/20 rounded-full flex items-center justify-center">
                    <span className="text-primary-400 text-sm font-medium">
                      {(user.nickname || user.username)[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm">{user.nickname || user.username}</span>
                </a>
                <button
                  onClick={handleLogout}
                  className="p-2 text-text-secondary hover:text-red-400 transition-colors"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm transition-colors"
              >
                登录
              </a>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-bright transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/5">
            <nav className="flex flex-col space-y-4">
              <a
                href="/"
                className="text-text-secondary hover:text-text-bright transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                首页
              </a>
              
              {/* Mobile Categories */}
              <div className="px-2 py-1">
                <p className="text-text-muted text-sm mb-2">分类</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <a
                      key={category.type}
                      href={`/category/${category.type}`}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <a
                href="/search"
                className="text-text-secondary hover:text-text-bright transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                搜索
              </a>
              {user?.role === 'ADMIN' && (
                <a
                  href="/admin"
                  className="text-text-secondary hover:text-text-bright transition-colors px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  管理后台
                </a>
              )}
              {user && (
                <a
                  href="/profile"
                  className="text-text-secondary hover:text-text-bright transition-colors px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  个人中心
                </a>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
