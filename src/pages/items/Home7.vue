<template>
  <v-scale-screen
    :width="1900"
    :height="900"
    :box-style="{ backgroundColor: 'none' }"
  >
    <div
      class="main"
      :style="{
        '--theme-color': themeColor,
        '--text-color': textColor,
        '--bg-color': themeColorList[2] || textColor,
        '--shadow-color': shadowColor,
      }"
    >
      <div class="surface-container">
        <!-- 下雨 -->
        <div class="rain-container">
          <canvas
            v-show="rainConfig.isRain"
            id="rainCanvas"
            ref="rainCanvas"
          ></canvas>
          <div class="song-container">
            <overflow-text
              v-if="songStore.songData?.track?.title"
              :color="textColor"
              :font-size="fontSizeBig"
              is-bold="bold"
            >{{ songStore.songData?.track?.title }}</overflow-text>
            <span v-if="songStore.songData?.track?.title && songStore.songData?.track?.author">&ensp;-&ensp;</span>
            <overflow-text
              v-if="songStore.songData?.track?.author"
              :color="textColor"
              :font-size="fontSizeSmall"
              is-bold="bold"
            >{{ songStore.songData?.track?.author }}</overflow-text>
            <span v-if="!songStore.songData?.track?.title && !songStore.songData?.track?.author">暂无歌曲信息</span>
          </div>
          <div class="lyric-container">
            <template v-if="songStore.lyricData.lyric.length > 0">
              <span
                v-if="songStore.lyricData.translatedLyric.length === 0"
                ref="lyricRef"
                class="lyric-line"
              >{{ songStore.lyricData.lyric[currentLyricIndex][2] || '......' }}</span>
              <span
                v-else
                class="lyric-line-translated"
              ></span>
            </template>
            <span
              v-else
              class="lyric-empty"
            >暂无歌词</span>
          </div>
        </div>
        <!-- 路灯 -->
        <div class="street-light">
          <svg
            width="120"
            height="60"
            viewBox="0 0 120 60"
            class="shade"
          >
            <polygon points="60,10 0,55 120,55" />
          </svg>
          <div class="top">
            <transition name="fade">
              <div
                class="light"
                :key="songStore.songData?.track?.cover"
              ></div>
            </transition>
          </div>
          <div class="center"></div>
          <div class="bottom"></div>
        </div>
      </div>
      <!-- 地面 -->
      <div class="curb-container"></div>
    </div>
  </v-scale-screen>
</template>

<script setup>
import overflowText from '../../components/overflowText.vue';
import VScaleScreen from 'v-scale-screen';
import { useSongStore } from '../../stores/song';
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import ColorThief from 'colorthief';
import { getCoverUrl } from '../../utils/cover';
import gsap from 'gsap';

const songStore = useSongStore();

// 字体大小
const fontSizeBig = "75px";
const fontSizeMedium = "60px";
const fontSizeSmall = "50px";
// 主体颜色
const themeColor = ref(localStorage.getItem('backgroundColor') || 'rgba(0, 0, 0, 0.8)');
const textColor = ref(localStorage.getItem('textColor') || 'rgba(255, 255, 255, 1)');
const shadowColor = ref(localStorage.getItem('shadowColor') || 'rgba(255, 255, 255, 1)');
const themeColorList = ref([]);

class Raindrop {
  constructor(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.reset();
  }
  // 重置雨滴
  reset() {
    this.y = Math.random() * -this.canvasHeight;
    if (rainConfig.value.angle >= 0) {
      this.x = (Math.random() * 1.2 - 0.2) * this.canvasWidth;
    } else {
      this.x = Math.random() * 1.2 * this.canvasWidth;
    }
    this.length = Math.random() * 20 + 20;
    this.width = Math.random() * 1 + 2;
    this.speedFactor = Math.random() * 0.5 + 0.7;
  }
  // 更新雨滴位置
  update(angle, speed) {
    const angleRad = angle * Math.PI / 180;
    const speedX = Math.sin(angleRad) * speed;
    const speedY = Math.cos(angleRad) * speed * this.speedFactor;

    this.x += speedX;
    this.y += speedY;

    if (this.y > this.canvasHeight) {
      this.reset();
    }
  }
  // 绘制雨滴
  draw(ctx, angle) {
    const angleRad = angle * Math.PI / 180;
    const endX = this.x - Math.sin(angleRad) * this.length;
    const endY = this.y - Math.cos(angleRad) * this.length;
    const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
    gradient.addColorStop(0, themeColor.value);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = this.width;
    ctx.stroke();
  }
}

const rainCanvas = ref(null);
let ctx = null;
let raindrops = [];
let animationId = null;
const rainConfig = ref(JSON.parse(localStorage.getItem('rainConfig') || {
  isRain: true,
  amount: 100,
  angle: 0,
  speed: 10,
}));

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
if (process.env.NODE_ENV === 'development1') {
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
// 当前歌词
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
  return index;
});
// 文字动画
const lyricRef = ref(null);
watch(currentLyricIndex, (newVal, oldVal) => {
  if (newVal !== oldVal && lyricRef.value) {
    gsap.fromTo(
      lyricRef.value,
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power4.out',
      }
    );
  }
});
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

  const canvas = rainCanvas.value;
  ctx = canvas.getContext('2d');
  resizeCanvas(canvas);
  createRaindrops(canvas);
  animationId = requestAnimationFrame(animation);
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas(rainCanvas.value);
    }, 200);
  });
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener('resize', () => resizeCanvas(rainCanvas.value));
});

// 跳转canvas尺寸
function resizeCanvas(canvas) {
  let canvasContainer = document.querySelector('.rain-container');
  canvas.width = canvasContainer.clientWidth;
  canvas.height = canvasContainer.clientHeight;
  raindrops.forEach((raindrop) => {
    raindrop.canvasWidth = canvas.width;
    raindrop.canvasHeight = canvas.height;
  });
}
// 创建雨滴
function createRaindrops(canvas) {
  raindrops = [];
  for (let i = 0; i < rainConfig.value.amount; i++) {
    raindrops.push(new Raindrop(canvas.width, canvas.height));
  }
}
// 开始动画
function animation() {
  const canvas = rainCanvas.value;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  raindrops.forEach((raindrop) => {
    raindrop.update(rainConfig.value.angle, rainConfig.value.speed);
    raindrop.draw(ctx, rainConfig.value.angle);
  });
  animationId = requestAnimationFrame(animation);
}
</script>

<style lang="scss" scoped>
@use 'sass:math';
// 文字大小
$font-size-big: v-bind(fontSizeBig);
$font-size-medium: v-bind(fontSizeMedium);
$font-size-small: v-bind(fontSizeSmall);

.main {
  width: 1700px;
  height: 700px;
  margin: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: 'hyp', 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;

  .surface-container {
    position: relative;
    flex: 1;

    .rain-container {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-end;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      mask-image:
        linear-gradient(to bottom, transparent, #000 20%),
        linear-gradient(to right, transparent, #000 100px, #000 calc(100% - 100px), transparent);
      mask-composite: intersect;
      z-index: 2;

      canvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 5;
      }

      .song-container {
        margin-right: 100px;
        width: 1250px;
        overflow: hidden;
        font-size: 50px;
        display: flex;
        align-items: flex-end;
        z-index: 3;

        span {
          color: var(--text-color);
          font-size: $font-size-big;
          transition: color 2s ease;
        }
      }

      .lyric-container {
        margin-right: 100px;
        width: 1250px;
        height: 100px;
        overflow: hidden;
        z-index: 3;
        display: flex;
        align-items: center;
        position: relative;

        .lyric-line {
          color: var(--text-color);
          font-size: $font-size-big;
          white-space: nowrap;
        }

        .lyric-line-translated {}

        .lyric-empty {
          color: var(--text-color);
          font-size: $font-size-big;
          font-weight: bold;
          transition: all 0.5s ease-in-out;
        }
      }
    }

    .street-light {
      height: 100%;
      width: 300px;
      position: absolute;
      left: 150px;
      top: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;

      div {
        box-sizing: border-box;
        transition: border-color 0.5s ease;
      }

      .shade {
        polygon {
          fill: none;
          stroke: var(--theme-color);
          stroke-width: 5px;
          stroke-dasharray: 10 5;
        }
      }

      .top {
        width: 60px;
        height: 60px;
        border: 5px dashed var(--theme-color);
        border-top: none;
        position: relative;

        .light {
          position: absolute;
          width: 600px;
          height: 400px;
          left: 50%;
          top: -32px;
          transform: translateX(-50%);
          background: radial-gradient(circle 300px at center 10px, var(--shadow-color) 30px, transparent);
          // background: radial-gradient(farthest-side at center 32px, var(--text-color), transparent);
          clip-path: polygon(240px 29px, 360px 29px, 100% 55%, 100% 100%, 0 100%, 0 55%);
        }

        .fade-enter-active,
        .fade-leave-active {
          transition: opacity 2s ease;
        }

        .fade-enter-from,
        .fade-leave-to {
          opacity: 0;
        }
      }

      .center {
        width: 25px;
        height: 380px;
        border: 5px dashed var(--theme-color);
        border-top: none;
        border-bottom: none;
      }

      .bottom {
        width: 40px;
        height: 70px;
        border: 5px dashed var(--theme-color);
        border-bottom: none;
      }
    }
  }

  .curb-container {
    width: 100%;
    height: 120px;
    display: flex;
    justify-content: space-around;
    box-sizing: border-box;
    border-top: 5px dashed var(--theme-color);
    mask-image: linear-gradient(to right, transparent, #000 200px, #000 calc(100% - 200px), transparent);
    transition: border-color 0.5s ease;
    z-index: 2;
  }
}
</style>