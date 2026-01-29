<script lang="ts" setup>
import type { Mention } from './types';

defineProps<{
  mention: Mention
}>()

const emit = defineEmits<{
  (e: 'update:sentiment', value: string): void
}>()

const sentimentOptions = [
  { title: 'Positive', value: 'positive', color: 'success' },
  { title: 'Neutral', value: 'neutral', color: 'secondary' },
  { title: 'Negative', value: 'negative', color: 'error' },
]

const getSentimentColor = (sentiment: string) => {
  const option = sentimentOptions.find(o => o.value === sentiment)
  return option?.color || 'secondary'
}
</script>

<template>
  <VCard class="mb-4">
    <VCardItem>
      <template #prepend>
        <VAvatar
          :image="mention.source.avatar"
          :color="mention.source.avatar ? undefined : 'primary'"
          size="42"
        >
          <span v-if="!mention.source.avatar" class="text-h6">
            {{ mention.source.name.charAt(0) }}
          </span>
        </VAvatar>
      </template>

      <VCardTitle class="text-h6">
        {{ mention.title }}
      </VCardTitle>

      <VCardSubtitle class="d-flex align-center gap-2 flex-wrap">
        <span class="text-primary">{{ mention.domain }}</span>
        <span>•</span>
        <span>{{ mention.visits }} visits</span>
        <span>•</span>
        <span>Influence score: {{ mention.influenceScore }}/10</span>

        <!-- Influence progress bar -->
        <VProgressLinear
          :model-value="mention.influenceScore * 10"
          color="primary"
          height="6"
          rounded
          style="max-width: 80px;"
        />

        <span>•</span>
        <span class="text-medium-emphasis">{{ mention.timestamp }}</span>
      </VCardSubtitle>

      <template #append>
        <VSelect
          :model-value="mention.sentiment"
          :items="sentimentOptions"
          item-title="title"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-details
          class="sentiment-select"
          :bg-color="getSentimentColor(mention.sentiment)"
          @update:model-value="emit('update:sentiment', $event)"
        />
      </template>
    </VCardItem>

    <VCardText class="pt-0">
      <p class="text-body-1 mb-0" v-html="mention.snippet" />
    </VCardText>

    <VDivider />

    <VCardActions class="pa-4">
      <VBtn
        variant="text"
        color="primary"
        size="small"
        prepend-icon="tabler-external-link"
      >
        Visit
      </VBtn>
      <VBtn
        variant="text"
        size="small"
        prepend-icon="tabler-tag"
      >
        Tags
      </VBtn>
      <VBtn
        variant="text"
        size="small"
        color="error"
        prepend-icon="tabler-trash"
      >
        Delete
      </VBtn>
      <VBtn
        variant="text"
        size="small"
        prepend-icon="tabler-file-plus"
      >
        Add to PDF report
      </VBtn>
      <VBtn
        variant="text"
        size="small"
        prepend-icon="tabler-volume-off"
      >
        Mute site
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<style scoped>
:deep(.highlighted-keyword) {
  background-color: rgba(14, 239, 136, 0.2);
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 500;
}

/* Fix sentiment dropdown gap */
.sentiment-select {
  min-width: 110px;
  max-width: 120px;
}

.sentiment-select :deep(.v-field) {
  padding-inline: 8px !important;
}

.sentiment-select :deep(.v-field__input) {
  padding: 4px 0 !important;
  min-height: 32px !important;
}

.sentiment-select :deep(.v-select__selection) {
  margin: 0 !important;
}

.sentiment-select :deep(.v-field--variant-outlined) {
  --v-field-padding-start: 8px;
  --v-field-padding-end: 4px;
}

.sentiment-select :deep(.v-field__append-inner) {
  padding-inline-start: 0 !important;
}
</style>

