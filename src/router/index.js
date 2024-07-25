import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './../components/HelloWorld.vue';
import Vizualizer from '@/Vizualiser.vue'
import App from '@/App.vue'
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/vizualiser',
    name: 'Vizualizer',
    component: Vizualizer,
  },
  {
    path: '/placeholder',
    name: 'App',
    component: App,
  },
  // Add other routes here
];
const BASE_URL = '/';
const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes
});

export default router;