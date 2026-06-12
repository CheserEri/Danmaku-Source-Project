// ========== 影视剧类型 ==========

export type SeriesType = 'movie' | 'tv_series' | 'anime' | 'variety' | 'documentary'
export type SeriesStatus = 'airing' | 'completed' | 'upcoming'

export interface Series {
  id: number
  title: string
  original_title?: string
  description?: string
  cover_url?: string
  backdrop_url?: string
  series_type: SeriesType
  genres?: string[]
  country?: string
  language?: string
  release_date?: string
  year?: number
  status: SeriesStatus
  rating?: number
  rating_count?: number
  popularity?: number
  tags?: string[]
  created_at: string
  updated_at: string
}

// ========== 剧集类型 ==========

export interface Episode {
  id: number
  series_id: number
  season_number: number
  episode_number: number
  title?: string
  description?: string
  cover_url?: string
  duration?: number
  air_date?: string
  created_at: string
}

// ========== 弹幕类型 ==========

export type DanmakuType = 'scroll' | 'top' | 'bottom' | 'ltr'
export type DanmakuSource = 'bilibili' | 'tencent' | 'iqiyi' | 'youku' | 'user'

export interface Danmaku {
  id: number
  episode_id: number
  time: number
  source_time?: number
  content: string
  danmaku_type: DanmakuType
  color: string
  font_size?: number
  source: DanmakuSource
  source_id?: string
  user_id?: string
  user_hash?: string
  is_local: boolean
  is_merged: boolean
  merge_group?: string
  created_at: string
}

// ========== 平台类型 ==========

export interface Platform {
  id: number
  name: string
  code: string
  base_url?: string
  icon_url?: string
}

// ========== 演职人员类型 ==========

export type CastType = 'actor' | 'director' | 'screenwriter' | 'producer'

export interface Person {
  id: number
  name: string
  original_name?: string
  avatar_url?: string
  biography?: string
  birthday?: string
  place_of_birth?: string
}

export interface SeriesCast {
  series_id: number
  person_id: number
  role?: string
  cast_type: CastType
  order: number
  person?: Person
}

// ========== 图片类型 ==========

export type ImageType = 'cover' | 'poster' | 'backdrop' | 'still' | 'avatar'

export interface Image {
  id: number
  series_id?: number
  episode_id?: number
  person_id?: number
  image_type: ImageType
  url: string
  local_path?: string
  width?: number
  height?: number
  size?: number
  source: string
  created_at: string
}

// ========== 用户类型 ==========

export interface User {
  id: number
  username: string
  email?: string
  avatar_url?: string
  created_at: string
  last_login?: string
}

export type WatchlistStatus = 'watching' | 'completed' | 'planned' | 'dropped'

export interface Watchlist {
  id: number
  user_id: number
  series_id: number
  status: WatchlistStatus
  progress: number
  rating?: number
  notes?: string
  series?: Series
}

// ========== 导入记录类型 ==========

export interface ImportLog {
  id: number
  episode_id: number
  platform: string
  platform_id: string
  imported_count: number
  duplicate_count: number
  status: 'pending' | 'completed' | 'failed'
  error_message?: string
  created_at: string
  completed_at?: string
}

// ========== 合并记录类型 ==========

export interface MergeLog {
  id: number
  episode_id: number
  sources: string[]
  total_before: number
  total_after: number
  duplicates_removed: number
  merge_options?: Record<string, unknown>
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  completed_at?: string
}