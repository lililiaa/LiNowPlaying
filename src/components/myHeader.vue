<template>
  <div class="header">
    <img
      src="../assets/icons/music.svg"
      alt="music"
    >
    <span>自定义歌曲组件&ensp;-&ensp;{{ router.currentRoute.value.meta.title }}</span>
    <span class="time">{{ timeNow }}</span>
    <div class="header-right">
      <img
        src="../assets/icons/email.svg"
        alt="email"
        title="联系作者"
        @click="openEmail"
      >
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
      <img
        src="../assets/icons/question.svg"
        alt="question"
        title="如何使用"
        @click="openTour"
      >
    </div>
  </div>
</template>

<script setup>
import { markRaw, onBeforeUnmount, onMounted, ref } from 'vue';
import router from '../router';
import { ElMessageBox } from 'element-plus';
import { Message } from '@element-plus/icons-vue';

const timeNow = ref(new Date().toLocaleString());
let dateInterval = null;

const emit = defineEmits(['openTour']);
// 联系作者
const openEmail = () => {
  ElMessageBox.alert('邮箱：3460391727@qq.com', '联系作者', {
    confirmButtonText: '关闭',
    icon: markRaw(Message),
    closeOnClickModal: true,
    closeOnPressEscape: true,
  });
};
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
// 如何使用
const openTour = () => {
  emit('openTour');
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

  .time {
    font-size: 25px;
    margin-left: auto;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 25px;
    user-select: none;

    img {
      width: 30px;
      height: 30px;
      cursor: pointer;
      transition: filter 0.3s ease;

      &:active {
        filter: brightness(0.8);
      }
    }
  }
}
</style>