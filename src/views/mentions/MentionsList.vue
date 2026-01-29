<script lang="ts" setup>
import { useMentionsStore } from '@/stores/useMentionsStore'
import { storeToRefs } from 'pinia'
import MentionCard from './MentionCard.vue'

const store = useMentionsStore()
const { filteredMentions: mentions, loading, error } = storeToRefs(store)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10
const sortOrder = ref('recent')

const sortOptions = [
  { title: 'Recent first', value: 'recent' },
  { title: 'Oldest first', value: 'oldest' },
]

// Client-side sorting and pagination
const paginatedMentions = computed(() => {
  const allMentions = [...mentions.value]

  // Sort
  if (sortOrder.value === 'recent') {
    allMentions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } else if (sortOrder.value === 'oldest') {
    allMentions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  // Paginate
  const start = (currentPage.value - 1) * itemsPerPage
  return allMentions.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(mentions.value.length / itemsPerPage))

const handleSentimentUpdate = (mentionId: string, newSentiment: string) => {
  // Update local store state for immediate feedback
  const mention = mentions.value.find(m => m.id === mentionId)
  if (mention) {
    mention.sentiment = newSentiment as 'positive' | 'neutral' | 'negative'
  }
}
</script>

<template>
  <div>
    <!-- List Header -->
    <div class="d-flex align-center justify-space-between mb-4">
      <VSelect
        v-model="sortOrder"
        :items="sortOptions"
        item-title="title"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        style="max-width: 180px;"
      />

      <VPagination
        v-model="currentPage"
        :length="Math.max(1, totalPages)"
        :total-visible="7"
        density="comfortable"
        size="small"
      />
    </div>

    <!-- Error State -->
    <VAlert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ error }}
      <template #append>
        <VBtn
          color="error"
          variant="text"
          size="small"
          @click="store.fetchMentions()"
        >
          Retry
        </VBtn>
      </template>
    </VAlert>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex flex-column gap-4">
      <VSkeletonLoader
        v-for="i in 3"
        :key="i"
        type="article"
        class="mb-4"
      />
    </div>

    <!-- Empty State -->
    <div v-else-if="mentions.length === 0 && !error" class="text-center pa-8 text-medium-emphasis">
      No mentions found for the selected period.
    </div>

    <!-- Mention Cards -->
    <template v-else>
      <MentionCard
        v-for="mention in paginatedMentions"
        :key="mention.id"
        :mention="mention"
        @update:sentiment="handleSentimentUpdate(mention.id, $event)"
      />
    </template>

    <!-- Bottom Pagination -->
    <div v-if="totalPages > 1" class="d-flex justify-center mt-4">
      <VPagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        density="comfortable"
      />
    </div>
  </div>
</template>
