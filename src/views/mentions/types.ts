export interface MentionSource {
  type: string
  avatar: string
  name: string
}

export interface Mention {
  id: string
  source: MentionSource
  title: string
  domain: string
  visits: number
  influenceScore: number
  snippet: string
  keywords: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  timestamp: string
}

export interface MentionFilters {
  dateRange: { start: string; end: string }
  sources: string[]
  sentiments: ('positive' | 'neutral' | 'negative')[]
  influenceRange: [number, number]
  geolocation: string | null
}
