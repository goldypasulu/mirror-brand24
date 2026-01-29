<script setup lang="ts">
import { useAiInsightsStore } from '@/stores/useAiInsightsStore'
import { computed } from 'vue'

const store = useAiInsightsStore()
const reports = computed(() => store.reports)
const loading = computed(() => store.loading)
</script>

<template>
  <VCard title="Weekly reports">
    <VCardText v-if="loading" class="d-flex justify-center">
        <VProgressCircular indeterminate size="24" color="primary" />
    </VCardText>

    <VList v-else density="compact" class="pa-0 report-list bg-transparent" lines="two">
        <!-- Header -->
        <VListItem class="px-0 mb-2">
            <template #prepend>
                <VIcon icon="tabler-list" size="20" class="text-medium-emphasis" />
            </template>
            <VListItemTitle class="font-weight-bold text-uppercase text-caption text-medium-emphasis">
                Reports List
            </VListItemTitle>
        </VListItem>

      <VListItem
        v-for="(report, index) in reports"
        :key="report.id"
        rounded="lg"
        :variant="index === 0 ? 'tonal' : 'text'"
        :color="index === 0 ? 'primary' : undefined"
        class="mb-1"
      >
        <VListItemTitle class="font-weight-medium text-body-2">
            {{ report.range }}
        </VListItemTitle>
        
        <template #append>
             <VChip size="x-small" color="info" variant="tonal" class="ms-2">
                Weekly
             </VChip>
        </template>
      </VListItem>

      <VListItem v-if="reports.length === 0" class="text-disabled px-0">
          No reports generated yet.
      </VListItem>
    </VList>
    
    <VCardActions>
        <VBtn variant="tonal" block color="primary">
            Settings
        </VBtn>
    </VCardActions>
  </VCard>
</template>
