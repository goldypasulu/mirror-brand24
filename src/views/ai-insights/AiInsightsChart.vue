<script setup lang="ts">
import { useAiInsightsStore } from '@/stores/useAiInsightsStore'
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'

const store = useAiInsightsStore()
const chartData = computed(() => store.chartData)
const loading = computed(() => store.loading)

const vuetifyTheme = useTheme()
const currentTheme = computed(() => vuetifyTheme.current.value.colors)

const chartOptions = computed(() => {
  const colors = currentTheme.value
  
  const isDark = vuetifyTheme.global.current.value.dark
  const textColor = isDark ? '#E4E6F4' : '#4B465C' // High emphasis white vs dark grey
  const labelColor = isDark ? '#A8AAAE' : '#817D8D' // Medium emphasis grey

  return {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: false },
      foreColor: textColor // Main text color for legend etc
    },
    colors: ['#0EEF88', '#0090FF'], // Brand24 Green and Blue
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories: chartData.value?.categories || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: labelColor, fontSize: '11px' }
      }
    },
    yaxis: {
      show: true,
      labels: {
        style: { colors: labelColor, fontSize: '11px' },
        formatter: (val: number) => val.toFixed(0)
      }
    },
    grid: {
      show: false,
      padding: { top: 0, bottom: 0, left: 10, right: 0 }
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '13px',
      markers: { radius: 12 },
      itemMargin: { horizontal: 15, vertical: 10 },
      labels: {
        colors: textColor
      }
    },
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.3,
            opacityTo: 0.05,
            stops: [0, 100]
        }
    }
  }
})

const series = computed(() => chartData.value?.series || [])
</script>

<template>
  <VCard title="Mentions and Reach" class="h-100">
    <VCardText v-if="loading" class="d-flex justify-center align-center" style="min-height: 200px">
        <VProgressCircular indeterminate color="primary" />
    </VCardText>
    
    <VCardText v-else-if="!chartData" class="text-center text-disabled">
        No chart data available.
    </VCardText>

    <VCardText v-else>
      <VueApexCharts
        type="area"
        height="250"
        :options="chartOptions"
        :series="series"
      />
    </VCardText>
  </VCard>
</template>
