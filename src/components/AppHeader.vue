<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore'

const router = useRouter()
const dataStore = useDataStore()

// Datenstand aus der JSON (letzte abgedeckte Kalenderwoche) – vorher stand hier
// ein fest eingetragenes Datum, das nie mitgewachsen ist.
const dataStandLabel = computed(() => {
  if (!dataStore.dataStand) return null
  const date = new Date(`${dataStore.dataStand}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
})
</script>

<template>
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div>
          <router-link to="/" class="hover:opacity-80 transition-opacity">
            <h1 class="text-xl font-semibold text-gray-900 mb-1">SARI-Hospitalisierungsinzidenz (RKI)</h1>
          </router-link>
          <p class="text-sm text-gray-500">
            in Deutschland pro 100.000 Einwohner<template v-if="dataStandLabel">, Daten bis {{ dataStandLabel }}</template>
          </p>
        </div>
        <nav class="flex items-center gap-6 text-sm">
          <router-link
            to="/"
            class="text-gray-600 hover:text-gray-900 transition-colors"
            :class="{ 'font-semibold text-gray-900': router.currentRoute.value.name === 'dashboard' }"
          >
            Dashboard
          </router-link>
          <router-link
            to="/impressum"
            class="text-gray-600 hover:text-gray-900 transition-colors"
            :class="{ 'font-semibold text-gray-900': router.currentRoute.value.name === 'imprint' }"
          >
            Impressum
          </router-link>
          <router-link
            to="/datenschutz"
            class="text-gray-600 hover:text-gray-900 transition-colors"
            :class="{ 'font-semibold text-gray-900': router.currentRoute.value.name === 'privacy' }"
          >
            Datenschutz
          </router-link>
        </nav>
      </div>
    </div>
  </header>
</template>
