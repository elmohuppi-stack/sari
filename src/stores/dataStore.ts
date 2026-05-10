import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SariDataPoint } from '@/types'

export const useDataStore = defineStore('data', () => {
  const dataPoints = ref<SariDataPoint[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<string | null>(null)

  async function loadData() {
    if (dataPoints.value.length > 0) return

    loading.value = true
    error.value = null

    try {
      const response = await fetch('/data/sari-data.json')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const json = await response.json()
      dataPoints.value = json.data as SariDataPoint[]
      lastUpdated.value = json.lastUpdated ?? null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Fehler beim Laden der Daten'
    } finally {
      loading.value = false
    }
  }

  return { dataPoints, loading, error, lastUpdated, loadData }
})
