import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';

import App from './App.vue';
import router from '@/router';
import '@/assets/styles/responsive.css';
import '@/assets/styles/global.scss';
// import 'element-plus/dist/index.css';
import { useThemeStore } from '@/store';
import Aura from '@primeuix/themes/aura';

const app = createApp(App);
const pinia = createPinia();
app.use(PrimeVue, {
  theme: {
    // preset: Aura,
  },
  options: {
    prefix: 'p',
    darkModeSelector: 'system',
    cssLayer: false,
  },
});

app.use(pinia);
useThemeStore().init();
app.use(router);
app.mount('#app');
