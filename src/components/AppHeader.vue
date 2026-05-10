<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <header class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-4">
          <router-link to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <h1 class="text-xl font-semibold text-gray-900">SARI-Hospitalisierungsinzidenz in Deutschland pro 100.000 Einwohner</h1>
          </router-link>
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
