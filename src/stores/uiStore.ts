import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const filtersExpanded = ref(false)
  const showTable = ref(false)

  function toggleFilters() {
    filtersExpanded.value = !filtersExpanded.value
  }

  function toggleTable() {
    showTable.value = !showTable.value
  }

  return { filtersExpanded, showTable, toggleFilters, toggleTable }
})
