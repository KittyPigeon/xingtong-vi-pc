import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../components/HelloWorld.vue'),
  },
  // 可以按需新增更多页面
  // {
  //   path: '/about',
  //   name: 'about',
  //   component: () => import('../components/About.vue'),
  // },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
