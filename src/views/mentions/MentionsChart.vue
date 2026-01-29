<script lang="ts" setup>
import { useMentionsStore } from '@/stores/useMentionsStore'
import { hexToRgb } from '@layouts/utils'
import { storeToRefs } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()
const store = useMentionsStore()
const { filteredMentions: mentions, loading } = storeToRefs(store)

// Chart mode toggle
const chartMode = ref<'mentions' | 'sentiment'>('mentions')
const chartPeriod = ref<'days' | 'weeks' | 'months'>('days')

// Helper: Group data by date
const groupedData = computed(() => {
  const data: Record<string, { mentions: number, reach: number, positive: number, neutral: number, negative: number }> = {}
  
  // Initialize map with all dates in range? 
  // For simplicity, just group existing mentions. 
  // Ideally we should fill gaps with 0, but ApexCharts can handle irregular intervals or we can let it be sparse.
  
  mentions.value.forEach(m => {
    // Extract YYYY-MM-DD from timestamp (2026-01-19 12:03 PM) or ISO string
    // Assuming timestamp format is consistent. If it's string, we try to parse it.
    let dateKey = ''
    try {
      dateKey = new Date(m.timestamp).toISOString().split('T')[0]
    } catch (e) {
      return // Skip invalid
    }

    if (!data[dateKey]) {
      data[dateKey] = { mentions: 0, reach: 0, positive: 0, neutral: 0, negative: 0 }
    }

    data[dateKey].mentions += 1
    data[dateKey].reach += m.visits || 0
    
    if (m.sentiment === 'positive') data[dateKey].positive += 1
    else if (m.sentiment === 'negative') data[dateKey].negative += 1
    else data[dateKey].neutral += 1
  })

  // Sort by date
  return Object.keys(data).sort().map(date => ({
    date,
    ...data[date]
  }))
})

const categories = computed(() => groupedData.value.map(d => {
  // Format date -> '24 Dec'
  const date = new Date(d.date)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}))

const mentionsReachSeries = computed(() => [
  {
    name: 'Mentions',
    type: 'line',
    data: groupedData.value.map(d => d.mentions),
  },
  {
    name: 'Reach',
    type: 'area',
    data: groupedData.value.map(d => d.reach),
  },
])

const sentimentSeries = computed(() => [
  {
    name: 'Positive',
    data: groupedData.value.map(d => d.positive),
  },
  {
    name: 'Neutral',
    data: groupedData.value.map(d => d.neutral),
  },
  {
    name: 'Negative',
    data: groupedData.value.map(d => d.negative),
  },
])

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const isDark = vuetifyTheme.current.value.dark

  // Theme-aware text color with proper contrast
  const textColor = currentTheme['on-surface']
  const textSecondaryColor = isDark
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.6)'

  // Common legend config for theme compatibility
  const legendConfig = {
    position: 'top' as const,
    horizontalAlign: 'left' as const,
    labels: {
      colors: textColor, 
    },
    markers: {
      offsetX: -4,
    },
    itemMargin: {
      horizontal: 12,
      vertical: 4,
    },
  }

  if (chartMode.value === 'mentions') {
    return {
      chart: {
        type: 'line',
        height: 300,
        toolbar: { show: false },
        zoom: { enabled: false },
        background: 'transparent',
      },
      stroke: {
        width: [3, 2],
        curve: 'smooth',
      },
      fill: {
        type: ['solid', 'gradient'],
        opacity: [1, 0.3],
      },
      colors: ['#3B82F6', currentTheme.primary],
      xaxis: {
        categories: categories.value,
        labels: {
          style: {
            colors: textSecondaryColor,
            fontSize: '12px',
          },
        },
        axisBorder: {
          color: `rgba(${hexToRgb(textColor)}, 0.2)`,
        },
        axisTicks: {
          color: `rgba(${hexToRgb(textColor)}, 0.2)`,
        },
      },
      yaxis: [
        {
          title: {
            text: 'Mentions',
            style: {
              color: '#3B82F6',
            },
          },
          labels: {
            style: {
              colors: textSecondaryColor,
            },
          },
        },
        {
          opposite: true,
          title: {
            text: 'Reach',
            style: {
              color: currentTheme.primary,
            },
          },
          labels: {
            style: {
              colors: textSecondaryColor,
            },
            formatter: (val: number) => {
               if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
               return val
            },
          },
        },
      ],
      legend: legendConfig,
      tooltip: {
        shared: true,
        intersect: false,
        theme: isDark ? 'dark' : 'light',
      },
      grid: {
        borderColor: `rgba(${hexToRgb(textColor)}, 0.1)`,
      },
    }
  }

  // Sentiment chart options
  return {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false },
      stacked: false,
      background: 'transparent',
    },
    stroke: {
      width: 3,
      curve: 'smooth',
    },
    colors: ['#28C76F', '#9E9E9E', '#FF4C51'],
    xaxis: {
      categories: categories.value,
      labels: {
        style: {
          colors: textSecondaryColor,
          fontSize: '12px',
        },
      },
      axisBorder: {
        color: `rgba(${hexToRgb(textColor)}, 0.2)`,
      },
      axisTicks: {
        color: `rgba(${hexToRgb(textColor)}, 0.2)`,
      },
    },
    yaxis: {
      title: {
        text: 'Count',
        style: {
          color: textSecondaryColor,
        },
      },
      labels: {
        style: {
          colors: textSecondaryColor,
        },
      },
    },
    legend: legendConfig, 
    tooltip: {
      theme: isDark ? 'dark' : 'light',
    },
    grid: {
      borderColor: `rgba(${hexToRgb(textColor)}, 0.1)`,
    },
  }
})

const series = computed(() => {
  return chartMode.value === 'mentions' ? mentionsReachSeries.value : sentimentSeries.value
})
</script>

<template>
  <VCard>
    <VCardItem class="pb-2">
      <div class="chart-controls d-flex align-center justify-space-between flex-wrap ga-4">
        <!-- Left: Toggle buttons using VChipGroup -->
        <div class="d-flex align-center flex-wrap ga-4">
          <VChipGroup
            v-model="chartMode"
            mandatory
            selected-class="v-chip--selected text-primary"
          >
            <VChip
              value="mentions"
              variant="tonal"
              label
            >
              Mentions & Reach
            </VChip>
            <VChip
              value="sentiment"
              variant="tonal"
              label
            >
              Sentiment
            </VChip>
          </VChipGroup>

          <span class="text-body-2 text-medium-emphasis d-none d-md-inline">
            Click on the chart to filter by date
          </span>
        </div>

        <!-- Right: Period selector -->
        <VChipGroup
          v-model="chartPeriod"
          mandatory
          selected-class="v-chip--selected text-primary"
        >
          <VChip
            value="days"
            variant="outlined"
            label
          >
            Days
          </VChip>
          <VChip
            value="weeks"
            variant="outlined"
            label
          >
            Weeks
          </VChip>
          <VChip
            value="months"
            variant="outlined"
            label
          >
            Months
          </VChip>
        </VChipGroup>
      </div>
    </VCardItem>

    <VCardText class="pt-0">
      <VueApexCharts
        :options="chartOptions"
        :series="series"
        height="300"
      />
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
/* Ensure chart controls wrap nicely on mobile */
.chart-controls {
  min-height: 48px;
}

/* Chip styling for selected state */
:deep(.v-chip--selected) {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-on-primary)) !important;
}

/* ApexCharts dark mode compatibility */
:deep(.apexcharts-text) {
  fill: currentColor;
}

:deep(.apexcharts-legend-text) {
  color: rgb(var(--v-theme-on-surface)) !important;
}
</style>

