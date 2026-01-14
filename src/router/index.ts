import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/components/business/HelloWorld.vue'),
    meta: {
      title: '仪表盘',
    },
  },
  // {
  //   path: '/crypto-demo',
  //   name: 'CryptoDemo',
  //   component: () => import('@/views/CryptoDemoView.vue'),
  //   meta: {
  //     title: '加解密演示',
  //   },
  // },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('@/views/ReportsView.vue'),
    meta: {
      title: '报表',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: {
      title: '设置',
    },
  },
  // 可以按需新增更多页面
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: () => import('@/views/About.vue'),
  //   meta: {
  //     title: '关于',
  //   },
  // },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
