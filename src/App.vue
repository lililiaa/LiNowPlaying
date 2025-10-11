<template>
  <RouterView />
</template>

<script setup>
import { reactive } from 'vue';
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
</script>

<style scoped></style>
