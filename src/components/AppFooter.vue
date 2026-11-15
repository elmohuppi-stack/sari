<script setup lang="ts">
import { useDataStore } from '@/stores/dataStore'
import { computed } from 'vue'

const dataStore = useDataStore()

// "Daten bis": letzter Tag der letzten Kalenderwoche im Datensatz.
const dataStandLabel = computed(() => {
  if (!dataStore.dataStand) return null
  return new Date(`${dataStore.dataStand}T00:00:00`).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// Wann die JSON zuletzt erzeugt wurde (Zeitpunkt des Datenlaufs).
const generatedLabel = computed(() => {
  if (!dataStore.lastUpdated) return null
  return new Date(dataStore.lastUpdated).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<template>
  <footer class="bg-white border-t border-gray-200 mt-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-500">
        <div>
          <h3 class="font-semibold text-gray-700 mb-2">Über dieses Dashboard</h3>
          <p>
            Das SARI-Dashboard visualisiert die Hospitalisierungsinzidenz
            schwerer akuter Atemwegsinfektionen (SARI) in Deutschland.
            Datenquelle ist das Robert Koch-Institut.
          </p>
        </div>
        <div>
          <h3 class="font-semibold text-gray-700 mb-2">Datenstand</h3>
          <p v-if="dataStandLabel">
            Daten bis {{ dataStandLabel }}<template v-if="dataStore.latestWeek"> ({{ dataStore.latestWeek }})</template>
          </p>
          <p v-else>
            Daten werden geladen…
          </p>
          <p v-if="generatedLabel" class="mt-1 text-xs text-gray-400">
            Abgerufen am {{ generatedLabel }}
          </p>
          <p class="mt-1">
            <a
              href="https://github.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:text-blue-800 underline"
            >
              Quelle: RKI auf GitHub
            </a>
          </p>
        </div>
        <div>
          <h3 class="font-semibold text-gray-700 mb-2">Rechtliches</h3>
          <ul class="space-y-1">
            <li>
              <router-link to="/impressum" class="text-blue-600 hover:text-blue-800 underline">
                Impressum
              </router-link>
            </li>
            <li>
              <router-link to="/datenschutz" class="text-blue-600 hover:text-blue-800 underline">
                Datenschutzerklärung
              </router-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
        &copy; {{ new Date().getFullYear() }} SARI-Dashboard
      </div>
    </div>
  </footer>
</template>
