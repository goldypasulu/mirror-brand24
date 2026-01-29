import type { VerticalNavItems } from '@layouts/types'
import aiInsights from './ai-insights'
import appsAndPages from './apps-and-pages'
import charts from './charts'
import dashboard from './dashboard'
import forms from './forms'
import mentions from './mentions'
import others from './others'
import uiElements from './ui-elements'

export default [...mentions, ...aiInsights, ...dashboard, ...appsAndPages, ...uiElements, ...forms, ...charts, ...others] as VerticalNavItems
