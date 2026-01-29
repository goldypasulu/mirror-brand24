import { lodifyApi } from '@/services/lodifyApi'
import type { Mention } from '@/views/mentions/types'
import { defineStore } from 'pinia'

interface MentionsState {
  mentions: Mention[]
  loading: boolean
  error: string | null
  mockMode: boolean
  aiInsight: string | null
  filters: {
    dateFrom: string
    dateTo: string
    sources: string[]
    sentiments: string[]
    search: string
  }
}

export const useMentionsStore = defineStore('mentions', {
  state: (): MentionsState => ({
    mentions: [],
    loading: false,
    error: null,
    mockMode: false,
    aiInsight: null,
    filters: {
      // Default to last 30 days
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      sources: [],
      sentiments: ['positive', 'neutral', 'negative'],
      search: '',
    },
  }),

  getters: {
    filteredMentions: (state) => {
      return state.mentions.filter(mention => {
        // Date filter is handled by API fetch, but we might want to double check or handle other filters here
        
        // Sentiment Filter
        if (state.filters.sentiments.length > 0 && !state.filters.sentiments.includes(mention.sentiment)) {
          return false
        }

        // Source Filter (if implemented in UI)
        // If sources array is populated, check if mention source matches
        if (state.filters.sources.length > 0) {
           // Assumption: mention.source.name or type matches one of the selected sources
           // API returns source object. We need to match based on UI values (Facebook, Instagram etc)
           // This might be tricky if API source names differ.
           // For now, let's skip source filtering or do a basic inclusion check if source.name is standard.
           const sourceName = mention.source.name || mention.source.type
           // If UI sends 'Facebook', and mention has 'Facebook', it matches.
           // We'll implementation flexible match
           const isMatch = state.filters.sources.some(s => sourceName.toLowerCase().includes(s.toLowerCase()))
           if (!isMatch) return false
        }

        // Search Filter
        if (state.filters.search) {
          const query = state.filters.search.toLowerCase()
          return (
            mention.title?.toLowerCase().includes(query) ||
            mention.snippet?.toLowerCase().includes(query) ||
            mention.source.name?.toLowerCase().includes(query)
          )
        }

        return true
      })
    }
  },

  actions: {
    async initialize() {
      this.loading = true
      this.error = null
      try {
        // Authenticate first
        await lodifyApi.getToken()
        
        // Initial fetch
        await this.fetchMentions()
      } catch (err: any) {
        console.error('Failed to initialize mentions store:', err)
        this.error = err.message || 'Failed to initialize'
      } finally {
        this.loading = false
      }
    },

    async fetchMentions() {
      this.loading = true
      this.error = null
      
      // Mock Mode Check
      if (this.mockMode) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const mockMentions: Mention[] = [
          {
            id: '1',
            title: 'Untung Besar Modal Kecil: 5 Trik Emas Wajib Tahu',
            domain: 'facebook.com',
            visits: 1148,
            influenceScore: 4,
            snippet: 'Baca Juga: MotoGP Dorong Pertumbuhan Ekonomi Lokal, <span class="highlighted-keyword">Telkom</span> Tingkatkan Konektivitas InternetPenting untuk selalu menekankan pentingnya kepemilikan sertifikasi resmi.',
            keywords: ['Telkom'],
            sentiment: 'neutral',
            timestamp: new Date().toISOString(),
            source: { type: 'social', name: 'Facebook', avatar: '' }
          },
          {
            id: '2',
            title: 'Fix! Samsung Galaxy S26 Series Tetap Pakai Formasi Lama',
            domain: 'instagram.com',
            visits: 8206,
            influenceScore: 8,
            snippet: 'Itu artinya, tinggal satu sertifikasi lagi, yakni Postel oleh Ditjen SDPPI Kementerian Komunikasi dan Digital (<span class="highlighted-keyword">Komdigi</span>), sebelum ketiga nya bisa dijual resmi di pasar dalam negeri.',
            keywords: ['Komdigi'],
            sentiment: 'neutral',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            source: { type: 'social', name: 'Instagram', avatar: '' }
          },
          {
            id: '3',
            title: 'Menkominfo Bahas Transformasi Digital Bersama Telkom',
            domain: 'twitter.com',
            visits: 15420,
            influenceScore: 9,
            snippet: '<span class="highlighted-keyword">Telkom</span> Indonesia terus memperkuat infrastruktur digital di seluruh nusantara. Menteri <span class="highlighted-keyword">Komdigi</span> menyatakan apresiasi terhadap langkah strategis ini.',
            keywords: ['Telkom', 'Komdigi'],
            sentiment: 'positive',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            source: { type: 'social', name: 'X (Twitter)', avatar: '' }
          },
          {
            id: '4',
            title: 'Kritik Layanan Internet di Daerah Terpencil',
            domain: 'detik.com',
            visits: 523,
            influenceScore: 3,
            snippet: 'Layanan internet dari <span class="highlighted-keyword">Telkom</span> masih belum merata. Banyak daerah terpencil yang kesulitan akses. @<span class="highlighted-keyword">Komdigi</span> perlu turun tangan.',
            keywords: ['Telkom', 'Komdigi'],
            sentiment: 'negative',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            source: { type: 'news', name: 'News', avatar: '' }
          },
        ]
        
        this.mentions = mockMentions
        this.loading = false
        return
      }

      try {
        const response = await lodifyApi.getAllMentions(1, 100) // Fetch first 100 for client-side filtering
        
        let rawItems: any[] = []
        
        // Handle response structure
        if (Array.isArray(response)) {
          rawItems = response
        } else if (response && Array.isArray(response.items)) {
           rawItems = response.items
        } else {
           console.warn('Unexpected API response format:', response)
           rawItems = []
           if (response && response.detail) {
             console.error('API Error Detail:', response.detail)
             this.error = `API Error: ${JSON.stringify(response.detail)}`
           }
        }

        // Map API fields to Mention interface
        this.mentions = rawItems.map((item, index) => ({
          id: item.id ? String(item.id) : `gen-${index}`,
          title: item.title || 'Untitled Mention',
          domain: item.domain || 'unknown.com',
          
          // API doesn't provide these fields - use defaults
          visits: 0,
          influenceScore: 0,
          
          snippet: item.content || 'No content available',
          keywords: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
          
          // Map source string to object
          source: {
            type: this.inferSourceType(item.source || ''),
            name: item.source || 'Unknown Source',
            avatar: '',
          },
          
          // Map sentiment int (-1/0/1) to string
          sentiment: this.mapSentimentIntToString(item.sentiment),
            
          // Combine date + hrs into ISO timestamp
          timestamp: this.combineDateTime(item.date, item.hrs)
        }))

      } catch (err: any) {
        console.error('Failed to fetch mentions:', err)
        this.error = err.message || 'Failed to fetch mentions'
        this.mentions = [] 
      } finally {
        this.loading = false
      }
    },

    // Helper: Map sentiment int to string
    mapSentimentIntToString(sentimentInt: number): 'positive' | 'neutral' | 'negative' {
      if (sentimentInt > 0) return 'positive'
      if (sentimentInt < 0) return 'negative'
      return 'neutral'
    },

    // Helper: Infer source type from name
    inferSourceType(sourceName: string): 'social' | 'news' | 'web' {
      const lower = sourceName.toLowerCase()
      if (lower.includes('facebook') || lower.includes('instagram') || 
          lower.includes('twitter') || lower.includes('tiktok') || 
          lower.includes('youtube')) {
        return 'social'
      }
      if (lower.includes('news') || lower.includes('artikel')) {
        return 'news'
      }
      return 'web'
    },

    // Helper: Combine date and time
    combineDateTime(date: string, hrs: string): string {
      if (!date || !hrs) return new Date().toISOString()
      return `${date}T${hrs}`
    },

    setMockMode(enabled: boolean) {
      this.mockMode = enabled
      // Re-fetch to apply change
      this.fetchMentions()
    },

    async getAIInsight() {
      this.loading = true
      try {
        // Use dynamic credentials from token (no hardcoding needed)
        const result = await lodifyApi.getAIInsight()
        
        // Handle nested response structure: data.data.getAiReport.body.insights
        const reportData = result?.data?.getAiReport?.body
        if (reportData && reportData.insights) {
            this.aiInsight = reportData.insights
        } else {
            this.aiInsight = typeof result === 'string' ? result : JSON.stringify(result)
        }
        
        return this.aiInsight
      } catch (err: any) {
        console.error('Failed to get AI insight:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    setDateFilter(from: string, to: string) {
      this.filters.dateFrom = from
      this.filters.dateTo = to
      this.fetchMentions()
    }
  },
})
