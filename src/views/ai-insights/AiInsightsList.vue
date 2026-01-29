<script setup lang="ts">
import { useAiInsightsStore } from '@/stores/useAiInsightsStore'
import { computed } from 'vue'

const store = useAiInsightsStore()
const insights = computed(() => store.insights)
const loading = computed(() => store.loading)

// Helper to format content with bold text if markdown-like syntax is used (simple implementation)
// For now, we trust the HTML or just render plain text. 
// If generic markdown is needed, we'd use a library. 
// Here, we just replace **text** with <b>text</b> for simple bolding.
const formatContent = (text: string) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
}
</script>

<template>
  <VCard title="Insights" class="h-100">
    <VCardText v-if="loading" class="d-flex justify-center align-center" style="min-height: 200px">
      <VProgressCircular indeterminate color="primary" />
    </VCardText>

    <VCardText v-else-if="insights.length === 0" class="text-center text-disabled">
      No insights available for this period.
    </VCardText>

    <VCardText v-else class="pa-6">
      <div v-for="(insight, index) in insights" :key="insight.id" class="mb-5 insight-item">
        <div class="d-flex align-start">
          <!-- Numbering: Plain Text, Theme Aware -->
          <div class="me-3 mt-0 text-body-1 font-weight-bold opacity-100">
             {{ index + 1 }}.
          </div>
          
          <div class="flex-grow-1">
            <!-- Title: Bold, High Emphasis -->
            <h3 class="text-body-1 font-weight-bold mb-1 text-high-emphasis">
              {{ insight.title }}
            </h3>
            
            <!-- Content: Regular, Medium Emphasis -->
            <p class="text-body-2 mb-1 text-medium-emphasis" v-html="formatContent(insight.content)" style="line-height: 1.6;"></p>
            
            <!-- Citations: Green, text-only [1] -->
            <div class="d-flex flex-wrap gap-2 align-center mt-1">
              <span 
                v-for="(citation, cIndex) in insight.citations" 
                :key="cIndex" 
                class="text-success font-weight-bold text-caption cursor-pointer citation-link"
              >
                [{{ cIndex + 1 }}]
              </span>
            </div>
          </div>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
.insight-item:last-child {
  margin-bottom: 0 !important;
}

.citation-link:hover {
    text-decoration: underline;
}
</style>
