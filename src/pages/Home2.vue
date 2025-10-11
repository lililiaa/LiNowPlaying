<template>
  <v-scale-screen
    width="1840"
    height="240"
    :box-style="{ backgroundColor: none }"
  >
    <div
      class="song-container"
      :style="{ '--theme-color': themeColor, '--text-color': textColor, '--bg-color': themeColorList[2], '--stress-color': themeColorList[3] }"
    >
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
      <div class="basic-info">
        <div
          v-if="extraTextList && extraTextList.length > 0"
          class="game-info"
        >
          <div :key="currentTextIndex">
            <span v-for="item in extraTextList[currentTextIndex].join(' | ').split(' ')">
              {{ item }}
            </span>
          </div>
        </div>
        <div
          v-if="extraTextList.length > 0"
          class="song-info"
        >
          <overflow-text
            v-if="songData?.track.title"
            :color="textColor"
            is-bold="bold"
          >{{ songData?.track.title }}</overflow-text>
          <span>-</span>
          <overflow-text
            v-if="songData?.track.author"
            :color="textColor"
            font-size="35px"
          >{{ songData?.track.author }}</overflow-text>
          <span v-if="!songData?.track.title && !songData?.track.author">暂无歌曲信息</span>
        </div>
        <div
          v-else
          class="song-info2"
        >
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
        <div class="process-box">
          <span>{{ songData?.player.seekbarCurrentPositionHuman }}</span>
          <div
            class="process-bar"
            :style="{ '--bg-color': themeColorList[2], '--stress-color': themeColorList[3], '--process': songData?.player.statePercent || 0 }"
          ></div>
          <span>{{ songData?.track.durationHuman }}</span>
        </div>
      </div>
      <div class="lyric-info">
        <div
          v-if="lyricData.lyric.length > 0"
          class="lyric-box"
        >
          <div
            class="lyric-line"
            v-for="(item, index) in lyricData.lyric"
            :class="{ 'active': index === currentLyricIndex }"
            :key="index"
          >
            <span>{{ item[2] }}</span>
          </div>
        </div>
        <div
          v-else
          class="lyric-empty"
        >暂无歌词</div>
        <div class="lyric-bg">
          <img
            crossorigin="anonymous"
            :key="songData?.track.cover"
            :src="songData?.track.cover ? songData.track.cover.replace('https://y.qq.com', '/image') : ''"
            alt=""
          >
        </div>
      </div>
    </div>
  </v-scale-screen>
</template>

<script setup>
import ColorThief from 'colorthief';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import overflowText from '../components/overflowText.vue';
import VScaleScreen from 'v-scale-screen';

// 游戏&配置
// const extraTextList = reactive([['都市天际线1'], ['9600X', '5070', '64G']]);
const extraTextList = reactive([]);
const extraText = ref('');
let currentTextIndex = 0;
const changExtraText = () => {
  if (currentTextIndex < extraTextList.length) {
    currentTextIndex++;
    // 到达数组末尾时重置索引到开头
    if (currentTextIndex === extraTextList.length) {
      currentTextIndex = 0;
    }
    setTimeout(changExtraText, 6000);
  }
};
// 歌曲、播放器数据
const songData = ref();
// 歌词数据
const lyricData = reactive({
  author: [],
  lyric: [],
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
  const scrollPosition = -(index - 1) * 67;
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
      getImgColor1();
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
const getImgColor1 = () => {
  const colorThief = new ColorThief();
  const img = document.getElementsByClassName('cover')[0];
  img.onload = function () {
    const color = colorThief.getColor(img);
    themeColor.value = `rgba(${color.join(',')}, 1)`;
    textColor.value = `rgba(${color.map(i => 255 - i).join(',')}, 1)`;
    themeColorList.value = colorThief.getPalette(img).map((color) => `rgba(${color.join(',')}, 1)`);
  };
};
// 提取图片最多颜色
const getImgColor = () => {
  const img = document.getElementById('cover');
  img.onload = function () {
    const w = this.width;
    const h = this.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this, 0, 0);
    // 获取像素rgba数据
    const imageData = ctx.getImageData(0, 0, w, h);
    const colorData = imageData.data;
    const colorList = {};
    // 统计像素颜色
    let i = 0;
    while (i < colorData.length) {
      const r = colorData[i];
      const g = colorData[i + 1];
      const b = colorData[i + 2];
      const a = colorData[i + 3];
      i = i + 4; // 最后 +4 比每次 i++ 快 10ms 左右性能
      const key = [r, g, b, a].join(',')
      key in colorList ? ++colorList[key] : (colorList[key] = 1)
    }
    // 对像素颜色进行排序
    let arr = [];
    for (let key in colorList) {
      arr.push({
        color: key,
        count: colorList[key]
      })
    }
    arr.sort((a, b) => b.count - a.count);
    // 获取颜色最多的像素颜色
    const color = arr[0].color;
    themeColor.value = `rgba(${color})`;
    console.log('themeColor', themeColor.value);
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
  setTitle();
  intervalId = setInterval(fetchSongData, 200);
  changExtraText();
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
  // box-shadow: 0 4px 10px 0 var(--bg-color);
  filter: drop-shadow(0 4px 10px var(--bg-color));
}

.song-container {
  height: 200px;
  width: 1800px;
  margin: 20px;
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
    width: auto;
    min-width: 400px;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    // gap: 10px;

    &>div {
      .box();
      box-sizing: border-box;
      padding: 0 20px;
      background-color: var(--theme-color);
      transition: background-color @bg-transition-time ease;
    }

    .game-info {
      width: 100%;

      &>div {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
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
      // flex: 1;
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
      justify-content: center;
      align-items: flex-start;
      margin-bottom: 15px;

      span {
        font-size: @font-size-big;
        font-weight: bold;
        color: var(--text-color);
        transition: color @bg-transition-time ease;
      }
    }

    svg {
      color: var(--text-color);
    }

    .process-box {
      width: 100%;
      box-sizing: border-box;
      padding: 0 20px;
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
          letter-spacing: -1px;
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