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
        // Date Filter (Client-side implementation until Backend API supports it)
        if (state.filters.dateFrom && state.filters.dateTo) {
          const mentionDate = new Date(mention.timestamp)
          const fromDate = new Date(state.filters.dateFrom)
          const toDate = new Date(state.filters.dateTo)
          
          // Set to end of day for comparison
          toDate.setHours(23, 59, 59, 999)
          
          if (mentionDate < fromDate || mentionDate > toDate) {
            return false
          }
        }
        
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
      // Prevent double fetching if already loading
      if (this.loading) return
      
      this.loading = true
      this.error = null
      
      // Mock Mode Check
      if (this.mockMode) {
        // ... (Keep existing mock logic unchanged for now, truncated for brevity in this edit if not needed, but I will preserve strict structure)
        // ... simulating existing mock logic ...
        await new Promise(resolve => setTimeout(resolve, 800))
         // (Using existing mock data structure from original file)
         // For brevity, I'm assuming mock logic is strictly for demo/dev without API
         // I will reinstate the FULL mock logic to ensure no regression.
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
            source: { type: 'social', name: 'Facebook', avatar: '' },
            likes: 120,
            comments: 45,
            shares: 12,
            category: 'Social Media',
            tags: ['Telkom']
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
            source: { type: 'social', name: 'Instagram', avatar: '' },
            likes: 850,
            comments: 200,
            shares: 50,
            category: 'Social Media',
            tags: ['Komdigi']
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
            source: { type: 'social', name: 'X (Twitter)', avatar: '' },
            likes: 1542,
            comments: 320,
            shares: 890,
            category: 'Social Media',
            tags: ['Telkom', 'Komdigi']
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
            source: { type: 'news', name: 'News', avatar: '' },
            likes: 5,
            comments: 2,
            shares: 0,
            category: 'News',
            tags: ['Telkom', 'Komdigi']
          },
        ]
        this.mentions = mockMentions
        this.loading = false
        return
      }

      try {
        // 🚀 PROGRESSIVE LOADING STRATEGY
        // Phase 1: Quick First Paint
        // Get Page 1 immediately to show data to user fast
        const firstPageResponse = await lodifyApi.getAllMentions(1, 100)
        
        // Handle case where API assumes empty array if no data
        const initialItems = firstPageResponse?.items || firstPageResponse?.data || []
        const totalItems = firstPageResponse?.total || 0
        const totalPages = firstPageResponse?.pages || 0

        // Process Phase 1 Data
        this.mentions = this.transformMentions(initialItems)
        
        console.log(`Phase 1 Complete: Loaded ${this.mentions.length} of ${totalItems} items. Total Pages: ${totalPages}`)
        
        // If only 1 page or no data, we are done
        if (totalPages <= 1) {
            this.loading = false
            return
        }

        // Phase 2: Background Batch Fetching
        // We continue loading in background, but update `loading` to false 
        // effectively, so UI shows the first batch while we fetch the rest.
        // Option: We could keep a separate `isBackgroundLoading` state if we want a spinner.
        // For now, let's keep `loading = true` but maybe user sees data appearing? 
        // Better UX: Show data immediately, show small loader for rest.
        this.loading = false // ALLOW UI TO RENDER PAGE 1

        // Calculate remaining pages
        const remainingPages = []
        for (let i = 2; i <= totalPages; i++) {
            remainingPages.push(i)
        }

        // Batch processing (Chunking by 5 pages)
        const BATCH_SIZE = 5
        
        for (let i = 0; i < remainingPages.length; i += BATCH_SIZE) {
            const batch = remainingPages.slice(i, i + BATCH_SIZE)
            
            try {
                // Fetch batch in parallel
                const responses = await Promise.all(
                    batch.map(page => lodifyApi.getAllMentions(page, 100))
                )
                
                let batchItems: any[] = []
                responses.forEach(res => {
                    const items = res?.items || res?.data || []
                    batchItems = [...batchItems, ...items]
                })

                // Append new items to mentions state efficiently
                const newMentions = this.transformMentions(batchItems)
                this.mentions = [...this.mentions, ...newMentions]
                
                console.log(`Batch Loaded: Pages ${batch.join(', ')} added ${newMentions.length} items. Total now: ${this.mentions.length}`)

                // 🛑 YIELD TO MAIN THREAD
                // Prevent freezing by waiting a tiny bit between batches
                await new Promise(resolve => setTimeout(resolve, 100))

            } catch (batchErr) {
                console.error(`Failed to load batch ${batch.join(', ')}`, batchErr)
                // Continue to next batch even if this one fails (Robustness)
            }
        }

      } catch (err: any) {
        console.error('Failed to fetch mentions:', err)
        this.error = err.message || 'Failed to fetch mentions'
        // Ideally preserve old data if fetch fails? For now reset or keep emptiness.
        if (this.mentions.length === 0) this.mentions = [] 
        this.loading = false
      }
    },

    // Helper: Transform API Raw Item to Mention Object
    transformMentions(rawItems: any[]): Mention[] {
        return rawItems.map((item, index) => ({
          id: item.id ? String(item.id) : `gen-${Math.random()}`, // Use random if index is not reliable across batches
          title: item.title || 'Untitled Mention',
          domain: item.domain || 'unknown.com',
          
          visits: 0,
          influenceScore: 0,
          
          snippet: item.content || 'No content available',
          keywords: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
          
          source: {
            type: this.inferSourceType(item.source || ''),
            name: item.source || 'Unknown Source',
            avatar: '',
          },
          
          likes: item.likes || 0,
          comments: item.comments || 0,
          shares: item.shares || 0,
          category: item.category || 'Uncategorized',
          tags: item.tags ? item.tags.split(',') : [],
          
          sentiment: this.mapSentimentIntToString(item.sentiment),
          timestamp: this.combineDateTime(item.date, item.hrs)
        }))
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



    // Manual Sync: Step 1 - Trigger scraping (Brand24 → Google Sheets)
    async triggerScraping(dateFrom: string, dateTo: string) {
      try {
        const result = await lodifyApi.fetchMentions(dateFrom, dateTo)
        console.log('Scraping triggered:', result)
        return result
      } catch (err: any) {
        console.error('Scraping failed:', err)
        throw new Error(`Scraping failed: ${err.message || 'Unknown error'}`)
      }
    },

    // Manual Sync: Step 2 - Truncate (Clear old data from Google Sheets)
    async truncateData() {
      try {
        const result = await lodifyApi.truncate()
        console.log('Data truncated:', result)
        return result
      } catch (err: any) {
        console.error('Truncate failed:', err)
        throw new Error(`Truncate failed: ${err.message || 'Unknown error'}`)
      }
    },

    // Manual Sync: Step 3 - Sync data (Google Sheets → Database)
    async syncDataToDatabase(dateFrom: string, dateTo: string) {
      try {
        const result = await lodifyApi.syncData(dateFrom, dateTo)
        console.log('Data synced to database:', result)
        return result
      } catch (err: any) {
        console.error('Database sync failed:', err)
        throw new Error(`Database sync failed: ${err.message || 'Unknown error'}`)
      }
    },

    setDateFilter(from: string, to: string) {
      this.filters.dateFrom = from
      this.filters.dateTo = to
      this.fetchMentions()
    }
  },
})
