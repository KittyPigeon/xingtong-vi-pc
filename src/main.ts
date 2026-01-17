import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from '@/router';
import '@/assets/styles/responsive.css';
import '@/assets/styles/global.scss';
import { useThemeStore } from '@/store';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);
const pinia = createPinia();
app.use(Antd);

app.use(pinia);
useThemeStore().init();
app.use(router);
app.mount('#app');
