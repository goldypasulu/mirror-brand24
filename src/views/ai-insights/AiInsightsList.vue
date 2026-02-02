<script setup lang="ts">
import { useAiInsightsStore } from '@/stores/useAiInsightsStore'
import { computed, onMounted } from 'vue'

const store = useAiInsightsStore()

// Access raw report parts directly
const report = computed(() => store.report)
const loading = computed(() => store.loading)
const error = computed(() => store.error)

onMounted(() => {
    store.fetchInsights()
})

const formatContent = (text: string) => {
  if (!text) return ''
  // Basic bold formatting if needed, otherwise returns text
  return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
}
</script>

<template>
  <div class="ai-insights-container h-100">
    
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4">
       <h1 class="text-h4 font-weight-bold">AI Insights</h1>
       <VBtn 
        icon="tabler-refresh" 
        variant="text" 
        :loading="loading" 
        @click="store.fetchInsights()" 
       />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center h-50">
        <VProgressCircular indeterminate color="primary" size="64" />
        <span class="ms-4 text-h6 text-medium-emphasis">Analyzing data...</span>
    </div>

    <!-- Error State -->
    <VAlert v-else-if="error" type="error" variant="tonal" class="mb-4">
        {{ error }}
        <template #append>
            <VBtn variant="text" size="small" @click="store.fetchInsights()">Retry</VBtn>
        </template>
    </VAlert>

    <!-- Content -->
    <div v-else class="insights-content">
        
        <!-- 1. Executive Summary (Headline) -->
        <VCard v-if="report" class="mb-6 elevation-2" border>
            <VCardText class="pa-6">
                <div class="d-flex align-start gap-4">
                    <VAvatar color="primary" variant="tonal" size="48" rounded>
                        <VIcon icon="tabler-sparkles" size="28" />
                    </VAvatar>
                    <div>
                        <div class="text-overline text-primary font-weight-bold mb-1">EXECUTIVE SUMMARY</div>
                        <h2 class="text-h5 font-weight-medium" style="line-height: 1.5;">
                            {{ report.headline }}
                        </h2>
                    </div>
                </div>
            </VCardText>
        </VCard>

        <!-- 2. Trends -->
        <div v-if="report && report.trends" class="mb-6">
            <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center">
                <VIcon icon="tabler-trending-up" class="me-2 text-success" />
                Trends
            </h3>
            <VCard variant="outlined" class="bg-surface">
                <VCardText>
                    <!-- API returns <ol><li>...</li></ol> HTML string -->
                    <div class="insight-html-content" v-html="report.trends"></div>
                </VCardText>
            </VCard>
        </div>

        <!-- 3. Key Insights -->
        <div v-if="report && report.insights" class="mb-6">
            <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center">
                <VIcon icon="tabler-bulb" class="me-2 text-warning" />
                Key Insights
            </h3>
            <VCard variant="outlined" class="bg-surface">
                 <VCardText>
                     <div class="insight-html-content" v-html="report.insights"></div>
                </VCardText>
            </VCard>
        </div>

        <!-- 4. Recommendations -->
        <div v-if="report && report.recommendations" class="mb-6">
            <h3 class="text-h6 font-weight-bold mb-3 d-flex align-center">
                <VIcon icon="tabler-check" class="me-2 text-info" />
                Recommendations
            </h3>
            <VCard variant="outlined" class="bg-surface">
                 <VCardText>
                     <div class="insight-html-content" v-html="report.recommendations"></div>
                </VCardText>
            </VCard>
        </div>

    </div>
  </div>
</template>

<style scoped>
.gap-3 {
    gap: 12px;
}
.gap-4 {
    gap: 16px;
}

/* Style raw HTML from API */
:deep(.insight-html-content ol) {
    margin-left: 1.5rem;
    margin-bottom: 0;
}
:deep(.insight-html-content li) {
    margin-bottom: 0.75rem;
    line-height: 1.6;
}
:deep(.insight-html-content li:last-child) {
    margin-bottom: 0;
}
:deep(.insight-html-content b) {
    font-weight: 600;
    color: rgba(var(--v-theme-on-surface), 0.87);
}
</style>
