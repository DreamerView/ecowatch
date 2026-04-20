import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'
import AreasView from '../views/AreasView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: MapView
  },
  {
    path: '/db',
    name: 'db',
    component: AreasView
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router