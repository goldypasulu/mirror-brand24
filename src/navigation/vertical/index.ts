import type { VerticalNavItems } from '@layouts/types'
import aiInsights from './ai-insights'
import mentions from './mentions'

export default [...mentions, ...aiInsights] as VerticalNavItems
