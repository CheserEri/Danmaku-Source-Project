const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface ApiResponse<T> {
  data?: T
  error?: string
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      return { error: error || response.statusText }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

// ========== 影视剧 API ==========

export interface Series {
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
  popularity?: number
}

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
}

export interface Danmaku {
  id: number
  episode_id: number
  time: number
  content: string
  danmaku_type: string
  color: string
  source: string
}

export const seriesApi = {
  search: (keyword: string) =>
    fetchApi<Series[]>(`/series?keyword=${encodeURIComponent(keyword)}`),

  getById: (id: number) =>
    fetchApi<Series>(`/series/${id}`),

  getEpisodes: (id: number) =>
    fetchApi<Episode[]>(`/series/${id}/episodes`),

  getTrending: () =>
    fetchApi<Series[]>('/series/trending'),

  getLatest: () =>
    fetchApi<Series[]>('/series/latest'),
}

// ========== 弹幕 API ==========

export const danmakuApi = {
  getByEpisode: (episodeId: number) =>
    fetchApi<Danmaku[]>(`/episodes/${episodeId}/danmakus`),

  getByEpisodeRange: (episodeId: number, start: number, end: number) =>
    fetchApi<Danmaku[]>(`/episodes/${episodeId}/danmakus/range?from=${start}&to=${end}`),

  send: (episodeId: number, data: { time: number; content: string; type?: string; color?: string }) =>
    fetchApi<Danmaku>(`/episodes/${episodeId}/danmakus`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  import: (data: { platform: string; platform_id: string; episode_id?: number }) =>
    fetchApi<{ imported: number; duplicates: number }>('/danmaku/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  merge: (episodeId: number, sources: string[]) =>
    fetchApi<{ total_before: number; total_after: number }>('/danmaku/merge', {
      method: 'POST',
      body: JSON.stringify({ episode_id: episodeId, sources }),
    }),
}

// ========== WebSocket ==========

export function createDanmakuWebSocket(episodeId: number, onMessage: (danmaku: Danmaku) => void) {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'
  const ws = new WebSocket(`${wsUrl}/ws/danmaku/${episodeId}`)

  ws.onmessage = (event) => {
    try {
      const danmaku = JSON.parse(event.data)
      onMessage(danmaku)
    } catch (e) {
      console.error('Failed to parse danmaku:', e)
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  return ws
}