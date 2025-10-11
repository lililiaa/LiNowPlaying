import { ElMessage } from 'element-plus';
import { createRouter, createWebHistory } from 'vue-router'

// 定义路由
const routes = [
  {
    path: '/',
    redirect: '/home',
    meta: {
      isPage: false,
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
    meta: {
      isPage: false,
      title: '组件预览',
    },
  },
  {
    path: '/home1',
    name: 'Home1',
    component: () => import('../pages/Home1.vue'),
    meta: {
      isPage: true,
      title: '歌曲组件1',
    },
  },
  {
    path: '/home2',
    name: 'Home2',
    component: () => import('../pages/Home2.vue'),
    meta: {
      isPage: true,
      title: '歌曲组件2',
    },
  },
  {
    path: '/home3',
    name: 'Home3',
    component: () => import('../pages/Home3.vue'),
    meta: {
      isPage: true,
      title: '歌曲组件3',
    },
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 可以在这里添加登录验证等逻辑
  if (to.meta.title) {
    document.title = "歌曲组件 - " + to.meta.title;
  }
  if (from.path === '/home' && to.path !== '/home') {
    ElMessage.info('单击鼠标右键可以跳转到其他页面');
  }
  next();
});

export default router;
