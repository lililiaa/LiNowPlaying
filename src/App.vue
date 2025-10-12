<template>
  <RouterView />
</template>

<script setup>
import { onBeforeMount, reactive } from 'vue';
import ContextMenu from '@imengyu/vue3-context-menu';
import router from './router';

const menuData = reactive({
  items: router.getRoutes().filter(route => route.meta.title).map((route) => ({
    label: route.meta.title,
    icon: "icon-yemian",
    onClick: () => {
      router.push(route.path);
    },
  })),
});
// 右键菜单
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  ContextMenu.showContextMenu({
    theme: 'default dark',
    x: e.clientX,
    y: e.clientY,
    items: [
      {
        label: '刷新页面',
        icon: 'icon-shuaxin',
        onClick: () => {
          location.reload();
        }
      },
      {
        label: '页面跳转',
        icon: 'icon-open-blank',
        children: menuData.items,
      }
    ],
  });
});
// 设置颜色主题
if (!localStorage.getItem('theme')) {
  localStorage.setItem('theme', 'light');
}
// 切换主题
const changTheme = () => {
  let theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
};
// 设置请求间隔
const setQueryTime = () => {
  let queryTime = localStorage.getItem('queryTime');
  if (!queryTime) localStorage.setItem('queryTime', 1000);
};
// 设置额外信息
const setExtraInfo = () => {
  let extraInfo = localStorage.getItem('extraInfo');
  if (!extraInfo) localStorage.setItem('extraInfo', '[["游戏名称"], ["配置信息"]]');
};

onBeforeMount(() => {
  changTheme();
  setQueryTime();
  setExtraInfo();
});
</script>

<style scoped></style>
