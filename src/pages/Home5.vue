<template>
  <v-scale-screen
    width="1880"
    height="400"
    :box-style="{ backgroundColor: none }"
  >
    <div class="main">
      <!-- 标题 -->
      <div
        v-if="extraTextList.some(i => i.length > 0)"
        class="header"
      >
        <span
          v-if="extraTextList[0].length > 0"
          class="title"
        >{{ extraTextList[0][0] }}</span>
        <span
          v-if="extraTextList.every(i => i.length > 0)"
          class="title"
        >&ensp;-&ensp;</span>
        <div
          v-if="extraTextList[1].length > 0"
          class="extra"
        >
          <span
            v-for="(item, index) in extraTextList[1].join(' | ').split(' ')"
            :key="index"
          >{{ item }}</span>
        </div>
      </div>
      <!-- 内容 -->
      <div class="content">
        <!-- 封面 -->
        <div
          class="cover"
          :key="songData?.track.cover"
        >
          <img
            v-show="songData?.track.cover"
            id="cover"
            crossorigin="anonymous"
            :class="{ 'changing': isChanging }"
            :style="{ 'animation-play-state': songData?.player.isPaused ? 'paused' : 'running' }"
            :src="songData?.track.cover ? songData.track.cover.replace('https://y.qq.com', '/image') : ''"
            alt="封面"
          />
          <img
            v-show="!songData?.track.cover"
            :class="{ 'changing': isChanging }"
            style="box-sizing:border-box;padding: 30px;color: #fff;"
            src="../assets/icons/music.svg"
            alt=""
          >
          <ElProgress
            class="progress-circle"
            type="circle"
            :percentage="progress"
            :show-text="false"
            width="210"
            color="#2a3338"
          />
        </div>
        <!-- 歌名&歌手 -->
        <div class="song-info">
          <overflow-text
            v-if="songData?.track.title"
            :color="textColor"
            :font-size="fontSizeBig"
            is-bold="bold"
          >{{ songData?.track.title }}</overflow-text>
          <overflow-text
            v-if="songData?.track.author"
            :color="textColor"
            :font-size="fontSizeSmall"
          >{{ songData?.track.author }}</overflow-text>
          <span v-if="!songData?.track.title && !songData?.track.author">暂无歌曲信息</span>
        </div>
        <!-- 分隔 -->
        <div class="split"></div>
        <!-- 歌词 -->
        <div class="lyric-info">
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
    </div>
  </v-scale-screen>
</template>
<script setup>
import ColorThief from 'colorthief';
import overflowText from '../components/overflowText.vue';
import VScaleScreen from 'v-scale-screen';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { ElProgress } from 'element-plus';

// 字体大小
const fontSizeBig = "70px";
const fontSizeMedium = "60px";
const fontSizeSmall = "45px";
// 游戏&配置
const extraTextList = reactive(JSON.parse(localStorage.getItem('extraInfo')));

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
// 进度
const progress = computed(() => {
  if (songData.value?.player.statePercent) {
    return Math.round(songData.value.player.statePercent * 100);
  }
  return 0;
});

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
    scrollPosition = -(index - 1) * 80;
  } else {
    scrollPosition = -(index) * 120;
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
  intervalId = setInterval(fetchSongData, localStorage.getItem("queryTime") || 1000);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>
<style lang="less" scoped>
// 文字大小
@font-size-big: v-bind(fontSizeBig);
@font-size-medium: v-bind(fontSizeMedium);
@font-size-small: v-bind(fontSizeSmall);

// 旋转动画
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

// 出现动画
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

.main {
  height: 320px;
  width: 1800px;
  margin: 40px;
  box-sizing: border-box;
  padding: 8px;
  border-radius: 30px;
  background-color: #2a3338;
  display: flex;
  flex-direction: column;

  .header {
    width: 100%;
    height: 70px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;

    .title {
      font-size: 45px;
    }

    .extra {
      display: flex;
      gap: 15px;
      font-size: 45px;
    }
  }

  .content {
    flex: 1;
    height: 0;
    background-color: #959595;
    border-radius: 25px;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    padding: 0 20px;
    gap: 30px;

    .cover {
      border-radius: 50%;
      height: 210px;
      width: 210px;
      position: relative;
      overflow: hidden;
      animation: fade-scale 1s ease;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        width: 180px;
        height: 180px;
        border-radius: 50%;
        animation: rotate 20s linear 1.5s infinite;
      }

      .progress-circle {
        position: absolute;
      }
    }

    .song-info {
      height: 100%;
      min-width: 300px;
      max-width: 450px;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;

      span {
        font-size: @font-size-big;
      }
    }

    .split {
      height: 90%;
      width: 3px;
      background: linear-gradient(to bottom, transparent, #2a3338 30%, #2a3338 70%, transparent);
    }

    .lyric-info {
      height: 100%;
      width: 0;
      flex: 1;
      overflow: hidden;
      mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 1) 15%, rgba(0, 0, 0, 1) 85%, rgba(0, 0, 0, 0.1));

      .lyric-box {
        width: 100%;
        transition: transform 0.5s ease;

        .lyric-line {
          height: 80px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          box-sizing: border-box;
          font-size: @font-size-small;
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
            font-size: @font-size-big;
            font-weight: bold;
          }

          &:not(.active) {
            filter: blur(1px);
          }
        }

        .lyric-line-translated {
          height: 120px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 20px 0;
          font-size: @font-size-small;
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
              font-size: @font-size-medium;
              transform: translateY(10px);
              opacity: 0.8;
              filter: blur(2px);
            }

            .translated {
              font-size: @font-size-big;
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
        font-size: @font-size-big;
        font-weight: bold;
        transition: all 0.5s ease-in-out;
      }
    }
  }
}
</style>