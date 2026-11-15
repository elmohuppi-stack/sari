import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FilterState, TimeRange, AgeGroup, SariType } from '@/types'
import { useDataStore } from './dataStore'

export const useFilterStore = defineStore('filter', () => {
  // Standard ist "gesamter Zeitraum": so bleibt die Ansicht beim Öffnen
  // unverändert, und es gibt keine fest verdrahtete Saison, die nach dem
  // Saisonwechsel ins Leere zeigt.
  const timeRange = ref<TimeRange>('all')
  const ageGroup = ref<AgeGroup>('00+')
  const sariType = ref<SariType>('Gesamt')

  const filteredData = computed(() => {
    const dataStore = useDataStore()
    let data = dataStore.dataPoints

    // Filter by SARI type
    data = data.filter((d) => d.sariType === sariType.value)

    // Filter by age group
    data = data.filter((d) => d.ageGroup === ageGroup.value)

    // Filter by time range (season-based)
    if (timeRange.value === 'all') {
      // no filter
    } else if (timeRange.value.startsWith('from-')) {
      const fromSeason = timeRange.value.replace('from-', '')
      data = data.filter((d) => d.season >= fromSeason)
    } else {
      // exact season match (e.g. '2025/26')
      data = data.filter((d) => d.season === timeRange.value)
    }

    // Sort by date
    data = [...data].sort(
      (a, b) => new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime()
    )

    return data
  })

  function setFilter(partial: Partial<FilterState>) {
    if (partial.timeRange !== undefined) timeRange.value = partial.timeRange
    if (partial.ageGroup !== undefined) ageGroup.value = partial.ageGroup
    if (partial.sariType !== undefined) sariType.value = partial.sariType
  }

  return {
    timeRange,
    ageGroup,
    sariType,
    filteredData,
    setFilter,
  }
})
