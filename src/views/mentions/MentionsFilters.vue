<script lang="ts" setup>
import { useMentionsStore } from '@/stores/useMentionsStore';

const store = useMentionsStore()

// --- State Definitions ---

// Date range
const dateRange = ref('Last 30 days')
const dateOptions = [
  'Last 7 days',
  'Last 30 days',
  'Last 3 months',
  'Last 6 months',
  'Last year',
]

// Sources with counts
const sources = ref([
  { name: 'Facebook', icon: 'tabler-brand-facebook', count: 841, checked: true },
  { name: 'Instagram', icon: 'tabler-brand-instagram', count: 171, checked: true },
  { name: 'X (Twitter)', icon: 'tabler-brand-x', count: 1421, checked: true },
  { name: 'TikTok', icon: 'tabler-brand-tiktok', count: 56, checked: true },
  { name: 'Video', icon: 'tabler-video', count: 23, checked: true },
  { name: 'News', icon: 'tabler-news', count: 445, checked: true },
  { name: 'Podcasts', icon: 'tabler-microphone', count: 8, checked: true },
  { name: 'Other Socials', icon: 'tabler-social', count: 12, checked: true },
  { name: 'Blogs', icon: 'tabler-article', count: 735, checked: true },
  { name: 'Web', icon: 'tabler-world', count: 1786, checked: true },
])

// Sentiments
const sentiments = ref([
  { name: 'Negative', color: 'error', checked: true },
  { name: 'Neutral', color: 'grey', checked: true },
  { name: 'Positive', color: 'success', checked: true },
])

// Search
const searchQuery = ref('')

// AI Summary State
const isSummarizing = ref(false)
const aiSummaryResult = ref<string | null>(null)
const showSummaryDialog = ref(false)


// --- Computed ---

const showAllSources = ref(false)
const visibleSources = computed(() => {
  return showAllSources.value ? sources.value : sources.value.slice(0, 6)
})

const totalSourcesCount = computed(() => {
  return sources.value.reduce((sum, s) => sum + s.count, 0)
})


// --- Functions & Watchers ---

// Map date range to actual dates
const updateDateFilter = (range: string) => {
  const end = new Date()
  const start = new Date()

  switch (range) {
    case 'Last 7 days':
      start.setDate(end.getDate() - 7)
      break
    case 'Last 30 days':
      start.setDate(end.getDate() - 30)
      break
    case 'Last 3 months':
      start.setMonth(end.getMonth() - 3)
      break
    case 'Last 6 months':
      start.setMonth(end.getMonth() - 6)
      break
    case 'Last year':
      start.setFullYear(end.getFullYear() - 1)
      break
    default:
      start.setDate(end.getDate() - 30)
  }

  // Format as YYYY-MM-DD
  const formatDate = (d: Date) => d.toISOString().split('T')[0]
  store.setDateFilter(formatDate(start), formatDate(end))
}

const handleAISummary = async () => {
  isSummarizing.value = true
  try {
    const summary = await store.getAIInsight()
    aiSummaryResult.value = summary
    showSummaryDialog.value = true
  } catch (err) {
    console.error(err)
  } finally {
    isSummarizing.value = false
  }
}

// Sync UI filters to Store
const updateStoreFilters = () => {
  // Sources
  const activeSources = sources.value.filter(s => s.checked).map(s => s.name)
  store.filters.sources = activeSources

  // Sentiments
  const activeSentiments = sentiments.value.filter(s => s.checked).map(s => s.name.toLowerCase())
  store.filters.sentiments = activeSentiments

  // Search
  store.filters.search = searchQuery.value
}

// Watchers
watch(dateRange, (newVal) => {
  updateDateFilter(newVal)
})

watch([sources, sentiments, searchQuery], () => {
  updateStoreFilters()
}, { deep: true })

// Lifecycle
onMounted(() => {
  updateDateFilter(dateRange.value)
  updateStoreFilters() // Sync initial state
})

</script>

<template>
  <VCard>
    <VCardText>
      <!-- Date Range -->
      <div class="mb-6">
        <VSelect
          v-model="dateRange"
          :items="dateOptions"
          label="Date Range"
          density="comfortable"
          variant="outlined"
          hide-details
        />
      </div>

      <!-- Summarize with AI Button -->
      <VBtn
        block
        color="primary"
        variant="outlined"
        class="mb-6 summarize-btn"
        prepend-icon="tabler-sparkles"
        :loading="isSummarizing"
        @click="handleAISummary"
      >
        Summarize with AI
      </VBtn>

      <VDivider class="mb-4" />

      <!-- Sources -->
      <div class="mb-4">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-subtitle-1 font-weight-medium">Sources</span>
          <VBtn
            variant="text"
            size="small"
            @click="showAllSources = !showAllSources"
          >
            Show all ({{ totalSourcesCount }})
          </VBtn>
        </div>

        <div class="sources-grid">
          <VCheckbox
            v-for="source in visibleSources"
            :key="source.name"
            v-model="source.checked"
            density="compact"
            hide-details
          >
            <template #label>
              <div class="d-flex align-center gap-2">
                <VIcon :icon="source.icon" size="18" />
                <span>{{ source.name }}</span>
                <span class="text-medium-emphasis">({{ source.count }})</span>
              </div>
            </template>
          </VCheckbox>
        </div>
      </div>

      <VDivider class="mb-4" />

      <!-- Sentiment -->
      <div class="mb-4">
        <span class="text-subtitle-1 font-weight-medium d-block mb-2">Sentiment</span>
        <div class="d-flex gap-4">
          <VCheckbox
            v-for="sentiment in sentiments"
            :key="sentiment.name"
            v-model="sentiment.checked"
            :color="sentiment.color"
            density="compact"
            hide-details
            :label="sentiment.name"
          />
        </div>
      </div>

      <VDivider class="mb-4" />

      <!-- Text Search -->
      <div>
        <span class="text-subtitle-1 font-weight-medium d-block mb-2">Search</span>
        <VTextField
          v-model="searchQuery"
          placeholder="Search mentions..."
          density="compact"
          variant="outlined"
          hide-details
          clearable
          prepend-inner-icon="tabler-search"
        />
      </div>
    </VCardText>

    <!-- AI Summary Dialog -->
    <VDialog v-model="showSummaryDialog" max-width="500">
      <VCard>
        <VCardTitle class="d-flex align-center gap-2">
          <VIcon icon="tabler-sparkles" color="primary" />
          AI Summary
        </VCardTitle>
        <VCardText>
          <div v-if="aiSummaryResult" class="text-body-1">
            {{ aiSummaryResult }}
          </div>
          <div v-else class="text-center pa-4">
            No summary available.
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="primary" @click="showSummaryDialog = false">Close</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VCard>
</template>

<style scoped>
.summarize-btn {
  background: linear-gradient(135deg, rgba(14, 239, 136, 0.1) 0%, rgba(14, 239, 136, 0.05) 100%);
  border: 1px solid rgb(var(--v-theme-primary));
}

.sources-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}
</style>
