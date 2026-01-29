<script lang="ts" setup>
import { useMentionsStore } from '@/stores/useMentionsStore';
import MentionsChart from '@/views/mentions/MentionsChart.vue';
import MentionsFilters from '@/views/mentions/MentionsFilters.vue';
import MentionsList from '@/views/mentions/MentionsList.vue';

const store = useMentionsStore();

// Enable Mock Mode immediately (before children mount)
store.setMockMode(true);

onUnmounted(() => {
  store.setMockMode(false);
})
</script>

<template>
  <div>
    <VAlert
      color="warning"
      variant="tonal"
      class="mb-6"
      icon="tabler-alert-triangle"
    >
      You are viewing <strong>Mock Mode</strong> (Disconnected from API). Data shown is simulated.
    </VAlert>

    <VRow>
      <!-- Main Content (Left 8 cols) -->
      <VCol cols="12" lg="8">
        <MentionsChart class="mb-6" />
        <MentionsList />
      </VCol>

      <!-- Right Sidebar Filters (Right 4 cols) -->
      <VCol cols="12" lg="4">
        <MentionsFilters />
      </VCol>
    </VRow>
  </div>
</template>
