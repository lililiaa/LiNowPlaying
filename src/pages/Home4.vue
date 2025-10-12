<template>
  <v-scale-screen
    width="1280"
    height="580"
    :box-style="{ backgroundColor: none }"
  >
    <div
      class="main"
      :style="{ '--theme-color': themeColor, '--text-color': textColor, '--bg-color': themeColorList[2], '--stress-color': themeColorList[3] }"
    >
      <div class="top-container">
        <img
          v-show="songData?.track.cover"
          id="cover"
          class="cover"
          crossorigin="anonymous"
          :class="{ 'changing': isChanging }"
          :src="songData?.track.cover ? songData.track.cover.replace('https://y.qq.com', '/image') : ''"
          alt="封面"
        />
        <img
          v-show="!songData?.track.cover"
          class="cover"
          :class="{ 'changing': isChanging }"
          style="box-sizing:border-box;padding: 30px;color: #fff;"
          src="../assets/music.svg"
          alt=""
        >
        <div class="info-container">
          <div class="top-info">
            <div
              v-if="gameName && PC"
              class="game-info bg-box"
            >
              <span>
                {{ gameName }}
              </span>
              <div>
                <span
                  v-for="(item, index) in PC.join(' | ').split(' ')"
                  :key="index"
                >{{ item }}</span>
              </div>
            </div>
            <div class="song-info bg-box">
              <overflow-text
                v-if="songData?.track.title"
                :color="textColor"
                is-bold="bold"
              >{{ songData?.track.title }}</overflow-text>
              <overflow-text
                v-if="songData?.track.author"
                :color="textColor"
                font-size="35px"
              >{{ songData?.track.author }}</overflow-text>
              <span v-if="!songData?.track.title && !songData?.track.author">暂无歌曲信息</span>
            </div>
          </div>
          <div class="process-box">
            <span>{{ songData?.player.seekbarCurrentPositionHuman }}</span>
            <div
              class="process-bar"
              :style="{ '--bg-color': themeColorList[2], '--stress-color': themeColorList[3], '--process': songData?.player.statePercent || 0 }"
            ></div>
            <span>{{ songData?.track.durationHuman }}</span>
          </div>
        </div>
      </div>
      <div class="lyric-container">
        <div
          v-if="lyricData.lyric.length > 0"
          class="lyric-box"
        >
          <template v-if="lyricData.translatedLyric.length === 0">
            <div
              v-for="(item, index) in lyricData.lyric"
              class="lyric-line"
              :class="{ 'active': index === currentLyricIndex }"
              :key="index"
            >
              <span>{{ item[2] }}</span>
            </div>
          </template>
          <template v-else>
            <div
              v-for="(item, index) in lyricData.lyric"
              class="lyric-line-translated"
              :class="{ 'active': index === currentLyricIndex }"
              :key="index"
            >
              <span class="original">{{ item[2] }}</span>
              <span class="translated">{{lyricData.translatedLyric.find(i => i[1] === lyricData.lyric[index][1])?.[2]
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
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

// 游戏
const gameName = ref('都市天际线1');
// 配置
const PC = reactive(['9600X', '5070', '64G']);
// 游戏&配置
const extraTextList = reactive([['都市天际线1'], ['9600X', '5070', '64G']]);
// const extraTextList = reactive([]);

// 歌曲、播放器数据
const songData = ref();
// 歌词数据
const lyricData = reactive({
  author: [],
  lyric: [],
  translatedLyric: [],
});

// 主体颜色
const themeColor = ref('rgba(0, 0, 0, 0.8)');
const textColor = ref('rgba(255, 255, 255, 1)');
const themeColorList = ref([]);
let intervalId = null;
const isChanging = ref(false);
// 获取播放器、歌曲信息
const fetchSongData = async () => {
  try {
    const res = await fetch('http://localhost:9863/query');
    const data = await res.json();
    songData.value = data;
  } catch (error) {
    songData.value = {};
    console.error(error);
  }
};

// 获取歌词信息
const getLyricInfo = async () => {
  const authorRegex = /^{.*}$/gm;
  const lyricRegex = /^\[\d+:\d+\.\d+\].*$/gm;
  const lyricRegex2 = /^(\[\d+:\d+\.\d+\])(.*)$/;
  try {
    const res = await fetch("http://localhost:9863/api/lyric");
    const data = await res.json();
    lyricData.author = data.lrc?.match(authorRegex)?.map(i => JSON.parse(i)) || [];
    lyricData.lyric = data.lrc?.match(lyricRegex)?.map(i => i.match(lyricRegex2)) || [];
    if (data.hasTranslatedLyric) {
      lyricData.translatedLyric = data.translatedLyric?.match(lyricRegex)?.map(i => i.match(lyricRegex2)) || [];
    } else {
      lyricData.translatedLyric = [];
    }
  } catch (error) {
    lyricData.value = {};
    console.error(error);
  }
};
// 计算当前显示歌词
const currentLyricIndex = computed(() => {
  const currentTimeStr = songData.value?.player.seekbarCurrentPositionHuman.split(':') || 0;
  const currentTime = parseInt(currentTimeStr[0]) * 60 + parseInt(currentTimeStr[1]);
  let index = -1;
  for (let i = lyricData.lyric.length - 1; i >= 0; i--) {
    const timeStr = lyricData.lyric[i][1].match(/\[(\d+):(\d+)\.(\d+)\]/);
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
  if (lyricData.translatedLyric.length === 0) {
    scrollPosition = -(index - 1) * 75;
  } else {
    scrollPosition = -(index) * 150;
  }
  // 滚动歌词
  const lyricContainer = document.querySelector('.lyric-box');
  if (lyricContainer) {
    lyricContainer.style.transform = `translateY(${scrollPosition}px)`;
  }
  return index;
});

// 监听封面变化
watch(
  () => songData.value?.track?.cover,
  (newVal, oldVal) => {
    if (newVal && (newVal !== oldVal)) {
      // 开始变化
      isChanging.value = true;
      // 获取主题色
      getImgColor();
      // 获取歌词信息
      getLyricInfo();
      // 动画结束重置状态
      setTimeout(() => {
        isChanging.value = false;
      }, 2000);
    }
  },
  {
    deep: true,
  }
);
// 提取图片主题色
const getImgColor = () => {
  const colorThief = new ColorThief();
  const img = document.getElementsByClassName('cover')[0];
  img.onload = function () {
    const color = colorThief.getColor(img);
    themeColor.value = `rgba(${color.join(',')}, 1)`;
    textColor.value = `rgba(${color.map(i => 255 - i).join(',')}, 1)`;
    themeColorList.value = colorThief.getPalette(img).map((color) => `rgba(${color.join(',')}, 1)`);
  };
};
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
  () => songData.value?.player?.isPaused,
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
  () => songData.value?.track?.title,
  (newVal) => {
    titleData.name = newVal;
    setTitle();
  }
);

onMounted(() => {
  fetchSongData();
  // getLyricInfo();
  // getImgColor();
  intervalId = setInterval(fetchSongData, localStorage.getItem("queryTime") || 1000);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
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
  // box-shadow: 0 4px 10px 0 var(--bg-color);
  filter: drop-shadow(0 4px 10px var(--bg-color));
}

.main {
  width: 1200px;
  height: 500px;
  margin: 40px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .top-container {
    width: 100%;
    height: 35%;
    display: flex;
    justify-content: space-between;
    gap: 15px;

    .cover {
      .box();
      height: 100%;
      aspect-ratio: 1/1;
      background-color: var(--theme-color);
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
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 15px;

      .top-info {
        flex: 1;
        display: flex;
        gap: 15px;

        .game-info {
          height: 100%;
          width: fit-content;
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
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: flex-start;

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
    height: 300px;
    box-sizing: border-box;
    padding: 0 10px;
    overflow: hidden;
    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 1) 70%, rgba(0, 0, 0, 0.1));

    .lyric-box {
      width: 100%;
      transition: transform 0.5s ease;

      .lyric-line {
        height: 75px;
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
        height: 150px;
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
      justify-content: flex-end;
      align-items: center;
      font-size: @lyric-font-size-big;
      font-weight: bold;
      color: var(--text-color);
      transition: all 0.5s ease-in-out;
    }
  }
}
</style>