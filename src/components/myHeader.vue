<template>
  <div class="header">
    <img
      src="../assets/icons/music.svg"
      alt="music"
    >
    <span>自定义歌曲播放器&ensp;-&ensp;{{ router.currentRoute.value.meta.title }}</span>
    <div class="header-right">
      <span>{{ timeNow }}</span>
      <img
        src="../assets/icons/theme.svg"
        alt="github"
        title="切换主题"
        @click="changTheme"
      >
      <img
        src="../assets/icons/github.svg"
        alt="github"
        title="在github上查看"
        @click="openGithub"
      >
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import router from '../router';

const timeNow = ref(new Date().toLocaleString());
let dateInterval = null;

// 切换主题
const changTheme = () => {
  let theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    localStorage.setItem('theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }
};
// 打开github
const openGithub = () => {
  window.open('https://github.com/lililiaa/myNowPlaying', '_blank');
};

onMounted(() => {
  dateInterval = setInterval(() => {
    timeNow.value = new Date().toLocaleString();
  }, 1000);
});

onBeforeUnmount(() => {
  if (dateInterval) clearInterval(dateInterval);
});
</script>

<style lang="less" scoped>
.header {
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 20px;
  box-sizing: border-box;
  padding: 0 30px;
  background: #8360c3;
  background: -webkit-linear-gradient(to right, #2ebf91, #8360c3);
  background: linear-gradient(to right, #2ebf91, #8360c3);
  font-size: 40px;
  box-shadow: 0 4px 10px var(--shadow-color-hover);
  z-index: 2;

  img {
    width: 55px;
    height: 55px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-left: auto;
    font-size: 25px;
    user-select: none;

    span {
      margin-right: 10px;
    }

    img {
      width: 30px;
      height: 30px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:active {
        opacity: 0.9;
      }
    }
  }
}
</style>