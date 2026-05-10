import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FilterState, TimeRange, AgeGroup, SariType } from '@/types'
import { useDataStore } from './dataStore'

export const useFilterStore = defineStore('filter', () => {
  const timeRange = ref<TimeRange>('12months')
  const selectedYear = ref<number | null>(null)
  const ageGroup = ref<AgeGroup>('00+')
  const sariType = ref<SariType>('Gesamt')

  const availableYears = computed(() => {
    const dataStore = useDataStore()
    const years = new Set<number>()
    dataStore.dataPoints.forEach((d) => years.add(d.year))
    return Array.from(years).sort((a, b) => b - a)
  })

  const lastDate = computed(() => {
    const dataStore = useDataStore()
    if (dataStore.dataPoints.length === 0) return null

    const dates = dataStore.dataPoints
      .map((d) => d.weekStartDate)
      .filter(Boolean)
      .sort()
    return dates.length > 0 ? dates[dates.length - 1] : null
  })

  const filteredData = computed(() => {
    const dataStore = useDataStore()
    let data = dataStore.dataPoints

    // Filter by SARI type
    data = data.filter((d) => d.sariType === sariType.value)

    // Filter by age group
    data = data.filter((d) => d.ageGroup === ageGroup.value)

    // Filter by time range
    if (lastDate.value) {
      const last = new Date(lastDate.value)

      if (timeRange.value === '6months') {
        const cutoff = new Date(last)
        cutoff.setMonth(cutoff.getMonth() - 6)
        data = data.filter((d) => new Date(d.weekStartDate) >= cutoff)
      } else if (timeRange.value === '12months') {
        const cutoff = new Date(last)
        cutoff.setMonth(cutoff.getMonth() - 12)
        data = data.filter((d) => new Date(d.weekStartDate) >= cutoff)
      } else if (timeRange.value === 'year' && selectedYear.value) {
        data = data.filter((d) => d.year === selectedYear.value)
      }
    }

    // Sort by date
    data = [...data].sort(
      (a, b) => new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime()
    )

    return data
  })

  function setFilter(partial: Partial<FilterState>) {
    if (partial.timeRange !== undefined) timeRange.value = partial.timeRange
    if (partial.selectedYear !== undefined) selectedYear.value = partial.selectedYear
    if (partial.ageGroup !== undefined) ageGroup.value = partial.ageGroup
    if (partial.sariType !== undefined) sariType.value = partial.sariType
  }

  return {
    timeRange,
    selectedYear,
    ageGroup,
    sariType,
    availableYears,
    lastDate,
    filteredData,
    setFilter,
  }
})
