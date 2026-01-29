<script setup lang="ts">
import { useMentionsStore } from '@/stores/useMentionsStore'
import { computed, ref } from 'vue'

const store = useMentionsStore()

// Sync state
const syncDateFrom = ref('')
const syncDateTo = ref('')
const syncing = ref(false)
const syncStatus = ref<'idle' | 'scraping' | 'truncating' | 'inserting' | 'fetching' | 'success' | 'error'>('idle')
const syncMessage = ref('')
const currentStep = ref(0)

// Humorous loading messages for each step
const loadingMessages = {
  scraping: [
    '🕵️ Sneaking into Brand24 servers...',
    '🔍 Hunting for mentions like a detective...',
    '📡 Beaming data from the cloud...',
    '🎣 Fishing for fresh mentions...',
    '🚀 Launching data collection mission...'
  ],
  truncating: [
    '🧹 Sweeping away old data...',
    '🗑️ Taking out the digital trash...',
    '💨 Clearing the deck for fresh data...',
    '🧼 Spring cleaning the spreadsheets...',
    '✨ Making room for new mentions...'
  ],
  inserting: [
    '📊 Organizing spreadsheets like a pro...',
    '🗄️ Filing data in the digital cabinet...',
    '💾 Saving bytes, one at a time...',
    '🏗️ Building your database empire...',
    '📝 Writing data into history...'
  ],
  fetching: [
    '🎁 Unwrapping your fresh data...',
    '🔄 Refreshing like a cold lemonade...',
    '✨ Polishing your mentions to perfection...',
    '🎨 Painting your dashboard with data...',
    '🎯 Delivering your mentions express!'
  ]
}

// Get random loading message for current step
const currentLoadingMessage = computed(() => {
  if (syncStatus.value === 'scraping') {
    const messages = loadingMessages.scraping
    return messages[Math.floor(Math.random() * messages.length)]
  } else if (syncStatus.value === 'truncating') {
    const messages = loadingMessages.truncating
    return messages[Math.floor(Math.random() * messages.length)]
  } else if (syncStatus.value === 'inserting') {
    const messages = loadingMessages.inserting
    return messages[Math.floor(Math.random() * messages.length)]
  } else if (syncStatus.value === 'fetching') {
    const messages = loadingMessages.fetching
    return messages[Math.floor(Math.random() * messages.length)]
  }
  return ''
})

// Validation: Max 2 weeks (14 days)
const dateRangeError = computed(() => {
  if (!syncDateFrom.value || !syncDateTo.value) return null
  
  const from = new Date(syncDateFrom.value)
  const to = new Date(syncDateTo.value)
  
  if (to < from) {
    return 'End date must be after start date'
  }
  
  const diffTime = Math.abs(to.getTime() - from.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays > 14) {
    return 'Maximum date range is 2 weeks (14 days)'
  }
  
  return null
})

const canSync = computed(() => {
  return syncDateFrom.value && syncDateTo.value && !dateRangeError.value && !syncing.value
})

// Handle sync workflow
const handleSync = async () => {
  if (!canSync.value) return
  
  syncing.value = true
  currentStep.value = 0
  syncMessage.value = ''
  
  try {
    // Step 1: Scrape data (Brand24 → Google Sheets)
    currentStep.value = 1
    syncStatus.value = 'scraping'
    await store.triggerScraping(syncDateFrom.value, syncDateTo.value)
    
    // Wait for scraping to complete (5 seconds buffer)
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Step 2: Truncate old data (Clear Google Sheets)
    currentStep.value = 2
    syncStatus.value = 'truncating'
    await store.truncateData()
    
    // Wait for truncate to complete (2 seconds buffer)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Step 3: Insert data (Google Sheets → Database)
    currentStep.value = 3
    syncStatus.value = 'inserting'
    await store.syncDataToDatabase(syncDateFrom.value, syncDateTo.value)
    
    // Step 4: Refresh mentions list (Database → Frontend)
    currentStep.value = 4
    syncStatus.value = 'fetching'
    await store.fetchMentions()
    
    // Success!
    syncStatus.value = 'success'
    syncMessage.value = `🎉 Successfully synced ${syncDateFrom.value} to ${syncDateTo.value}!`
    
    // Reset form after 3 seconds
    setTimeout(() => {
      syncStatus.value = 'idle'
      syncMessage.value = ''
      currentStep.value = 0
    }, 3000)
    
  } catch (error: any) {
    syncStatus.value = 'error'
    syncMessage.value = error.message || 'Sync failed. Please try again.'
    currentStep.value = 0
  } finally {
    syncing.value = false
  }
}

// Progress percentage
const progressValue = computed(() => {
  if (syncStatus.value === 'scraping') return 25
  if (syncStatus.value === 'truncating') return 50
  if (syncStatus.value === 'inserting') return 75
  if (syncStatus.value === 'fetching') return 90
  if (syncStatus.value === 'success') return 100
  return 0
})
</script>

<template>
  <VCard class="mb-4">
    <VCardTitle class="d-flex align-center">
      <VIcon icon="mdi-sync" class="me-2" />
      Manual Data Sync
    </VCardTitle>
    
    <VCardText>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Sync data from Brand24 to database
      </p>
      
      <!-- Date Range Inputs -->
      <VRow>
        <VCol cols="6">
          <VTextField
            v-model="syncDateFrom"
            type="date"
            label="From"
            density="compact"
            :disabled="syncing"
            :error="!!dateRangeError"
          />
        </VCol>
        <VCol cols="6">
          <VTextField
            v-model="syncDateTo"
            type="date"
            label="To"
            density="compact"
            :disabled="syncing"
            :error="!!dateRangeError"
          />
        </VCol>
      </VRow>
      
      <!-- Validation Error -->
      <VAlert
        v-if="dateRangeError"
        type="warning"
        density="compact"
        class="mb-3"
      >
        {{ dateRangeError }}
      </VAlert>
      
      <!-- Sync Button -->
      <VBtn
        block
        color="primary"
        :loading="syncing"
        :disabled="!canSync"
        @click="handleSync"
      >
        <VIcon start icon="mdi-sync" />
        Sync Data
      </VBtn>
      
      <!-- Progress Indicator with Humorous Messages -->
      <div v-if="syncing" class="mt-4">
        <VProgressLinear 
          :model-value="progressValue" 
          color="primary"
          height="6"
          rounded
        />
        <div class="text-center mt-3">
          <div class="text-body-2 font-weight-medium">
            Step {{ currentStep }}/4
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ currentLoadingMessage }}
          </div>
        </div>
      </div>
      
      <!-- Status Message -->
      <VAlert
        v-if="syncMessage && !syncing"
        :type="syncStatus === 'error' ? 'error' : 'success'"
        class="mt-4"
        density="compact"
      >
        {{ syncMessage }}
      </VAlert>
      
      <!-- Info -->
      <div class="mt-4 text-caption text-medium-emphasis">
        <VIcon icon="mdi-information-outline" size="small" class="me-1" />
        Maximum range: 2 weeks
      </div>
    </VCardText>
  </VCard>
</template>

<style scoped>
/* Add subtle animation to progress */
.v-progress-linear {
  transition: all 0.3s ease;
}
</style>
