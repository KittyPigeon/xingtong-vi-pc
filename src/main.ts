import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from '@/router';
import ElementPlus from 'element-plus';
import '@/assets/styles/responsive.css';
import '@/assets/styles/global.scss';
import 'element-plus/dist/index.css';
import { useThemeStore } from '@/store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
useThemeStore().init();
app.use(ElementPlus);
app.use(router);
app.mount('#app');
