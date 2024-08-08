import { createApp } from 'vue';
import './style.css';
import router from './router'
import store from './store'

// Vuetify
import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
//import Vuetify from 'vuetify'
import '@/assets/main.scss'


// Components
import App from './App.vue'
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        dark: true,
        colors: {
          background: '#121212',
          surface: '#1E1E1E',
          primary: '#BB86FC',
          secondary: '#03DAC6',
          error: '#CF6679',
          onPrimary: '#FFFFFF',
          onSecondary: '#000000',
          onError: '#000000',
          // Define additional colors as needed
        },
      },
    },
  },
});

const app = createApp(App);

app.use(router);
app.use(store);
app.use(vuetify);
vuetify.theme.dark = true;
app.mount('#app')