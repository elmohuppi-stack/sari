<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { useDataStore } from '@/stores/dataStore'
import { useUiStore } from '@/stores/uiStore'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { SariType, AgeGroup, TimeRange } from '@/types'

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const filterStore = useFilterStore()
const dataStore = useDataStore()
const uiStore = useUiStore()

// Farben für SARI-Typen
const sariColors: Record<SariType, string> = {
  'Gesamt': '#2563eb',
  'COVID-19': '#dc2626',
  'Influenza': '#ca8a04',
  'RSV': '#16a34a',
}

// Chart-Optionen
const chartOption = computed(() => {
  const data = filterStore.filteredData

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0]
        if (!p) return ''
        const d = data.find(
          (item) => item.weekStartDate === p.data[0] && item.sariType === filterStore.sariType
        )
        return `
          <div class="text-sm">
            <div><strong>KW:</strong> ${d?.kalenderwoche ?? '—'}</div>
            <div><strong>Saison:</strong> ${d?.season ?? '—'}</div>
            <div><strong>Altersgruppe:</strong> ${d?.ageGroup ?? '—'}</div>
            <div><strong>SARI-Typ:</strong> ${d?.sariType ?? '—'}</div>
            <div><strong>Inzidenz:</strong> ${p.data[1]?.toFixed(1) ?? '—'} / 100.000</div>
          </div>
        `
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.weekStartDate),
      axisLabel: {
        rotate: 45,
        fontSize: 11,
        formatter: (value: string) => {
          const d = new Date(value)
          return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`
        },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Hospitalisierungsinzidenz\npro 100.000 Einwohner',
      nameTextStyle: { fontSize: 11 },
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        type: 'line',
        data: data.map((d) => [d.weekStartDate, d.incidence]),
        smooth: false,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: sariColors[filterStore.sariType],
        },
        itemStyle: {
          color: sariColors[filterStore.sariType],
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: sariColors[filterStore.sariType] + '30' },
              { offset: 1, color: sariColors[filterStore.sariType] + '05' },
            ],
          },
        },
      },
    ],
  }
})

// Kennzahlen
const keyFigures = computed(() => {
  const data = filterStore.filteredData
  const values = data
    .map((d) => d.incidence)
    .filter((v): v is number => v !== null)

  if (values.length === 0) {
    return [
      { label: 'Aktuellster Wert', value: '—', description: 'Keine Daten im Filter' },
      { label: 'Maximum', value: '—', description: 'Keine Daten im Filter' },
      { label: 'Durchschnitt', value: '—', description: 'Keine Daten im Filter' },
      { label: 'Anzahl Wochen', value: '0', description: 'Im gewählten Zeitraum' },
    ]
  }

  const latest = values[values.length - 1]
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length

  return [
    { label: 'Aktuellster Wert', value: latest.toFixed(1), description: 'Hospitalisierungsinzidenz pro 100.000' },
    { label: 'Maximum', value: max.toFixed(1), description: 'Im gewählten Zeitraum' },
    { label: 'Durchschnitt', value: avg.toFixed(1), description: 'Im gewählten Zeitraum' },
    { label: 'Anzahl Wochen', value: values.length.toString(), description: 'Im gewählten Zeitraum' },
  ]
})

// Tabelle
const tableData = computed(() => {
  return filterStore.filteredData.slice(-100).reverse()
})

// Zeitraum-Optionen
const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '6months', label: 'Letzte 6 Monate' },
  { value: '12months', label: 'Letzte 12 Monate' },
  { value: 'year', label: 'Bestimmtes Jahr' },
  { value: 'all', label: 'Gesamter Zeitraum' },
]

const ageGroupOptions: AgeGroup[] = ['00+', '0-4', '5-14', '15-34', '35-59', '60-79', '80+']
const sariTypeOptions: SariType[] = ['Gesamt', 'COVID-19', 'Influenza', 'RSV']

// Wenn "Jahr" ausgewählt ist, automatisch das erste verfügbare Jahr setzen
watch(
  () => filterStore.timeRange,
  (newVal) => {
    if (newVal === 'year' && !filterStore.selectedYear && filterStore.availableYears.length > 0) {
      filterStore.setFilter({ selectedYear: filterStore.availableYears[0] })
    }
  }
)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Titelbereich -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">SARI-Hospitalisierungsinzidenz</h2>
      <p class="text-gray-500 mt-1">
        Entwicklung schwerer akuter Atemwegsinfektionen (SARI) in Deutschland
      </p>
    </div>

    <!-- Filterbereich -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-700">Filter</h3>
        <button
          class="sm:hidden text-sm text-blue-600 hover:text-blue-800"
          @click="uiStore.toggleFilters()"
        >
          {{ uiStore.filtersExpanded ? 'Weniger' : 'Mehr Filter' }}
        </button>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        :class="{ 'hidden sm:grid': !uiStore.filtersExpanded }"
      >
        <!-- Zeitraum -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Zeitraum</label>
          <select
            :value="filterStore.timeRange"
            @change="filterStore.setFilter({ timeRange: ($event.target as HTMLSelectElement).value as TimeRange })"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option
              v-for="opt in timeRangeOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Jahr (nur bei Auswahl "Bestimmtes Jahr") -->
        <div v-if="filterStore.timeRange === 'year'">
          <label class="block text-sm font-medium text-gray-600 mb-1">Jahr</label>
          <select
            :value="filterStore.selectedYear"
            @change="filterStore.setFilter({ selectedYear: Number(($event.target as HTMLSelectElement).value) })"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option
              v-for="year in filterStore.availableYears"
              :key="year"
              :value="year"
            >
              {{ year }}
            </option>
          </select>
        </div>

        <!-- Altersgruppe -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Altersgruppe</label>
          <select
            :value="filterStore.ageGroup"
            @change="filterStore.setFilter({ ageGroup: ($event.target as HTMLSelectElement).value as AgeGroup })"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option
              v-for="age in ageGroupOptions"
              :key="age"
              :value="age"
            >
              {{ age }}
            </option>
          </select>
        </div>

        <!-- SARI-Typ -->
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">SARI-Typ</label>
          <select
            :value="filterStore.sariType"
            @change="filterStore.setFilter({ sariType: ($event.target as HTMLSelectElement).value as SariType })"
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option
              v-for="type in sariTypeOptions"
              :key="type"
              :value="type"
            >
              {{ type }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Ladezustand -->
    <div
      v-if="dataStore.loading"
      class="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500"
    >
      Daten werden geladen…
    </div>

    <div
      v-else-if="dataStore.error"
      class="bg-red-50 rounded-lg border border-red-200 p-6 text-center text-red-700"
    >
      Fehler beim Laden der Daten: {{ dataStore.error }}
    </div>

    <template v-else>
      <!-- Hauptdiagramm -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h3 class="font-semibold text-gray-700 mb-3">
          Zeitliche Entwicklung
          <span class="text-sm font-normal text-gray-400">
            — {{ filterStore.sariType }}, {{ filterStore.ageGroup }}
          </span>
        </h3>
        <VChart
          :option="chartOption"
          autoresize
          class="w-full"
          style="height: 400px"
        />
      </div>

      <!-- Kennzahlenkarten -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          v-for="figure in keyFigures"
          :key="figure.label"
          class="bg-white rounded-lg border border-gray-200 p-4"
        >
          <p class="text-xs text-gray-500 uppercase tracking-wide">{{ figure.label }}</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ figure.value }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ figure.description }}</p>
        </div>
      </div>

      <!-- Datentabelle -->
      <div class="bg-white rounded-lg border border-gray-200 mb-6">
        <button
          class="w-full flex items-center justify-between px-4 py-3 text-left"
          @click="uiStore.toggleTable()"
        >
          <h3 class="font-semibold text-gray-700">Datentabelle (letzte 100 Einträge)</h3>
          <svg
            class="w-4 h-4 text-gray-400 transition-transform"
            :class="{ 'rotate-180': uiStore.showTable }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-if="uiStore.showTable" class="border-t border-gray-200 overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-left text-gray-500 uppercase text-xs">
                <th class="px-4 py-2">KW</th>
                <th class="px-4 py-2">Saison</th>
                <th class="px-4 py-2">Datum</th>
                <th class="px-4 py-2">Altersgruppe</th>
                <th class="px-4 py-2">SARI-Typ</th>
                <th class="px-4 py-2 text-right">Inzidenz</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in tableData"
                :key="`${row.kalenderwoche}-${row.ageGroup}-${row.sariType}`"
                class="border-t border-gray-100 hover:bg-gray-50"
              >
                <td class="px-4 py-2">{{ row.kalenderwoche }}</td>
                <td class="px-4 py-2">{{ row.season }}</td>
                <td class="px-4 py-2">{{ row.weekStartDate }}</td>
                <td class="px-4 py-2">{{ row.ageGroup }}</td>
                <td class="px-4 py-2">{{ row.sariType }}</td>
                <td class="px-4 py-2 text-right font-mono">
                  {{ row.incidence !== null ? row.incidence.toFixed(1) : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quellen- und Methodikbereich -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-500">
        <h3 class="font-semibold text-gray-700 mb-2">Quelle und Methodik</h3>
        <p class="mb-2">
          Die Daten stammen vom Robert Koch-Institut (RKI) und werden im Rahmen der
          ARE-Surveillance (Akute Respiratorische Erkrankungen) erhoben.
          Die Hospitalisierungsinzidenz gibt die Anzahl der Krankenhauseinweisungen
          mit einer schweren akuten Atemwegsinfektion (SARI) pro 100.000 Einwohner an.
        </p>
        <p class="mb-2">
          Es werden vier Kategorien ausgewiesen: <strong>Gesamt</strong> (alle SARI-Fälle),
          <strong>COVID-19</strong>, <strong>Influenza</strong> und <strong>RSV</strong>.
        </p>
        <p>
          <a
            href="https://github.com/robert-koch-institut/SARI-Hospitalisierungsinzidenz"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:text-blue-800 underline"
          >
            Vollständige Daten und Methodik auf GitHub (RKI)
          </a>
        </p>
      </div>
    </template>
  </div>
</template>
