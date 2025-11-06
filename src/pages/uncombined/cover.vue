<template>
  <div
    class="main"
    :style="{ '--shadow-color': shadowColor }"
  >
    <transition
      name="fade"
      mode="out-in"
    >
      <img
        v-if="songStore.songData?.track?.cover"
        id="cover"
        class="cover"
        :key="songStore.songData?.track?.cover"
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

@keyframes fade {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 1s ease;
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

  .cover {
    height: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 10px;
    // transition: box-shadow $bg-transition-time ease, filter $bg-transition-time ease;
    // box-shadow: 0 4px 10px 0 var(--shadow-color);
    filter: drop-shadow(0 4px 10px var(--shadow-color));
    // animation: fade 2s ease;

    // .cover.changing {
    //   animation: fade-scale 1s ease;
    //   transform-origin: 50% 0%;
    // }

    // @keyframes fade-scale {
    //   0% {
    //     opacity: 0;
    //     transform: scale(0.8);
    //   }

    //   100% {
    //     opacity: 1;
    //     transform: scale(1);
    //   }
    // }
  }
}
</style>