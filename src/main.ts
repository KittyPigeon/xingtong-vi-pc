import { createApp } from 'vue';
import App from './App.vue';
import store from './store';
import './styles/responsive.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router';
import './styles/global.scss';

createApp(App).use(store).use(ElementPlus).use(router).mount('#app');
