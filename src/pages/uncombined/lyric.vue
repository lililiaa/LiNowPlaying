<template>
  <v-scale-screen :box-style="{ backgroundColor: 'none' }">
    <div
      class="main"
      :style="{ '--text-color': textColor }"
    >
      <div class="lyric-container">
        <div
          v-if="songStore.lyricData.lyric.length > 0"
          class="lyric-box"
        >
          <template v-if="songStore.lyricData.translatedLyric.length === 0">
            <div
              v-for="(item, index) in songStore.lyricData.lyric"
              class="lyric-line"
              :class="{ 'active': index === currentLyricIndex }"
              :key="index"
            >
              <span>{{ item[2] }}</span>
            </div>
          </template>
          <template v-else>
            <div
              v-for="(item, index) in songStore.lyricData.lyric"
              class="lyric-line-translated"
              :class="{ 'active': index === currentLyricIndex }"
              :key="index"
            >
              <span class="original">{{songStore.lyricData.translatedLyric.find(i => i[1] ===
                songStore.lyricData.lyric[index][1])?.[2] ? item[2] : ''}}</span>
              <span class="translated">{{songStore.lyricData.translatedLyric.find(i => i[1] ===
                songStore.lyricData.lyric[index][1])?.[2]
                || item[2]}}</span>
            </div>
          </template>
        </div>
        <div
          v-else
          class="lyric-empty"
        >暂无歌词</div>
      </div>
    </div>
  </v-scale-screen>
</template>

<script setup>
import VScaleScreen from 'v-scale-screen';
import { computed, onMounted, ref, watch } from 'vue';
import { useSongStore } from '../../stores/song';
import ColorThief from 'colorthief';
import { getCoverUrl } from '../../utils/cover';
import router from '../../router';

const songStore = useSongStore();
// 计算当前显示歌词
const currentLyricIndex = computed(() => {
  const currentTimeStr = songStore.songData?.player?.seekbarCurrentPositionHuman.split(':') || 0;
  const currentTime = parseInt(currentTimeStr[0]) * 60 + parseInt(currentTimeStr[1]);
  let index = -1;
  for (let i = songStore.lyricData.lyric.length - 1; i >= 0; i--) {
    const timeStr = songStore.lyricData.lyric[i][1].match(/\[(\d+):(\d+)\.(\d+)\]/);
    if (timeStr) {
      const time = parseInt(timeStr[1]) * 60 + parseInt(timeStr[2]);
      if (currentTime >= time) {
        index = i;
        break;
      }
    }
  }
  // 滚动位置
  let scrollPosition = 0;
  if (songStore.lyricData.translatedLyric.length === 0) {
    scrollPosition = -(index - 3) * 100;
  } else {
    scrollPosition = -(index - 2) * 160;
  }
  // 滚动歌词
  const lyricContainer = document.querySelector('.lyric-box');
  if (lyricContainer) {
    lyricContainer.style.transform = `translateY(${scrollPosition}px)`;
  }
  return index;
});
// 主体颜色
const themeColor = ref(localStorage.getItem('backgroundColor') || 'rgba(0, 0, 0, 0.8)');
const textColor = ref(localStorage.getItem('textColor') || 'rgba(255, 255, 255, 1)');
const shadowColor = ref(localStorage.getItem('shadowColor') || 'rgba(255, 255, 255, 1)');
// 提取图片主题色
const getImgColor = () => {
  const colorThief = new ColorThief();
  const img = new Image();
  img.src = getCoverUrl(songStore.songData?.track?.cover);
  img.onload = function () {
    const color = colorThief.getColor(img);
    themeColor.value = `rgba(${color.join(',')}, 1)`;
    textColor.value = `rgba(${color.map(i => 255 - i).join(',')}, 1)`;
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
const textAlign = ref('center');
const setTextAlign = () => {
  let align = router.currentRoute.value.query?.align;
  if (align === 'left') {
    textAlign.value = 'left';
  } else if (align === 'center') {
    textAlign.value = 'center';
  } else if (align === 'right') {
    textAlign.value = 'right';
  } else {
    textAlign.value = 'center';
  }
};
onMounted(() => {
  setTextAlign();
  songStore.resetSongData();
});
</script>

<style lang="scss" scoped>
// 歌词颜色
$lyric-color: #fff;
// 歌词字体大小
$lyric-font-size-big: 70px;
$lyric-font-size-medium: 55px;
$lyric-font-size-small: 50px;

.main {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 50px;

  .lyric-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), #000 100px, #000 calc(100% - 100px), rgba(0, 0, 0, 0.1));

    .lyric-box {
      width: 100%;
      transition: transform 0.5s ease;
      text-align: v-bind(textAlign);

      .lyric-line {
        height: 100px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        box-sizing: border-box;
        color: var(--text-color);
        font-size: $lyric-font-size-small;
        opacity: 0.8;
        transition: all 0.5s ease-in-out;
        z-index: 2;

        span {
          width: 100%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        &.active {
          opacity: 1;
          font-size: $lyric-font-size-big;
          font-weight: bold;
        }

        &:not(.active) {
          filter: blur(1px);
        }
      }

      .lyric-line-translated {
        height: 160px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 10px 0;
        color: var(--text-color);
        font-size: $lyric-font-size-small;
        opacity: 0.8;
        transition: all 0.5s ease-in-out;
        z-index: 2;

        span {
          width: 100%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: visible;
          transition: all 0.5s ease-in-out;
          flex: 1;
        }

        &.active {
          opacity: 1;
          font-weight: bold;

          .original {
            font-size: $lyric-font-size-medium;
            transform: translateY(15px);
            opacity: 0.8;
            filter: blur(2px);
          }

          .translated {
            font-size: $lyric-font-size-big;
            transform: translateY(-15px);
          }
        }

        &:not(.active) {
          filter: blur(1px);
        }
      }
    }

    .lyric-empty {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: v-bind(textAlign);
      align-items: center;
      font-size: $lyric-font-size-big;
      font-weight: bold;
      color: var(--text-color);
      transition: all 0.5s ease-in-out;
    }
  }
}
</style>