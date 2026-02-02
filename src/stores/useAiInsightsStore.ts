import { lodifyApi } from '@/services/lodifyApi'; // Import API service

// Structure for the UI (kept similar to existing to minimize UI breakage)
interface AiInsight {
  id: number
  title: string
  content: string
  sentiment: 'positive' | 'negative' | 'neutral'
  citations: { source: string; date: string }[]
}

export interface ChartData {
  categories: string[]
  series: {
    name: string
    data: number[]
  }[]
}

// ... (Keep existing Chart/Report interfaces) ...

export const useAiInsightsStore = defineStore('aiInsights', {
  state: () => ({
    report: {
      headline: '',
      trends: '' as string, // HTML String <ol><li>...</li></ol>
      insights: '' as string, // HTML String <ol><li>...</li></ol>
      recommendations: '' as string, // HTML String <ol><li>...</li></ol>
    },
    loading: false,
    error: null as string | null,
    reports: [] as any[], // Helper for Sidebar UI (to avoid crash)
    chartData: null as ChartData | null,
  }),

  actions: {
    async fetchInsights() {
      this.loading = true
      this.error = null
      
      try {
        // 🚀 REAL API CALL (Using Verified IDs)
        const PROVEN_PROJECT_ID = 1397360667
        const PROVEN_REPORT_ID = '69774c766abe1b970ce41087'
        
        const response = await lodifyApi.getAIInsight(PROVEN_PROJECT_ID, PROVEN_REPORT_ID)
        
        // Handle response structure
        console.log('[DEBUG-STORE] Store received:', response)
        
        // Try to find the body deep in standard GraphQL structure or direct structure
        // API Wraps it in { status: "success", data: { data: { getAiReport: ... } } }
        let rawBody = response?.data?.data?.getAiReport?.body
                   || response?.data?.getAiReport?.body 
                   || response?.getAiReport?.body 
                   || response?.body 
                   || {}

        console.log('[DEBUG-STORE] Found raw body part:', typeof rawBody, rawBody)
        
        let reportBody = rawBody
        if (typeof rawBody === 'string') {
            try {
                reportBody = JSON.parse(rawBody)
                console.log('[DEBUG-STORE] Parsed string body:', reportBody)
            } catch (e) {
                console.error('[DEBUG-STORE] Failed to parse string body:', e)
            }
        }
        
        // Update State - DIRECT ASSIGNMENT (API returns HTML strings)
        this.report = {
          headline: reportBody.headline || 'No headline available',
          trends: reportBody.trends || '',
          insights: reportBody.insights || '',
          recommendations: reportBody.recommendations || '',
        }

      } catch (err: any) {
        console.error('Failed to fetch AI insights:', err)
        this.error = err.message || 'Failed to load insights'
      } finally {
        this.loading = false
      }
    },
  },
})
