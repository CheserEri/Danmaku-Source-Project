'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface SeriesCardProps {
  series: {
    id: number
    title: string
    series_type: string
    genres?: string[]
    year?: number
    rating?: number
    cover_url?: string
    status: string
  }
}

export function SeriesCard({ series }: SeriesCardProps) {
  return (
    <motion.a
      href={`/series/${series.id}`}
      className="group relative bg-bg-surface rounded-xl overflow-hidden border border-white/5 hover:border-primary-500/30 transition-all duration-300"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Cover Image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-surface/80 z-10" />
        <div className="w-full h-full bg-bg-elevated flex items-center justify-center">
          <span className="text-4xl">🎬</span>
        </div>

        {/* Rating Badge */}
        {series.rating && (
          <div className="absolute top-2 right-2 z-20 flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="w-3 h-3 text-accent-gold fill-accent-gold" />
            <span className="text-xs font-medium text-accent-gold">
              {series.rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            查看详情
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-text-bright truncate group-hover:text-primary-400 transition-colors">
          {series.title}
        </h3>
        <div className="flex items-center space-x-2 mt-1">
          {series.year && (
            <span className="text-xs text-text-muted">{series.year}</span>
          )}
          {series.genres && series.genres.length > 0 && (
            <span className="text-xs text-text-muted">
              · {series.genres[0]}
            </span>
          )}
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/20 to-primary-400/20 blur-xl" />
      </div>
    </motion.a>
  )
}