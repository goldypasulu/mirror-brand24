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

    <VCardText v-else class="report-list">
        <div class="d-flex align-center mb-3">
             <VIcon icon="tabler-list" size="20" class="text-medium-emphasis me-2" />
             <span class="font-weight-bold text-uppercase text-caption text-medium-emphasis">Reports List</span>
        </div>

        <VList density="compact" class="pa-0 bg-transparent" lines="two">
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

            <div v-if="reports.length === 0" class="text-medium-emphasis text-body-2 mt-2">
                No reports generated yet.
            </div>
        </VList>
    </VCardText>
    

  </VCard>
</template>
