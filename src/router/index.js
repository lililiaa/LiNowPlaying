import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import Home from '../pages/Home.vue'

// 定义路由
const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 可以在这里添加登录验证等逻辑
  next();
});

export default router;
