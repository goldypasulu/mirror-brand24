<script lang="ts" setup>
import { useMentionsStore } from '@/stores/useMentionsStore';
import MentionsChart from '@/views/mentions/MentionsChart.vue';
import MentionsFilters from '@/views/mentions/MentionsFilters.vue';
import MentionsList from '@/views/mentions/MentionsList.vue';
import MentionsSyncPanel from '@/views/mentions/MentionsSyncPanel.vue';

const store = useMentionsStore();

// Enforce Real API Mode immediately
store.setMockMode(false);

</script>

<template>
  <div>
    <VRow>
      <!-- Main Content (Left 8 cols) -->
      <VCol cols="12" lg="8">
        <MentionsChart class="mb-6" />
        <MentionsList />
      </VCol>

      <!-- Right Sidebar Filters (Right 4 cols) -->
      <VCol cols="12" lg="4">
        <MentionsSyncPanel />
        <MentionsFilters />
      </VCol>
    </VRow>
  </div>
</template>
