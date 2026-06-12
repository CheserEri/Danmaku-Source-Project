'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { SeriesCard } from '@/components/series/series-card'
import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'

const seriesTypes = [
  { value: '', label: '全部' },
  { value: 'movie', label: '电影' },
  { value: 'tv_series', label: '电视剧' },
  { value: 'anime', label: '动漫' },
  { value: 'variety', label: '综艺' },
  { value: 'documentary', label: '纪录片' },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [seriesType, setSeriesType] = useState('')
  const [year, setYear] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        keyword: query,
        ...(seriesType && { type: seriesType }),
        ...(year && { year }),
      })
      const response = await fetch(`/api/series?${params}`)
      const data = await response.json()
      setResults(data.data || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) {
      handleSearch()
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg-deep">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索影视剧名称、演员、导演..."
                className="w-full pl-12 pr-4 py-4 bg-bg-surface border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 transition-colors text-lg"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-4 rounded-xl border transition-colors ${
                showFilters
                  ? 'bg-primary-600 border-primary-600'
                  : 'bg-bg-surface border-white/10 hover:border-white/20'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 rounded-xl font-medium transition-colors"
            >
              搜索
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 glass rounded-xl"
            >
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">类型</label>
                  <div className="flex flex-wrap gap-2">
                    {seriesTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setSeriesType(type.value)}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${
                          seriesType === type.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-bg-surface text-text-secondary hover:text-text-bright'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">年份</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="如: 2023"
                    className="px-4 py-2 bg-bg-surface border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <>
              <p className="text-text-secondary mb-6">
                找到 <span className="text-text-bright font-medium">{results.length}</span> 个结果
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {results.map((series, index) => (
                  <motion.div
                    key={series.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <SeriesCard series={series} />
                  </motion.div>
                ))}
              </div>
            </>
          ) : query ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg mb-2">未找到相关结果</p>
              <p className="text-text-muted">请尝试其他关键词</p>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-text-muted text-lg">输入关键词开始搜索</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}