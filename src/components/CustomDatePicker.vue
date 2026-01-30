<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  startDate?: string | null
  endDate?: string | null
  maxRangeDays?: number
}

interface Emits {
  (e: 'update:startDate', value: string | null): void
  (e: 'update:endDate', value: string | null): void
}

const props = withDefaults(defineProps<Props>(), {
  startDate: null,
  endDate: null,
  maxRangeDays: 14,
})

const emit = defineEmits<Emits>()

// Date Helper Functions
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const getFirstDayOfMonth = (year: number, month: number) => {
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // Reduce by 1 to make Monday = 0, Sunday = 6
  let day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

const formatDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Current View State
const currentDate = new Date()
const viewYear = ref(currentDate.getFullYear())
const viewMonth = ref(currentDate.getMonth())

// Computed Calendar Data
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const currentMonthName = computed(() => monthNames[viewMonth.value])

const calendarDays = computed(() => {
  const daysInMonth = getDaysInMonth(viewYear.value, viewMonth.value)
  const firstDay = getFirstDayOfMonth(viewYear.value, viewMonth.value)
  const days = []

  // Previous month padding
  const prevMonthDays = getDaysInMonth(viewYear.value, viewMonth.value - 1)
  for (let i = 0; i < firstDay; i++) {
    days.push({
      day: prevMonthDays - firstDay + i + 1,
      currentMonth: false,
      date: new Date(viewYear.value, viewMonth.value - 1, prevMonthDays - firstDay + i + 1)
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      currentMonth: true,
      date: new Date(viewYear.value, viewMonth.value, i)
    })
  }

  // Next month padding to fill 6 rows (42 cells)
  const remainingCells = 42 - days.length
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      day: i,
      currentMonth: false,
      date: new Date(viewYear.value, viewMonth.value + 1, i)
    })
  }

  return days
})

// Interaction Logic
const handleDateClick = (date: Date) => {
  const dateStr = formatDate(date)
  
  // Case 1: Start new selection (if both selected or neither selected)
  if ((!props.startDate && !props.endDate) || (props.startDate && props.endDate)) {
    emit('update:startDate', dateStr)
    emit('update:endDate', null)
    return
  }

  // Case 2: Selecting End Date
  if (props.startDate && !props.endDate) {
    const start = parseDate(props.startDate)!
    
    // If clicked before start date, make it the new start date
    if (date < start) {
      emit('update:startDate', dateStr)
      return
    }

    // Check constraint
    const diffTime = Math.abs(date.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > props.maxRangeDays) {
      // If exceeds max range, just reset and start new selection from here
      // Or we could clamp it. Let's start new selection for better UX.
      emit('update:startDate', dateStr)
      emit('update:endDate', null)
    } else {
      emit('update:endDate', dateStr)
    }
  }
}

const resetSelection = () => {
  emit('update:startDate', null)
  emit('update:endDate', null)
}

const navigateMonth = (step: number) => {
  let newMonth = viewMonth.value + step
  let newYear = viewYear.value
  
  if (newMonth > 11) {
    newMonth = 0
    newYear++
  } else if (newMonth < 0) {
    newMonth = 11
    newYear--
  }
  
  viewMonth.value = newMonth
  viewYear.value = newYear
}

// Styling Helper Checkers
const isSelected = (date: Date) => {
  const d = formatDate(date)
  return d === props.startDate || d === props.endDate
}

const isInRange = (date: Date) => {
  if (!props.startDate || !props.endDate) return false
  const d = date.getTime()
  const s = parseDate(props.startDate)!.getTime()
  const e = parseDate(props.endDate)!.getTime()
  return d > s && d < e
}

const isRangeStart = (date: Date) => formatDate(date) === props.startDate && !!props.endDate
const isRangeEnd = (date: Date) => formatDate(date) === props.endDate && !!props.startDate

const isDisabled = (date: Date) => {
  // If we have a start date but no end date, disable dates outside range?
  // Replicating logic: if start exists, highlight valid range on hover maybe?
  // For now, let's visually dim dates that would violate constraint on hover
  if (props.startDate && !props.endDate) {
    const start = parseDate(props.startDate)!
    const diffTime = Math.abs(date.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Only constrain future dates if click is AFTER start
    if (date > start && diffDays > props.maxRangeDays) return true
  }
  return false
}
</script>

<template>
  <div class="custom-date-picker elevation-2 rounded-lg pa-4">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="text-h6 font-weight-bold primary--text">
        {{ currentMonthName }} {{ viewYear }}
      </div>
      <div class="d-flex gap-2">
        <VBtn icon="mdi-chevron-left" variant="text" density="comfortable" @click="navigateMonth(-1)" />
        <VBtn icon="mdi-chevron-right" variant="text" density="comfortable" @click="navigateMonth(1)" />
      </div>
    </div>

    <!-- Week Days -->
    <div class="calendar-grid mb-2">
      <div v-for="day in weekDays" :key="day" class="text-center text-caption text-medium-emphasis">
        {{ day }}
      </div>
    </div>

    <!-- Calendar Days -->
    <div class="calendar-grid">
      <div
        v-for="(dayObj, index) in calendarDays"
        :key="index"
        class="day-cell"
        :class="{
          'not-current-month': !dayObj.currentMonth,
          'selected': isSelected(dayObj.date),
          'in-range': isInRange(dayObj.date),
          'range-start': isRangeStart(dayObj.date),
          'range-end': isRangeEnd(dayObj.date),
          'disabled': isDisabled(dayObj.date)
        }"
        @click="handleDateClick(dayObj.date)"
      >
        {{ dayObj.day }}
      </div>
    </div>

    <!-- Footer -->
    <div class="d-flex justify-space-between align-center mt-4 pt-2 border-t">
      <div class="text-caption">
        <span v-if="startDate && endDate">Selected: {{ startDate }} to {{ endDate }}</span>
        <span v-else-if="startDate">Select End Date</span>
        <span v-else>Select Range (Max 14 days)</span>
      </div>
      <VBtn 
        variant="text" 
        color="error" 
        size="small" 
        :disabled="!startDate && !endDate"
        @click="resetSelection"
      >
        Reset
      </VBtn>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.custom-date-picker {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  max-width: 340px;
  width: 100%;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;
  z-index: 1;

  // Default text color
  color: rgb(var(--v-theme-on-surface));

  &:hover:not(.disabled) {
    background-color: rgba(var(--v-theme-on-surface), 0.08);
  }

  &.not-current-month {
    opacity: 0.3;
  }

  &.disabled {
    opacity: 0.2;
    cursor: not-allowed;
    pointer-events: none;
  }

  // Selected State (Start/End circles)
  &.selected {
    background-color: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
    font-weight: bold;
    // z-index: 2; // Keep circles on top
  }

  // Range strip styling
  &.in-range {
    background-color: rgba(var(--v-theme-primary), 0.12);
    border-radius: 0; // Square between start and end
    color: rgb(var(--v-theme-on-surface));
    font-weight: 500;
  }

  // Rounding the ends of the range strip
  &.range-start {
    border-radius: 50% 0 0 50%;
    position: relative;
    
    // Pseudo-element to create the circle on top of the strip end
    &::before {
      // This is handled by .selected class mostly, but range-start specific fix
    }
  }

  &.range-end {
    border-radius: 0 50% 50% 0;
  }
  
  // Advanced Visuals: The "Connected" look
  // If it's selected AND has a range, we need to handle the background strip behind the circle
  &.selected.range-start {
    background: linear-gradient(to right, transparent 50%, rgba(var(--v-theme-primary), 0.12) 50%);
    
    // The circle itself
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: rgb(var(--v-theme-primary));
      border-radius: 50%;
      z-index: -1;
    }
  }

  &.selected.range-end {
    background: linear-gradient(to left, transparent 50%, rgba(var(--v-theme-primary), 0.12) 50%);
    
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background-color: rgb(var(--v-theme-primary));
      border-radius: 50%;
      z-index: -1;
    }
  }
}

.primary--text {
  color: rgb(var(--v-theme-primary));
}

.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
