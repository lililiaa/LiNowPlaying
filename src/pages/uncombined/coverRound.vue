<template>
  <div
    class="main"
    :style="{ '--shadow-color': shadowColor }"
  >
    <transition
      name="fade"
      mode="out-in"
    >
      <div
        class="cover-container"
        :key="songStore.songData?.track?.cover"
      >
        <img
          v-if="songStore.songData?.track?.cover"
          id="cover"
          class="cover"
          :style="{ 'animation-play-state': songStore.songData?.player?.isPaused ? 'paused' : 'running' }"
          :src="songStore.songData?.track?.cover"
          alt="封面"
        />
        <img
          v-else
          class="cover"
          style="box-sizing:border-box;padding: 30px;color: #fff;"
          src="../../assets/icons/music.svg"
          alt=""
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useSongStore } from '../../stores/song';
import { onMounted, ref, watch } from 'vue';
import ColorThief from 'colorthief';
import { getCoverUrl } from '../../utils/cover';

const songStore = useSongStore();

const shadowColor = ref(localStorage.getItem('shadowColor') || 'rgba(255, 255, 255, 1)');

// 提取图片主题色
const getImgColor = () => {
  const colorThief = new ColorThief();
  const img = new Image();
  img.src = getCoverUrl(songStore.songData?.track?.cover);
  img.onload = function () {
    const color = colorThief.getColor(img);
    shadowColor.value = `rgba(${color.map(i => 255 - i).join(',')}, 1)`;
  };
};
// 监听封面变化
if (!JSON.parse(localStorage.getItem('isCustomColor'))) {
  watch(
    () => songStore.songData?.track?.cover,
    (newVal, oldVal) => {
      if (newVal && (newVal !== oldVal)) {
        // 获取主题色
        getImgColor();
      }
    },
  );
}
onMounted(() => {
  songStore.resetSongData();
});
</script>

<style lang="scss" scoped>
// 背景过渡时间
$bg-transition-time: 2s;

// 旋转动画
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.main {
  width: 100%;
  height: 100%;
  margin: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 100px;

  .cover-container {
    height: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    overflow: hidden;
    transition: opacity 1s ease;
    filter: drop-shadow(0 0 10px var(--shadow-color));

    .cover {
      height: 100%;
      width: 100%;
      aspect-ratio: 1 / 1;
      transition: box-shadow $bg-transition-time ease, filter $bg-transition-time ease;
      // box-shadow: 0 0 10px 0 var(--shadow-color);
      animation: rotate 20s linear infinite;
    }
  }
}
</style>