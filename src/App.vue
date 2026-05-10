<script setup lang="ts">
import { onMounted } from 'vue'
import { useDataStore } from '@/stores/dataStore'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const dataStore = useDataStore()

onMounted(() => {
  dataStore.loadData()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900">
    <AppHeader />
    <main class="flex-1">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>
