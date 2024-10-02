import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './../components/HelloWorld.vue';
import Visualizer from '../Visualizer.vue'
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
    path: '/visualizer',
    name: 'Visualizer',
    component: Visualizer,
    beforeEnter: (to, from, next) => {
      console.log('Entering Vizualizer route');
      next();
    },
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