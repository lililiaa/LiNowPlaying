<template>
  <RouterView />
</template>

<script setup>
import { onBeforeMount, onBeforeUnmount, onMounted, reactive, watch } from 'vue';
import ContextMenu from '@imengyu/vue3-context-menu';
import router from './router';
import { useSongStore } from './stores/song';

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

const songStore = useSongStore();
if (window === window.parent) {
  window.songStore = songStore;
  watch(
    () => songStore.songData?.track?.cover,
    (newVal, oldVal) => {
      if (newVal && (newVal !== oldVal)) {
        // 开始变化
        songStore.setChangingStatus(true);
        // 获取歌词信息
        songStore.getLyricData();
        // 动画结束重置状态
        setTimeout(() => {
          songStore.setChangingStatus(false);
        }, 2000);
      }
    },
  );

  let intervalId = null;
  onMounted(() => {
    songStore.fetchSongData();
    intervalId = setInterval(songStore.fetchSongData, localStorage.getItem("queryTime") || 1000);
  });

  onBeforeMount(() => {
    changTheme();
    setQueryTime();
    setExtraInfo();
  });
  
  onBeforeUnmount(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  })
} else {
  let intervalId = null;
  try {
    const parentStore = window.parent.songStore;
    if (parentStore) {
      intervalId = setInterval(() => {
        songStore.songData = parentStore.songData;
        songStore.lyricData = parentStore.lyricData;
        songStore.isChanging = parentStore.isChanging;
      }, localStorage.getItem("queryTime") || 1000);
    }
  } catch (error) {
    console.error(error);
  }
  onBeforeUnmount(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  })
}
</script>

<style scoped></style>
