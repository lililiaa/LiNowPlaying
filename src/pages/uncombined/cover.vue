<template>
  <v-scale-screen
    :width="1000"
    :height="1000"
    :box-style="{ backgroundColor: 'none' }"
  >
    <div
      class="main"
      :style="{ '--shadow-color': shadowColor }"
    >
      <img
        v-show="songStore.songData?.track?.cover"
        id="cover"
        class="cover"
        :class="{ 'changing': songStore.isChanging }"
        :src="songStore.songData?.track?.cover"
        alt="封面"
      />
      <img
        v-show="!songStore.songData?.track?.cover"
        class="cover"
        :class="{ 'changing': songStore.isChanging }"
        style="box-sizing:border-box;padding: 30px;color: #fff;"
        src="../../assets/icons/music.svg"
        alt=""
      >
    </div>
  </v-scale-screen>
</template>

<script setup>
import VScaleScreen from 'v-scale-screen';
import { useSongStore } from '../../stores/song';
import { ref, watch } from 'vue';
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

</script>

<style lang="scss" scoped>
// 背景过渡时间
$bg-transition-time: 2s;

.main {
  width: 800px;
  height: 800px;
  margin: 100px;
  box-sizing: border-box;
  padding: 50px;

  .cover {
    height: 100%;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 10px;
    transition: box-shadow $bg-transition-time ease, filter $bg-transition-time ease;
    // box-shadow: 0 4px 10px 0 var(--shadow-color);
    filter: drop-shadow(0 4px 10px var(--shadow-color));

    .cover.changing {
      animation: fade-scale 1s ease;
      transform-origin: 50% 0%;
    }

    @keyframes fade-scale {
      0% {
        opacity: 0;
        transform: scale(0.8);
      }

      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
}
</style>