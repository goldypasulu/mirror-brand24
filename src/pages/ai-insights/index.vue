<script setup lang="ts">
import { useAiInsightsStore } from '@/stores/useAiInsightsStore'
import AiInsightsChart from '@/views/ai-insights/AiInsightsChart.vue'
import AiInsightsList from '@/views/ai-insights/AiInsightsList.vue'
import AiReportsSidebar from '@/views/ai-insights/AiReportsSidebar.vue'
import AppDateTimePicker from '@core/components/app-form-elements/AppDateTimePicker.vue'
import { onMounted } from 'vue'

const store = useAiInsightsStore()

// Date range state (synced with store or local for now)
const dateRange = ref('2024-01-20 to 2024-01-26')

onMounted(() => {
  store.fetchInsights()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-wrap justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h4 font-weight-bold mb-1">
            AI Insights
            <VChip class="ms-2" color="primary" variant="tonal" size="small">BETA</VChip>
        </h2>
        <p class="text-body-1 text-medium-emphasis">
            Analyze your project with AI-generated insights.
        </p>
      </div>

      <div style="width: 250px;">
         <AppDateTimePicker
            v-model="dateRange"
            placeholder="Select Date Range"
            :config="{ mode: 'range' }"
            density="compact"
          />
      </div>
    </div>

    <!-- Content -->
    <VRow class="match-height">
      <!-- Left Column: Insights List (Approx 42%) -->
      <VCol cols="12" md="6" lg="5">
        <AiInsightsList />
      </VCol>

      <!-- Center Column: Charts (Approx 42%) -->
      <VCol cols="12" md="6" lg="5">
        <AiInsightsChart />
      </VCol>

      <!-- Right Sidebar: Reports (Approx 16%) -->
      <VCol cols="12" md="12" lg="2">
        <AiReportsSidebar />
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
.gap-6 {
    gap: 24px;
}
</style>
