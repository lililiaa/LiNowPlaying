<template>
  <div
    class="song-container"
    :style="{ '--theme-color': themeColor }"
  >
    <img
      id="cover"
      crossorigin="anonymous"
      :class="{ 'changing': isChanging }"
      :src="songData?.track.cover ? songData.track.cover.replace('https://y.qq.com', '/image') : ''"
      alt="封面"
      @click="changeCoverSyle"
    />
    <div class="basic-info">
      <div class="info-box">
        <div class="game-info">
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
          <span>{{ PC }}</span>
        </div>
        <div class="song-info">
          <div>
            <span :title="songData?.track.title">{{ songData?.track.title }}</span>
            <span :title="songData?.track.author">{{ songData?.track.author }}</span>
          </div>
          <svg
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
          </svg>
        </div>
      </div>
      <div class="process-box">
        <span>{{ songData?.player.seekbarCurrentPositionHuman }}</span>
        <div
          class="process-bar"
          :style="{ '--bg-color': themeColorList[2], '--stress-color': themeColorList[1], '--process': songData?.player.statePercent }"
        ></div>
        <span>{{ songData?.track.durationHuman }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import ColorThief from 'colorthief';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const gameName = ref('都市天际线1');
const PC = ref('9600X | 5070 | 64G');
const songData = ref();
const themeColor = ref('rgba(0, 0, 0, 1)');
const themeColorList = ref([]);
let intervalId = null;
const isChanging = ref(false);

const fetchSongData = async () => {
  try {
    const response = await fetch('http://localhost:9863/query');
    const data = await response.json();
    songData.value = data;
  } catch (error) {
    songData.value = {};
    console.log(error);
  }
}
// 监听封面变化
watch(
  () => songData.value?.track?.cover,
  (newVal, oldVal) => {
    if (newVal && (newVal !== oldVal)) {
      // 开始变化
      isChanging.value = true;
      // 获取主题色
      getImgColor1();
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
  const img = document.getElementById('cover');
  img.onload = function () {
    const color = colorThief.getColor(img);
    themeColor.value = `rgba(${color.join(',')}, 1)`;
    themeColorList.value = colorThief.getPalette(img).map((color) => `rgba(${color.join(',')}, 1)`);
    console.log('themeColorList', themeColorList.value);
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
  intervalId = setInterval(fetchSongData, 1000);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
})
</script>

<style lang="less" scoped>
// 边框圆角
@border-radius: 10px;

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
  box-shadow: 0 5px 10px var(--theme-color);
  transition: box-shadow 2s ease;
  // filter: drop-shadow(0 5px 10px var(--theme-color));
}

.song-container {
  height: 120px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  // box-shadow: 0 0 0 2px #ffffff;
  color: #fff;

  img {
    height: 100%;
    aspect-ratio: 1/1;
    .box();
    background-color: var(--theme-color);
  }

  img.changing {
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
    gap: 10px;

    .info-box {
      display: flex;
      gap: 10px;

      &>div {
        .box();
        box-sizing: border-box;
        padding: 10px 15px;
        background-color: var(--theme-color);
        transition: background-color 2s ease;
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

        span:nth-child(1) {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 1px;

          svg {
            width: 30px;
            height: 30px;
            vertical-align: middle;
          }
        }

        span:nth-child(2) {
          font-size: 16px;
        }
      }

      .song-info {
        width: auto;
        max-width: 300px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 10px;

        &>div {
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
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 1px;
          }

          span:nth-child(2) {
            font-size: 16px;
          }
        }

        .rotate-icon {
          width: 50px;
          height: 50px;
          animation: rotate 5s linear infinite;
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
      padding: 0 15px;
      background-color: var(--theme-color);
      transition: background-color 2s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;

      span {
        font-size: 16px;
        font-weight: 600;
        mix-blend-mode: difference;
      }

      .process-bar {
        flex: 1;
        position: relative;
        height: 6px;
        border-radius: 3px;
        background-color: var(--bg-color);
        transition: width 1s linear;

        &::before {
          content: '';
          position: absolute;
          height: inherit;
          width: calc(var(--process) * 100%);
          border-radius: inherit;
          background-color: var(--stress-color);
        }
      }
    }
  }
}
</style>