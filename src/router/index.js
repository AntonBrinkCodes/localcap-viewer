import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './../components/HelloWorld.vue';
import Vizualizer from '@/Vizualiser.vue'
import App from '@/App.vue'
import Calibration from '../components/Calibration.vue';
import NewSession from '../components/NewSession.vue';
import Neutral from '../components/Neutral.vue'
import Dynamic from '../components/Dynamic.vue'

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
  {
    path: '/:id/calibration',
    name: 'Calibration',
    component: Calibration
  },
  {
    path: '/:id/session',
    name: 'NewSession',
    component: NewSession
  },
  {
    path: '/:id/neutral',
    name: 'Neutral',
    component: Neutral
  },
  {
    path: '/:id/dynamic',
    name: 'Dynamic',
    component: Dynamic
  },
  
];
const BASE_URL = '/';
const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes
});

export default router;