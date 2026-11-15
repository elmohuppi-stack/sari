import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { SariDataPoint } from '@/types'

export const useDataStore = defineStore('data', () => {
  const dataPoints = ref<SariDataPoint[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<string | null>(null)
  /** Letzter Tag, den die Daten abdecken (Sonntag der letzten Kalenderwoche). */
  const dataStand = ref<string | null>(null)
  const latestWeek = ref<string | null>(null)

  /** Alle Saisons absteigend – Grundlage für den Zeitraum-Filter. */
  const seasons = computed(() => [...new Set(dataPoints.value.map((d) => d.season))].sort().reverse())

  async function loadData() {
    if (dataPoints.value.length > 0) return

    loading.value = true
    error.value = null

    try {
      // no-cache: die JSON wird per COPY ins Nginx-Image gelegt und wechselt
      // nur mit einem Deployment. Ohne Auffrischen zeigt der Browser nach
      // einem Update sonst weiter die alten Werte.
      const response = await fetch('/data/sari-data.json', { cache: 'no-cache' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const json = await response.json()
      dataPoints.value = json.data as SariDataPoint[]
      lastUpdated.value = json.lastUpdated ?? null
      dataStand.value = json.dataStand ?? null
      latestWeek.value = json.latestWeek ?? null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Fehler beim Laden der Daten'
    } finally {
      loading.value = false
    }
  }

  return {
    dataPoints,
    loading,
    error,
    lastUpdated,
    dataStand,
    latestWeek,
    seasons,
    loadData,
  }
})
