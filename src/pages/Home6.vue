<template>
  <v-scale-screen
    :width="800"
    :height="1000"
    :box-style="{ backgroundColor: 'none' }"
  >
    <div
      class="main"
      :style="{ '--theme-color': themeColor, '--text-color': textColor, '--bg-color': themeColorList[2] || textColor, '--shadow-color': shadowColor, '--stress-color': themeColorList[3] }"
    >
      <div
        class="cover"
        :style="{ outline: `10px solid ${outlineColor}` }"
      >
        <img
          v-show="songStore.songData?.track?.cover"
          id="cover"
          :class="{ 'changing': songStore.isChanging }"
          :style="{ 'animation-play-state': songStore.songData?.player?.isPaused ? 'paused' : 'running' }"
          :src="songStore.songData?.track?.cover"
          alt="封面"
        />
        <img
          v-show="songStore.songData?.track?.cover"
          class="old-cover"
          :class="{ 'changing': songStore.isChanging }"
          :style="{ 'animation-play-state': songStore.songData?.player?.isPaused ? 'paused' : 'running' }"
          :src="oldCover"
          alt="封面"
        />
        <img
          v-show="!songStore.songData?.track?.cover"
          :class="{ 'changing': songStore.isChanging }"
          style="box-sizing:border-box;padding: 30px;color: #fff;"
          src="../assets/icons/music.svg"
          alt=""
        >
      </div>
      <div class="song-container">
        <overflow-text
          v-if="songStore.songData?.track?.title"
          :color="textColor"
          is-bold="bold"
          font-size="50px"
          content-align="center"
        >
          {{ songStore.songData?.track?.title }}
        </overflow-text>
        <overflow-text
          v-if="songStore.songData?.track?.author"
          :color="textColor"
          font-size="40px"
          content-align="center"
        >
          {{ songStore.songData?.track?.author }}
        </overflow-text>
        <span v-if="!songStore.songData?.track?.title && !songStore.songData?.track?.author">暂无歌曲信息</span>
      </div>
    </div>
  </v-scale-screen>
</template>

<script setup>
import overflowText from '../components/overflowText.vue';
import VScaleScreen from 'v-scale-screen';
import { useSongStore } from '../stores/song';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import ColorThief from 'colorthief';
import { getCoverUrl } from '../utils/cover';
import { isColorDark } from '../stores/color';

const songStore = useSongStore();
// 游戏&配置
const extraTextList = reactive(JSON.parse(localStorage.getItem('extraInfo')));

// 主体颜色
const themeColor = ref(localStorage.getItem('backgroundColor') || 'rgba(0, 0, 0, 0.8)');
const textColor = ref(localStorage.getItem('textColor') || 'rgba(255, 255, 255, 1)');
const shadowColor = ref(localStorage.getItem('shadowColor') || 'rgba(255, 255, 255, 1)');
const themeColorList = ref([]);
const outlineColor = ref('rgb(255, 255, 255)');

// 进度
const progress = computed(() => {
  if (songStore.songData?.player?.statePercent) {
    return (songStore.songData?.player?.statePercent * 100).toFixed(2);
  }
  return 0;
});

// 提取图片主题色
const getImgColor = () => {
  const colorThief = new ColorThief();
  const img = new Image();
  img.src = getCoverUrl(songStore.songData?.track?.cover);
  img.onload = function () {
    const color = colorThief.getColor(img);
    themeColor.value = `rgba(${color.join(',')}, 1)`;
    textColor.value = `rgba(${color.map(i => 255 - i).join(',')}, 1)`;
    shadowColor.value = `rgba(${color.map(i => 255 - i).join(',')}, 0.8)`;
    themeColorList.value = colorThief.getPalette(img).map((color) => `rgba(${color.join(',')}, 1)`);
    outlineColor.value = isColorDark(themeColor.value) ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
  };
};
// 监听封面变化
const oldCover = ref('');
if (process.env.NODE_ENV === 'development') {
  watch(
    () => songStore.songData?.track?.cover,
    (newVal, oldVal) => {
      oldCover.value = oldVal || '../assets/icons/music.svg';
      if (newVal && (newVal !== oldVal)) {
        // 获取主题色
        getImgColor();
      }
    },
  );
}

// 网页标题
const titleData = reactive({
  status: "已暂停",
  name: "暂无歌曲",
});
const setTitle = () => {
  if (titleData.status && titleData.name) {
    document.title = titleData.status + " - " + titleData.name;
  } else {
    document.title = "歌曲组件";
  }
};
watch(
  () => songStore.songData?.player?.isPaused,
  (newVal) => {
    if (newVal) {
      titleData.status = "已暂停";
    } else {
      titleData.status = "播放中";
    }
    setTitle();
  }
);
watch(
  () => songStore.songData?.track?.title,
  (newVal) => {
    titleData.name = newVal;
    setTitle();
  }
);

onMounted(() => {
  setTitle();
  songStore.resetSongData();
});
</script>

<style lang="less" scoped>
@keyframes slide-left {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

.main {
  width: 700px;
  height: 900px;
  margin: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  transition: all 0.3s ease;
  background-color: var(--theme-color);
  box-shadow: 0 15px 40px 0 var(--shadow-color);
  // filter: drop-shadow(0 4px 10px var(--shadow-color));

  span {
    color: var(--text-color);
  }

  .cover {
    width: 70%;
    aspect-ratio: 1 / 1;
    position: relative;
    overflow: hidden;
    transition: outline-color 1s ease;

    img {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;

      &::after {
        content: "";
        position: absolute;
        top: 0;
        right: 100%;
        width: inherit;
        height: inherit;
        background-image: var(--old-cover);
      }
    }

    .old-cover {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: -100%;
    }

    .changing {
      animation: slide-left 1s ease;
    }
  }

  .song-container {
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    mask-image: linear-gradient(to right, rgba(0, 0, 0, 0), #000 10%, #000 90%, rgba(0, 0, 0, 0));
  }
}
</style>