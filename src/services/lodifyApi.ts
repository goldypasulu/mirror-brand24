import { createFetch } from '@vueuse/core'

/**
 * Service for interacting with Lodify API
 * Docs: https://api.lodify.lodemo.id/docs
 */

// Use Vite proxy to avoid CORS issues
// Proxy configured in vite.config.ts: /scrap/* → https://api.lodify.lodemo.id
const useLodify = createFetch({
  baseUrl: '',  // Empty = use relative path → Vite proxy
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

// Token storage with localStorage persistence
const TOKEN_STORAGE_KEY = 'lodify_token_data'
let _tokenData: LodifyToken | null = null

// Helper: Load token from localStorage
function loadTokenFromStorage(): LodifyToken | null {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as LodifyToken
    }
  } catch (e) {
    console.error('Failed to load token from localStorage:', e)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
  return null
}

// Helper: Save token to localStorage
function saveTokenToStorage(token: LodifyToken): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token))
  } catch (e) {
    console.error('Failed to save token to localStorage:', e)
  }
}

export const lodifyApi = {
  // Authentication
  async getToken(): Promise<LodifyToken> {
    // 1. Check in-memory cache first (fastest)
    if (_tokenData) return _tokenData
    
    // 2. Check localStorage (survives page refresh)
    const storedToken = loadTokenFromStorage()
    if (storedToken) {
      _tokenData = storedToken
      return _tokenData
    }
    
    // 3. Fetch new token from API
    const { data, error } = await useLodify('/scrap/gettoken').post({
      username: 'julian@lodagency.co.id',
      password: '@Lod@2025v2'
    }).json()
    
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

    // 4. Save to localStorage for persistence
    saveTokenToStorage(_tokenData)

    return _tokenData
  },

  // Fetch Mentions (Scrape from Brand24 → Google Sheets)
  async fetchMentions(dateFrom: string, dateTo: string) {
    // Get credentials with all required data
    const credentials = await this.getToken()
    
    // According to docs: POST /scrap/scrap-data?date_from=...&date_to=...
    const url = `/scrap/scrap-data?date_from=${dateFrom}&date_to=${dateTo}`
    
    // Send all required headers exactly as shown in Postman
    // IMPORTANT: Send empty object {} as body to match Node.js behavior
    // Browser was sending undefined, causing backend to fail reading Excel file
    const { data, error } = await useLodify(url, {
      headers: {
        'Cookie': credentials.cookies,        // Required: Brand24 session cookies
        'token': credentials.token,           // Required: Lodify token
        'project-id': credentials.project_id, // Required: Brand24 project ID (with dash!)
        'tknb24': credentials.token,           // Required: Same as token
      }
    }).post({}).json()

    if (error.value) {
      throw new Error(error.value)
    }

    return data.value
  },

  // Truncate (Clear scraped data from Google Sheets)
  // Position: After scraping, before data insertion
  async truncate() {
    // Get credentials with all required data
    const credentials = await this.getToken()
    
    // According to Postman: DELETE /scrap/truncate
    const url = '/scrap/truncate'
    
    // Send all required headers exactly as shown in Postman
    const { data, error } = await useLodify(url, {
      headers: {
        'Cookie': credentials.cookies,        // Required: Brand24 session cookies
        'token': credentials.token,           // Required: Lodify token
        'project-id': credentials.project_id, // Required: Brand24 project ID (with dash!)
        'tknb24': credentials.token,          // Required: Same as token
      }
    }).delete().json()

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
  
  // Logout: Clear token from memory and localStorage
  logout() {
    _tokenData = null
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch (e) {
      console.error('Failed to remove token from localStorage:', e)
    }
  },

  // Sync Data (Insert from Google Sheets → Database)
  async syncData(dateFrom: string, dateTo: string) {
    // Get credentials with all required data
    const credentials = await this.getToken()
    
    const url = `/scrap/insert-data?date_from=${dateFrom}&date_to=${dateTo}`
    
    // Send all required headers exactly as shown in Postman
    // IMPORTANT: Send empty object {} as body to match Node.js behavior
    // Browser was sending undefined, causing backend to fail reading Excel file
    const { data, error } = await useLodify(url, {
      headers: {
        'Cookie': credentials.cookies,        // Required: Brand24 session cookies
        'token': credentials.token,           // Required: Lodify token
        'project-id': credentials.project_id, // Required: Brand24 project ID (with dash!)
        'tknb24': credentials.token,           // Required: Same as token
      }
    }).post({}).json()

    if (error.value) {
      throw new Error(error.value)
    }

    return data.value
  }
}
