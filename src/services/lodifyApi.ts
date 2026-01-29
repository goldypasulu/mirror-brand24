import { createFetch } from '@vueuse/core'

/**
 * Service for interacting with Lodify API
 * Docs: https://api.lodify.lodemo.id/docs
 */

// We use a separate instance for Lodify API to avoid mixing auth with main app
// Base URL is empty to use relative path, which is handled by Vite proxy in dev
const useLodify = createFetch({
  baseUrl: '', 
  fetchOptions: {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },
  options: {
    async beforeFetch({ options }) {
      if (_tokenData?.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${_tokenData.token}`,
        }
      }
      return { options }
    },
  },
})

// Types
export interface LodifyToken {
  status: string
  token: string
  cookies: string
  project_id: string
  report_id: string
}

export interface LodifyMention {
  // Define structure based on actual API response
  // For now using flexible typing, will refine when we see real data
  [key: string]: any
}

// Token storage (in-memory)
let _tokenData: LodifyToken | null = null

export const lodifyApi = {
  // Authentication
  async getToken(): Promise<LodifyToken> {
    if (_tokenData) return _tokenData
    
    // The endpoint is POST /scrap/gettoken based on 405 response
    const { data, error } = await useLodify('/scrap/gettoken').post().json()
    
    if (error.value) {
      console.error('Failed to get Lodify token:', error.value)
      throw new Error('Failed to authenticate with Lodify')
    }

    // Store complete token data including project_id, report_id, and cookies
    _tokenData = data.value as LodifyToken
    
    if (!_tokenData?.token) {
       console.error('Token missing in response:', data.value)
       throw new Error('Invalid token response')
    }

    return _tokenData
  },

  // Fetch Mentions
  async fetchMentions(dateFrom: string, dateTo: string) {
    // According to docs: POST /scrap/scrap-data?date_from=...&date_to=...
    const url = `/scrap/scrap-data?date_from=${dateFrom}&date_to=${dateTo}`
    
    const { data, error, isFinished } = await useLodify(url).post().json()

    if (error.value) {
      throw new Error(error.value)
    }

    return data.value
  },

  // Get AI Insight (uses credentials from getToken automatically)
  async getAIInsight() {
    const credentials = await this.getToken()
    
    const { data, error } = await useLodify('/scrap/get-ai-insight').post({
      projectId: parseInt(credentials.project_id),
      reportId: credentials.report_id
    }).json()

    if (error.value) {
      throw new Error(error.value)
    }

    return data.value
  },

  // Get All Mentions from Database (paginated)
  async getAllMentions(page: number = 1, size: number = 50) {
    await this.getToken() // Ensure authenticated
    
    const { data, error } = await useLodify(
      `/scrap/get-all-db?page=${page}&size=${size}`
    ).get().json()
    
    if (error.value) {
      console.error('Failed to fetch mentions:', error.value)
      throw new Error(error.value)
    }

    return data.value
  },
  
  // Sync Data (Insert)
  async syncData(dateFrom: string, dateTo: string) {
    const url = `/scrap/insert-data?date_from=${dateFrom}&date_to=${dateTo}`
    const { data, error } = await useLodify(url).post().json()

    if (error.value) {
      throw new Error(error.value)
    }

    return data.value
  }
}
