<template>
  <RouterView />
</template>

<script setup>
import { onBeforeMount, onBeforeUnmount, onMounted, reactive, watch } from 'vue';
import ContextMenu from '@imengyu/vue3-context-menu';
import router from './router';
import { useSongStore } from './stores/song';
import { ElMessageBox } from 'element-plus';

const menuData = reactive({
  items: [
    {
      label: '组合组件',
      icon: 'icon-yemian',
      children: [],
    },
    {
      label: '独立组件',
      icon: 'icon-yemian',
      children: [],
    },
  ],
});
const setMenuData = () => {
  router.getRoutes().filter(route => route.meta.title).forEach(route => {
    if (route.meta.type === 'combined') {
      menuData.items.find(item => item.label === '组合组件').children.push({
        label: route.meta.title,
        icon: "icon-yemian",
        onClick: () => {
          router.push(route.path);
        },
      });
    } else if (route.meta.type === 'uncombined') {
      menuData.items.find(item => item.label === '独立组件').children.push({
        label: route.meta.title,
        icon: "icon-yemian",
        onClick: () => {
          router.push(route.path);
        },
      });
    } else {
      menuData.items.push({
        label: route.meta.title,
        icon: "icon-yemian",
        onClick: () => {
          router.push(route.path);
        },
      });
    }
  });
};
// 初始化漫游式引导
if (localStorage.getItem('tour') === null) {
  localStorage.setItem('tour', 'false');
}
// 右键菜单
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  ContextMenu.showContextMenu({
    theme: localStorage.getItem('theme') === 'light' ? 'default' : 'default dark',
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
      },
      {
        label: '清除缓存',
        icon: 'icon-qingchuhuancun',
        onClick: () => {
          ElMessageBox.confirm('清除缓存会重置全部系统配置，是否继续？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            localStorage.clear();
            location.reload();
          });
        }
      },
    ],
  });
});
// 设置颜色主题
if (!localStorage.getItem('theme')) {
  localStorage.setItem('theme', 'light');
}
if (!localStorage.getItem('backgroundColor')) {
  localStorage.setItem('backgroundColor', 'rgba(0, 0, 0, 1)');
}
if (!localStorage.getItem('textColor')) {
  localStorage.setItem('textColor', 'rgba(255, 255, 255, 1)');
}
if (!localStorage.getItem('shadowColor')) {
  localStorage.setItem('shadowColor', 'rgba(255, 255, 255, 1)');
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
// 初始化请求间隔
const setQueryTime = () => {
  let queryTime = localStorage.getItem('queryTime');
  if (!queryTime) localStorage.setItem('queryTime', 1000);
};
// 初始化额外信息
const setExtraInfo = () => {
  let extraInfo = localStorage.getItem('extraInfo');
  if (!extraInfo) localStorage.setItem('extraInfo', '[["游戏名称"], ["配置信息"]]');
};
// 初始化rain设置
const setRain = () => {
  let rain = localStorage.getItem('rainConfig');
  if (!rain) localStorage.setItem('rainConfig', JSON.stringify({
    isRain: true,
    amount: 100,
    angle: 0,
    speed: 10,
  }));
};
// 初始化是否自定义配色
const setIsCustomColor = () => {
  let isCustomColor = localStorage.getItem('isCustomColor');
  if (!isCustomColor) {
    localStorage.setItem('isCustomColor', 'false');
  }
};
// 获取歌曲信息
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
    setMenuData();
    songStore.fetchSongData();
    intervalId = setInterval(songStore.fetchSongData, localStorage.getItem("queryTime") || 1000);
  });

  onBeforeMount(() => {
    changTheme();
    setQueryTime();
    setExtraInfo();
    setRain();
    setIsCustomColor();
  });

  onBeforeUnmount(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  })

  const channel = new BroadcastChannel('song-channel');
  watch(
    () => [songStore.songData, songStore.lyricData, songStore.isChanging],
    (newVal) => {
      channel.postMessage(JSON.stringify(newVal));
    },
    { deep: true },
  )
} else {
  onMounted(() => {
    const channel = new BroadcastChannel('song-channel');
    channel.onmessage = (e) => {
      const [songData, lyricData, isChanging] = JSON.parse(e.data);
      songStore.songData = songData;
      songStore.lyricData = lyricData;
      songStore.isChanging = isChanging;
    }
    onBeforeMount(() => {
      channel.close();
    });
  });
}
</script>

<style scoped></style>
