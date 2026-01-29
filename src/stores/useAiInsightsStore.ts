import { defineStore } from 'pinia'

interface AiInsight {
  id: number
  title: string
  content: string
  sentiment: 'positive' | 'negative' | 'neutral'
  citations: { source: string; date: string }[]
}

interface ChartData {
  series: {
    name: string
    data: number[]
  }[]
  categories: string[]
}

interface WeeklyReport {
  id: number
  range: string
  sent: boolean
}

interface AiInsightsState {
  insights: AiInsight[]
  chartData: ChartData | null
  reports: WeeklyReport[]
  loading: boolean
  mockMode: boolean
}

export const useAiInsightsStore = defineStore('aiInsights', {
  state: (): AiInsightsState => ({
    insights: [],
    chartData: null,
    reports: [],
    loading: false,
    mockMode: true,
  }),

  actions: {
    async fetchInsights() {
      this.loading = true
      
      // Simulate API delay if in mock mode
      if (this.mockMode) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        this.insights = [
          {
            id: 1,
            title: 'Increasing popularity of the "AI" topic',
            content: 'The "AI" topic has been generating significant buzz lately. Mentions have increased by **45%** compared to last week, driven largely by new product announcements from major tech companies.',
            sentiment: 'positive',
            citations: [{ source: 'Twitter', date: '2 hrs ago' }, { source: 'TechCrunch', date: '5 hrs ago' }]
          },
          {
            id: 2,
            title: 'Negative sentiment spike on Tuesday',
            content: 'A sudden spike in negative sentiment was observed on Tuesday regarding "server downtime". Users reported inability to access services for approximately 2 hours.',
            sentiment: 'negative',
            citations: [{ source: 'Facebook', date: '2 days ago' }]
          },
          {
            id: 3,
            title: 'Influencer engagement is high',
            content: 'Several key influencers in the tech space have shared your latest blog post. This has expanded your potential reach by **150k** users.',
            sentiment: 'positive',
            citations: [{ source: 'LinkedIn', date: '1 day ago' }]
          }
        ]

        this.chartData = {
          series: [
            {
              name: 'Mentions',
              data: [31, 40, 28, 51, 42, 109, 100],
            },
            {
              name: 'Reach',
              data: [11, 32, 45, 32, 34, 52, 41],
            },
          ],
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        }

        this.reports = [
          { id: 101, range: 'Jan 20 - Jan 26', sent: true },
          { id: 102, range: 'Jan 13 - Jan 19', sent: true },
          { id: 103, range: 'Jan 06 - Jan 12', sent: true },
        ]

        this.loading = false
      }
      // TODO: Implement real API call when endpoint is ready
    },
  },
})
