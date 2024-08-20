import { createApp } from 'vue';
import './style.css';
import router from './router'
import store from './store/store'

// Vuetify
import 'vuetify/styles'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
//import Vuetify from 'vuetify'
import '@/assets/main.scss'
import '@mdi/font/css/materialdesignicons.css'  
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'roboto-fontface/css/roboto/roboto-fontface.css'

import '@fortawesome/fontawesome-free/css/all.css';


// Components
import App from './App.vue'
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',  // Use Material Design Icons
    aliases,
    sets: {
      mdi
    }
  },
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
      typography: {
        // Define font sizes to match Vuetify 2 settings
        body1: { fontSize: '16px', fontFamily: 'Roboto, Arial, sans-serif' },
        h1: { fontSize: '2rem', fontFamily: 'Roboto, Arial, sans-serif' },
        h2: { fontSize: '1.75rem', fontFamily: 'Roboto, Arial, sans-serif' },
        h3: { fontSize: '1.5rem', fontFamily: 'Roboto, Arial, sans-serif' },
        h4: { fontSize: '1.25rem', fontFamily: 'Roboto, Arial, sans-serif' },
        h5: { fontSize: '1rem', fontFamily: 'Roboto, Arial, sans-serif' },
        h6: { fontSize: '0.875rem', fontFamily: 'Roboto, Arial, sans-serif' },
        subtitle1: { fontSize: '0.875rem', fontFamily: 'Roboto, Arial, sans-serif' },
        subtitle2: { fontSize: '0.75rem', fontFamily: 'Roboto, Arial, sans-serif' },
        button: { fontSize: '0.875rem', fontFamily: 'Roboto, Arial, sans-serif' },
        caption: { fontSize: '0.75rem', fontFamily: 'Roboto, Arial, sans-serif' },
        overline: { fontSize: '0.75rem', fontFamily: 'Roboto, Arial, sans-serif' }
      }
    },
  },
});



const app = createApp(App);

app.use(router);
app.use(store);
app.use(vuetify);
vuetify.theme.dark = true;
app.mount('#app')