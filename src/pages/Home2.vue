<template>
  <v-scale-screen
    width="1880"
    height="280"
    :box-style="{ backgroundColor: none }"
  >
    <div
      class="song-container"
      :style="{ '--theme-color': themeColor, '--text-color': textColor, '--bg-color': themeColorList[2] || textColor, '--shadow-color': shadowColor, '--stress-color': themeColorList[3] }"
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
        src="../assets/icons/music.svg"
        alt=""
      >
      <div class="basic-info">
        <div
          v-if="extraTextList.some(i => i.length > 0)"
          class="game-info"
        >
          <div :key="currentTextIndex">
            <overflow-text
              :color="textColor"
              is-bold="bold"
              content-align="space-evenly"
            >
              <template v-for="(item, index) in extraTextList[currentTextIndex]">
                <span>{{ item }}</span>
                <span v-if="index < extraTextList[currentTextIndex].length - 1">|</span>
              </template>
            </overflow-text>
          </div>
        </div>
        <div
          v-if="extraTextList.some(i => i.length !== 0)"
          class="song-info"
        >
          <overflow-text
            v-if="songStore.songData?.track?.title"
            :color="textColor"
            is-bold="bold"
          >
            {{ songStore.songData?.track?.title }}
          </overflow-text>
          <span>-</span>
          <overflow-text
            v-if="songStore.songData?.track?.author"
            :color="textColor"
            font-size="35px"
          >
            {{ songStore.songData?.track?.author }}
          </overflow-text>
          <span v-if="!songStore.songData?.track?.title && !songStore.songData?.track?.author">暂无歌曲信息</span>
        </div>
        <div
          v-else
          class="song-info2"
        >
          <overflow-text
            v-if="songStore.songData?.track?.title"
            :color="textColor"
            is-bold="bold"
          >
            {{ songStore.songData?.track?.title }}
          </overflow-text>
          <overflow-text
            v-if="songStore.songData?.track?.author"
            :color="textColor"
            font-size="35px"
          >
            {{ songStore.songData?.track?.author }}
          </overflow-text>
          <span v-if="!songStore.songData?.track?.title && !songStore.songData?.track?.author">暂无歌曲信息</span>
        </div>
        <div class="process-box">
          <span>{{ songStore.songData?.player?.seekbarCurrentPositionHuman }}</span>
          <div
            class="process-bar"
            :style="{ '--bg-color': themeColorList[2] || themeColor, '--stress-color': themeColorList[3] || textColor, '--process': songStore.songData?.player?.statePercent || 0 }"
          >
          </div>
          <span>{{ songStore.songData?.track?.durationHuman }}</span>
        </div>
      </div>
      <div class="lyric-info">
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
        <div class="lyric-bg">
          <img
            :key="songStore.songData?.track?.cover"
            :src="songStore.songData?.track?.cover"
            alt=""
          >
        </div>
      </div>
    </div>
  </v-scale-screen>
</template>

<script setup>
import ColorThief from 'colorthief';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import overflowText from '../components/overflowText.vue';
import VScaleScreen from 'v-scale-screen';
import { useSongStore } from '../stores/song';
import { getCoverUrl } from '../utils/cover';

const songStore = useSongStore();

// 游戏&配置
const extraTextList = reactive(JSON.parse(localStorage.getItem('extraInfo')));
let currentTextIndex = 0;
const changExtraText = () => {
  let nextIndex = currentTextIndex;
  do {
    nextIndex = (nextIndex + 1) % extraTextList.length;
  } while (extraTextList[nextIndex].length === 0 && nextIndex !== currentTextIndex);
  if (extraTextList[nextIndex].length > 0) {
    currentTextIndex = nextIndex;
  }
  setTimeout(changExtraText, 8000);
};
// 主体颜色
const themeColor = ref(localStorage.getItem('backgroundColor') || 'rgba(0, 0, 0, 0.8)');
const textColor = ref(localStorage.getItem('textColor') || 'rgba(255, 255, 255, 1)');
const shadowColor = ref(localStorage.getItem('shadowColor') || 'rgba(255, 255, 255, 1)');
const themeColorList = ref([]);
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
    scrollPosition = -(index - 1) * 67;
  } else {
    scrollPosition = -(index) * 100;
  }
  // 滚动歌词
  const lyricContainer = document.querySelector('.lyric-box');
  if (lyricContainer) {
    lyricContainer.style.transform = `translateY(${scrollPosition}px)`;
  }
  return index;
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
    shadowColor.value = `rgba(${color.map(i => 255 - i).join(',')}, 1)`;
    themeColorList.value = colorThief.getPalette(img).map((color) => `rgba(${color.join(',')}, 1)`);
  };
};
// 监听封面变化
if (process.env.NODE_ENV === 'development') {
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
  changExtraText();
});
</script>

<style lang="less" scoped>
// 边框圆角
@border-radius: 10px;
// 播放动画速度
@loading-time: 5s;
// 背景过渡时间
@bg-transition-time: 2s;
// 文字大小1
@font-size-big: 42px;
// 文字大小2
@font-size-small: 35px;


@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.box() {
  border-radius: @border-radius;
  transition: box-shadow @bg-transition-time ease, filter @bg-transition-time ease;
  // box-shadow: 0 4px 10px 0 var(--shadow-color);
  filter: drop-shadow(0 4px 10px var(--shadow-color));
}

.song-container {
  height: 200px;
  width: 1800px;
  margin: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
  transition: background-color @bg-transition-time ease, color @bg-transition-time ease;

  .cover {
    height: 100%;
    aspect-ratio: 1/1;
    .box();
    background-color: var(--theme-color);
  }

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

  .basic-info {
    height: 100%;
    width: 500px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;

    &>div {
      .box();
      box-sizing: border-box;
      padding: 0 20px;
      background-color: var(--theme-color);
      transition: background-color @bg-transition-time ease;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }

    .game-info {
      flex: 1;
      width: 100%;

      &>div {
        width: 100%;
        animation: fade-scale 1s ease;
      }

      span {
        font-size: @font-size-big;
        white-space: nowrap;
        color: var(--text-color);
        transition: color @bg-transition-time ease;
      }
    }

    .song-info {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      gap: 20px;

      span {
        font-size: @font-size-big;
        font-weight: bold;
        color: var(--text-color);
        transition: color @bg-transition-time ease;
      }
    }

    .song-info2 {
      flex: 1;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: flex-start;

      &>div {
        width: 100%;
      }
    }

    svg {
      color: var(--text-color);
    }

    .process-box {
      width: 100%;
      box-sizing: border-box;
      padding: 5px 20px;
      background-color: var(--theme-color);
      transition: background-color @bg-transition-time ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;

      span {
        font-size: @font-size-small;
        font-weight: 600;
        color: var(--text-color);
        transition: color @bg-transition-time ease;
      }

      .process-bar {
        flex: 1;
        position: relative;
        height: 20px;
        border-radius: 14px;
        overflow: hidden;
        background-color: var(--bg-color);
        border: 4px solid var(--bg-color);
        transition: background-color @bg-transition-time ease, border-color @bg-transition-time ease;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: inherit;
          width: calc(var(--process) * 100%);
          background-color: var(--stress-color);
          transition: width 0.5s ease, background-color @bg-transition-time ease;
        }
      }
    }
  }

  .lyric-info {
    .box();
    height: 100%;
    flex: 1;
    box-sizing: border-box;
    padding: 0 20px;
    background-color: var(--theme-color);
    transition: background-color @bg-transition-time ease;
    overflow: hidden;
    position: relative;

    .lyric-box {
      width: 100%;
      transition: transform 0.5s ease;

      .lyric-line {
        height: 67px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        box-sizing: border-box;
        color: var(--text-color);
        font-size: 42px;
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
          font-size: 52px;
          font-weight: bold;
        }

        &:not(.active) {
          filter: blur(1px);
        }
      }

      .lyric-line-translated {
        height: 100px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        box-sizing: border-box;
        padding: 10px 0;
        color: var(--text-color);
        font-size: 38px;
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
            font-size: 45px;
            transform: translateY(10px);
            opacity: 0.8;
            filter: blur(2px);
          }

          .translated {
            font-size: 55px;
            transform: translateY(-10px);
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
      justify-content: flex-start;
      align-items: center;
      font-size: 55px;
      font-weight: bold;
      color: var(--text-color);
      transition: all 0.5s ease-in-out;
    }

    .lyric-bg {
      position: absolute;
      top: -30px;
      right: 0;
      height: calc(100% + 60px);
      aspect-ratio: 1/1;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        mask-image: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.8));
        filter: blur(3px);
        opacity: 0;
        animation: fade @bg-transition-time ease @bg-transition-time forwards;
        z-index: 1;
      }

      @keyframes fade {
        0% {
          opacity: 0;
        }

        100% {
          opacity: 1;
        }
      }
    }
  }
}
</style>