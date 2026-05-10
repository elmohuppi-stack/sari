import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/impressum',
      name: 'imprint',
      component: () => import('@/views/ImprintView.vue'),
    },
    {
      path: '/datenschutz',
      name: 'privacy',
      component: () => import('@/views/PrivacyView.vue'),
    },
  ],
})

export default router
