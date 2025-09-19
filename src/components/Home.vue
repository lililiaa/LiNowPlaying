<template>
  <div
    class="song-container"
    :style="{ '--theme-color': themeColor, '--bg-color': themeColorList[2], '--stress-color': themeColorList[3] }"
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
      <div class="info-box">
        <div
          v-if="gameName && PC"
          class="game-info"
        >
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="128"
              height="128"
              viewBox="0 0 512 512"
            >
              <path
                fill="none"
                stroke="#ffffff"
                stroke-miterlimit="10"
                stroke-width="32"
                d="M467.51 248.83c-18.4-83.18-45.69-136.24-89.43-149.17A91.5 91.5 0 0 0 352 96c-26.89 0-48.11 16-96 16s-69.15-16-96-16a99 99 0 0 0-27.2 3.66C89 112.59 61.94 165.7 43.33 248.83c-19 84.91-15.56 152 21.58 164.88c26 9 49.25-9.61 71.27-37c25-31.2 55.79-40.8 119.82-40.8s93.62 9.6 118.66 40.8c22 27.41 46.11 45.79 71.42 37.16c41.02-14.01 40.44-79.13 21.43-165.04Z"
              />
              <circle
                cx="292"
                cy="224"
                r="20"
                fill="#ffffff"
              />
              <path
                fill="#ffffff"
                d="M336 288a20 20 0 1 1 20-19.95A20 20 0 0 1 336 288"
              />
              <circle
                cx="336"
                cy="180"
                r="20"
                fill="#ffffff"
              />
              <circle
                cx="380"
                cy="224"
                r="20"
                fill="#ffffff"
              />
              <path
                fill="none"
                stroke="#ffffff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="32"
                d="M160 176v96m48-48h-96"
              />
            </svg>
            {{ gameName }}
          </span>
          <div>
            <span
              v-for="(item, index) in PC.join(' | ').split(' ')"
              :key="index"
            >{{ item }}</span>
          </div>
        </div>
        <div class="song-info">
          <div class="song">
            <span
              v-if="songData?.track.title"
              :title="songData?.track.title"
            >{{ songData?.track.title }}</span>
            <span
              v-if="songData?.track.author"
              :title="songData?.track.author"
            >{{ songData?.track.author }}</span>
            <span v-if="!songData?.track.title && !songData?.track.author">暂无歌曲信息</span>
          </div>
          <div class="playing-container">
            <div
              class="sun"
              :style="{ 'animation-play-state': songData?.player.isPaused ? 'paused' : 'running' }"
            >
              <div
                class="sun-body"
                :style="{ 'animation-play-state': songData?.player.isPaused ? 'paused' : 'running' }"
              >
                <div
                  class="line"
                  v-for="i in 8"
                  :key="i"
                  :style="{ '--i': i }"
                ></div>
              </div>
              <div
                class="eye"
                :style="{ 'animation-play-state': songData?.player.isPaused ? 'paused' : 'running' }"
              ></div>
            </div>
            <div class="horizon"></div>
          </div>
          <!-- <svg
            xmlns="http://www.w3.org/2000/svg"
            width="128"
            height="128"
            viewBox="0 0 24 24"
            class="rotate-icon"
            :style="{ 'animation-play-state': songData?.player.isPaused ? 'paused' : 'running' }"
          >
            <path
              fill="#ffffff"
              d="M16 9h-3v5.5a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 8 14.5a2.5 2.5 0 0 1 2.5-2.5c.57 0 1.08.19 1.5.5V7h4zm-4-7a10 10 0 0 1 10 10a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8a8 8 0 0 0-8-8"
            />
          </svg> -->
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
    <div class="lyric-info">
      <div class="lyric-box">
        <div
          class="lyric-line"
          v-for="(item, index) in lyricData.lyric"
          :class="{ 'active': index === currentLyricIndex }"
          :key="index"
        >
          <span>{{ item[2] }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ColorThief from 'colorthief';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

const gameName = ref('都市天际线1');
const PC = reactive(['9600X', '5070', '64G']);
const songData = ref();
const lyricData = reactive({
  author: [],
  lyric: [],
});
const themeColor = ref('rgba(0, 0, 0, 0.8)');
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
  const scrollPosition = -(index - 1) * 50;
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

onMounted(() => {
  fetchSongData();
  intervalId = setInterval(fetchSongData, 500);
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
  transition: box-shadow @bg-transition-time ease;
  box-shadow: 0 4px 10px 1px var(--bg-color);
  // filter: drop-shadow(0 5px 10px var(--bg-color));
}

.song-container {
  height: 220px;
  width: 1700px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;

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
    display: flex;
    flex-direction: column;
    gap: 15px;

    .info-box {
      display: flex;
      gap: 15px;

      &>div {
        .box();
        box-sizing: border-box;
        padding: 15px 25px;
        background-color: var(--theme-color);
        transition: background-color @bg-transition-time ease;
      }

      .game-info {
        width: fit-content;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: flex-start;

        span {
          white-space: nowrap;
          mix-blend-mode: difference;
        }

        &>span:nth-child(1) {
          width: 100%;
          display: flex;
          justify-content: space-around;
          align-items: center;
          gap: 10px;
          font-size: 35px;
          font-weight: bold;
          letter-spacing: 2px;

          svg {
            width: 60px;
            height: 60px;
            vertical-align: middle;
          }
        }

        div {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          gap: 10px;

          span {
            font-size: 30px;
          }
        }
      }

      .song-info {
        width: auto;
        min-width: 320px;
        max-width: 500px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 20px;

        .song {
          height: 100%;
          flex: 1;
          min-width: 100px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          overflow: hidden;

          span {
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            mix-blend-mode: difference;
          }

          span:nth-child(1) {
            font-size: 35px;
            font-weight: bold;
            letter-spacing: 1px;
          }

          span:nth-child(2) {
            font-size: 30px;
          }
        }

        .rotate-icon {
          width: 100px;
          height: 100px;
          animation: rotate 5s linear infinite;
        }

        .playing-container {
          position: relative;
          height: 120px;
          width: 120px;
          aspect-ratio: 1/1;
          overflow: hidden;

          .sun {
            position: absolute;
            top: 60px;
            left: calc(50% - 50px);
            width: 100px;
            height: 100px;
            animation: sun @loading-time ease-in-out infinite;
            mix-blend-mode: difference;

            .sun-body {
              position: absolute;
              top: 10px;
              left: 20px;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              border: 6px solid #fff;
              animation: sun-body @loading-time linear infinite;

              .line {
                position: absolute;
                top: -25px;
                left: calc(50% - 3px);
                width: 6px;
                height: 15px;
                border-radius: 3px;
                background-color: #fff;
                mix-blend-mode: difference;
                transform: rotate(calc(var(--i) * 45deg));
                transform-origin: center 50px;
              }

              @keyframes sun-body {
                40% {
                  transform: rotate(0);
                }

                50%,
                100% {
                  transform: rotate(45deg);
                }
              }
            }

            .eye {
              position: absolute;
              top: 38px;
              left: 35px;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background-color: #fff;
              mix-blend-mode: difference;
              box-shadow: 16px 0 #fff;
              animation: eye @loading-time linear infinite;

              @keyframes eye {

                50%,
                60% {
                  transform: scaleY(1);
                }

                55% {
                  transform: scaleY(0.1);
                }

                65%,
                100% {
                  transform: translateX(12px);
                }
              }
            }
          }

          .horizon {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 6px;
            background-color: var(--theme-color);
            transition: background-color @bg-transition-time ease;

            &::before {
              content: '';
              position: absolute;
              left: 0;
              height: 6px;
              width: 100%;
              border-radius: 3px;
              background-color: #fff;
              mix-blend-mode: difference;
            }
          }

          @keyframes sun {

            0%,
            10%,
            100% {
              transform: translateY(20px);
            }

            40%,
            70% {
              transform: translateY(-40px);
            }
          }
        }

      }

      svg {
        mix-blend-mode: difference;
      }
    }

    .process-box {
      .box();
      flex: 1;
      width: 100%;
      box-sizing: border-box;
      padding: 0 25px;
      background-color: var(--theme-color);
      transition: background-color @bg-transition-time ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 25px;

      span {
        font-size: 30px;
        font-weight: 600;
        mix-blend-mode: difference;
      }

      .process-bar {
        flex: 1;
        position: relative;
        height: 20px;
        border-radius: 10px;
        overflow: hidden;
        background-color: var(--bg-color);
        outline: 4px solid var(--bg-color);

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: inherit;
          transition: width 0.5s ease;
          width: calc(var(--process) * 100%);
          background-color: var(--stress-color);
        }
      }
    }
  }

  .lyric-info {
    .box();
    height: 100%;
    flex: 1;
    box-sizing: border-box;
    padding: 10px 25px;
    background-color: var(--theme-color);
    transition: background-color @bg-transition-time ease;
    overflow: hidden;
    position: relative;

    .lyric-box {
      width: 100%;
      background-color: var(--theme-color);
      transition: transform 0.5s ease, background-color @bg-transition-time ease;

      .lyric-line {
        height: 50px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        box-sizing: border-box;
        padding-left: 5px;
        color: #fff;
        mix-blend-mode: difference;
        font-size: 25px;
        opacity: 0.8;
        transition: all 0.5s ease-in-out;

        span {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        &.active {
          opacity: 1;
          font-size: 30px;
          font-weight: bold;
        }

        &:not(.active) {
          span {
            filter: blur(1px);
          }
        }
      }
    }
  }
}
</style>