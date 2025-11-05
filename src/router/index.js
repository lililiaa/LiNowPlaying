import { ElMessage } from 'element-plus';
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { tagList } from '../dicts/tags';

// 定义路由
const routes = [
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/home',
    meta: {
      isPage: false,
    },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('../pages/Home.vue'),
        meta: {
          isPage: false,
          title: '组件预览',
        },
      },
    ],
  },
  {
    path: '/cover1',
    name: 'Cover1',
    component: () => import('../pages/uncombined/cover.vue'),
    meta: {
      isPage: true,
      title: '歌曲封面',
      tags: [tagList.custom],
      type: 'uncombined',
    },
  },
  {
    path: '/cover2',
    name: '/Cover2',
    component: () => import('../pages/uncombined/coverRound.vue'),
    meta: {
      isPage: true,
      title: '歌曲封面(圆)',
      tags: [tagList.custom],
      type: 'uncombined',
    },
  },
  {
    path: '/lyric',
    name: 'Lyric',
    component: () => import('../pages/uncombined/lyric.vue'),
    meta: {
      isPage: true,
      title: '歌词',
      tags: [tagList.custom],
      type: 'uncombined',
    },
  },
  {
    path: '/home1',
    name: 'Home1',
    component: () => import('../pages/combined/Home1.vue'),
    meta: {
      isPage: true,
      title: '歌曲组件1',
      tags: [tagList.custom],
      type: 'combined',
    },
  },
  {
    path: '/home2',
    name: 'Home2',
    component: () => import('../pages/combined/Home2.vue'),
    meta: {
      isPage: true,
      title: '歌曲组件2',
      tags: [tagList.custom],
      type: 'combined',
    },
  },
  {
    path: '/home3',
    name: 'Home3',
    component: () => import('../pages/combined/Home3.vue'),
    meta: {
      isPage: true,
      title: '歌曲组件3',
      tags: [tagList.custom],
      type: 'combined',
    },
  },
  {
    path: '/home4',
    name: 'Home4',
    component: () => import('../pages/combined/Home4.vue'),
    meta: {
      isPage: true,
      title: '歌曲组件4',
      tags: [tagList.custom],
      type: 'combined',
    },
  },
  {
    path: '/home5',
    name: 'Home5',
    component: () => import('../pages/combined/Home5.vue'),
    meta: {
      isPage: true,
      title: '都市天际线1',
      tags: [tagList.fixed, tagList.csl1],
      type: 'combined',
    },
  },
  {
    path: '/home6',
    name: 'Home6',
    component: () => import('../pages/combined/Home6.vue'),
    meta: {
      isPage: true,
      title: '卡片',
      tags: [tagList.custom],
      type: 'combined',
    },
  },
  {
    path: '/home7',
    name: 'Home7',
    component: () => import('../pages/combined/Home7.vue'),
    meta: {
      isPage: true,
      title: 'rain',
      tags: [tagList.custom],
      type: 'combined',
    },
  },
];

// 创建路由实例
const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 可以在这里添加登录验证等逻辑
  if (to.meta.title) {
    document.title = "自定义歌曲组件 - " + to.meta.title;
  }
  if (from.path === '/home' && to.path !== '/home') {
    ElMessage.info('单击鼠标右键可以跳转到其他页面');
  }
  next();
});

export default router;
