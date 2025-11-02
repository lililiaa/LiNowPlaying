<template>
  <div class="main">
    <div
      class="background"
      :style="{ '--theme-color': themeColor, '--shadow-color': shadowColor }"
    ></div>
  </div>
</template>

<script setup>
import ColorThief from 'colorthief';
import { ref, watch } from 'vue';
import { getCoverUrl } from '../../utils/cover';
import { useSongStore } from '../../stores/song';

const songStore = useSongStore();

// 主体颜色
const themeColor = ref(localStorage.getItem('backgroundColor') || 'rgba(0, 0, 0, 0.8)');
const shadowColor = ref(localStorage.getItem('shadowColor') || 'rgba(255, 255, 255, 1)');
// 提取图片主题色
const getImgColor = () => {
  const colorThief = new ColorThief();
  const img = new Image();
  img.src = getCoverUrl(songStore.songData?.track?.cover);
  img.onload = function () {
    const color = colorThief.getColor(img);
    themeColor.value = `rgba(${color.join(',')}, 1)`;
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
</script>

<style lang="scss" scoped>
// 边框圆角
$border-radius: 10px;
// 背景过渡时间
$bg-transition-time: 2s;

.main {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 100px;

  .background {
    width: 100%;
    height: 100%;
    background-color: var(--theme-color);
    border-radius: $border-radius;
    transition: box-shadow $bg-transition-time ease, filter $bg-transition-time ease, background-color 2s ease;
    // box-shadow: 0 4px 10px 0 var(--shadow-color);
    filter: drop-shadow(0 4px 10px var(--shadow-color));
  }
}
</style>