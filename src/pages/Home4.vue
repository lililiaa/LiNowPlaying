<template>
  <v-scale-screen
    width="1280"
    height="480"
    :box-style="{ backgroundColor: none }"
  >
    <div
      class="main"
      :style="{ '--theme-color': themeColor, '--text-color': textColor, '--bg-color': themeColorList[2] || textColor, '--shadow-color': shadowColor, '--stress-color': themeColorList[3] }"
    >
      <div class="top-container">
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
        <div class="info-container">
          <div class="top-info">
            <div
              v-if="extraTextList.some(i => i.length > 0)"
              class="game-info bg-box"
            >
              <overflow-text
                v-if="extraTextList[0].length > 0"
                :color="textColor"
                content-align="center"
              >
                {{ extraTextList[0][0] }}
              </overflow-text>
              <div v-if="extraTextList[1].length > 0">
                <overflow-text
                  :color="textColor"
                  content-align="space-evenly"
                >
                  <span
                    v-for="(item, index) in extraTextList[1].join(' | ').split(' ')"
                    :key="index"
                  >{{ item }}</span>
                </overflow-text>
              </div>
            </div>
            <div class="song-info bg-box">
              <overflow-text
                v-if="songStore.songData?.track?.title"
                :color="textColor"
                is-bold="bold"
              >{{ songStore.songData?.track?.title }}</overflow-text>
              <overflow-text
                v-if="songStore.songData?.track?.author"
                :color="textColor"
                font-size="35px"
              >{{ songStore.songData?.track?.author }}</overflow-text>
              <span v-if="!songStore.songData?.track?.title && !songStore.songData?.track?.author">暂无歌曲信息</span>
            </div>
          </div>
          <div class="process-box">
            <span>{{ songStore.songData?.player?.seekbarCurrentPositionHuman }}</span>
            <div
              class="process-bar"
              :style="{ '--bg-color': themeColorList[2] || themeColor, '--stress-color': themeColorList[3] || textColor, '--process': songStore.songData?.player?.statePercent || 0 }"
            ></div>
            <span>{{ songStore.songData?.track?.durationHuman }}</span>
          </div>
        </div>
      </div>
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
              <span class="original">{{ item[2] }}</span>
              <span class="translated">{{songStore.lyricData.translatedLyric.find(i => i[1] ===
                songStore.lyricData.lyric[index][1])?.[2]
                || ''}}</span>
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
import ColorThief from 'colorthief';
import overflowText from '../components/overflowText.vue';
import VScaleScreen from 'v-scale-screen';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useSongStore } from '../stores/song';
import { getCoverUrl } from '../utils/cover';

const songStore = useSongStore();

// 游戏&配置
const extraTextList = reactive(JSON.parse(localStorage.getItem('extraInfo')));

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
@font-size-big: 48px;
// 文字大小2
@font-size-small: 35px;
// 歌词颜色
@lyric-color: #fff;
// 歌词字体大小
@lyric-font-size-big: 60px;
@lyric-font-size-medium: 50px;
@lyric-font-size-small: 40px;

.box() {
  border-radius: @border-radius;
  transition: box-shadow @bg-transition-time ease, filter @bg-transition-time ease;
  // box-shadow: 0 4px 10px 0 var(--shadow-color);
  filter: drop-shadow(0 4px 10px var(--shadow-color));
}

.main {
  width: 1200px;
  height: 400px;
  margin: 40px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .top-container {
    width: 100%;
    height: 190px;
    display: flex;
    justify-content: space-between;
    gap: 15px;

    .cover {
      .box();
      height: 100%;
      aspect-ratio: 1/1;
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

    .bg-box {
      .box();
      box-sizing: border-box;
      padding: 10px 20px;
      background-color: var(--theme-color);
      transition: background-color @bg-transition-time ease;
    }

    .info-container {
      flex: 1;
      width: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 15px;

      .top-info {
        flex: 1;
        width: 100%;
        display: flex;
        gap: 15px;

        .game-info {
          height: 100%;
          width: fit-content;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;
          box-sizing: border-box;

          span {
            white-space: nowrap;
            color: var(--text-color);
            font-size: @font-size-small;
            transition: color @bg-transition-time ease;
          }

          &>span:nth-child(1) {
            width: 100%;
            display: flex;
            justify-content: space-around;
            align-items: center;
            gap: 10px;
            font-size: @font-size-big;
            font-weight: bold;
            letter-spacing: 2px;
          }

          div {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            gap: 10px;

            span {
              font-size: @font-size-small;
            }
          }
        }

        .song-info {
          flex: 1;
          width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-around;

          span {
            font-size: @font-size-big;
            font-weight: bold;
            color: var(--text-color);
          }
        }
      }

      .process-box {
        .box();
        width: 100%;
        box-sizing: border-box;
        padding: 8px 20px;
        background-color: var(--theme-color);
        transition: background-color @bg-transition-time ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;

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
  }

  .lyric-container {
    width: 100%;
    height: 200px;
    box-sizing: border-box;
    padding: 0 10px;
    overflow: hidden;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0.1));

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
        font-size: @lyric-font-size-small;
        opacity: 0.8;
        transition: all 0.5s ease-in-out;
        z-index: 2;
        text-align: center;

        span {
          width: 100%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        &.active {
          opacity: 1;
          font-size: @lyric-font-size-big;
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
        justify-content: center;
        box-sizing: border-box;
        padding: 20px 0;
        color: var(--text-color);
        font-size: @lyric-font-size-small;
        opacity: 0.8;
        transition: all 0.5s ease-in-out;
        z-index: 2;
        text-align: center;

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
            font-size: @lyric-font-size-medium;
            transform: translateY(10px);
            opacity: 0.8;
            filter: blur(2px);
          }

          .translated {
            font-size: @lyric-font-size-big;
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
      justify-content: center;
      align-items: center;
      font-size: @lyric-font-size-big;
      font-weight: bold;
      color: var(--text-color);
      transition: all 0.5s ease-in-out;
    }
  }
}
</style>