<template>
  <v-scale-screen
    :width="1900"
    :height="800"
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
            <span
              v-if="songStore.songData?.track?.title && songStore.songData?.track?.author"
              class="separate"
            >-</span>
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
              >{{ songStore.lyricData.lyric[currentLyricIndex]?.length > 0 ?
                (songStore.lyricData.lyric[currentLyricIndex][2] || '......')
                : '......' }}</span>
              <div
                v-else
                ref="lyricRef"
                class="lyric-line-translated"
              >
                <span class="original">{{ originalLyric }}</span>
                <span class="translated">{{ translatedLyric }}</span>
              </div>
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
const fontSizeBig = "80px";
const fontSizeMedium = "65px";
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
const originalLyric = ref("");
const translatedLyric = ref("");
// 文字动画
const lyricRef = ref(null);
watch(currentLyricIndex, (newVal, oldVal) => {
  if (songStore.lyricData.translatedLyric.length > 0) {
    if (newVal === -1) {
      originalLyric.value = "";
      translatedLyric.value = "";
    } else {
      let timeStr = songStore.lyricData.lyric[newVal][1];
      let translated = songStore.lyricData.translatedLyric.find((item) => item[1] === timeStr);
      if (translated && translated[2]) {
        translatedLyric.value = translated[2];
        originalLyric.value = songStore.lyricData.lyric[newVal][2];
      } else {
        translatedLyric.value = songStore.lyricData.lyric[newVal][2];
        originalLyric.value = "";
      }
    }
  }
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
  height: 600px;
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
        linear-gradient(to bottom, transparent, #000 50px),
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
        width: 1300px;
        overflow: hidden;
        font-size: 50px;
        display: flex;
        align-items: flex-end;
        padding-bottom: 10px;
        z-index: 3;
        color: var(--text-color);
        font-size: $font-size-big;

        .separate {
          margin: 0 5px;
          transition: color 2s ease;
        }
      }

      .lyric-container {
        margin-right: 100px;
        width: 1300px;
        height: 100px;
        overflow: hidden;
        z-index: 3;
        display: flex;
        align-items: center;
        position: relative;

        span {
          color: var(--text-color);
          transition: color 2s ease;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .lyric-line {
          width: 100%;
          font-size: $font-size-big;
          -webkit-box-flex: below 5px;
        }

        .lyric-line-translated {
          height: 100%;
          width: 100%;
          white-space: nowrap;
          position: relative;

          .original {
            position: absolute;
            top: 2px;
            right: 0;
            font-size: $font-size-small;
            opacity: 0.8;
            filter: blur(2px);
          }

          .translated {
            position: absolute;
            bottom: 10px;
            left: 0;
            font-size: $font-size-medium;
          }
        }

        .lyric-empty {
          color: var(--text-color);
          font-size: $font-size-big;
          font-weight: bold;
          transition: all 2s ease-in-out;
        }
      }
    }

    .street-light {
      height: 100%;
      width: 300px;
      position: absolute;
      left: 100px;
      top: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;

      div {
        box-sizing: border-box;
        transition: border-color 2s ease;
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
        width: 50px;
        height: 50px;
        border: 5px dashed var(--theme-color);
        border-top: none;
        position: relative;

        .light {
          position: absolute;
          width: 500px;
          height: 400px;
          left: 50%;
          top: -32px;
          transform: translateX(-50%);
          background: radial-gradient(circle 150px at center 10px, var(--shadow-color) 30px, transparent);
          // background: radial-gradient(farthest-side at center 32px, var(--text-color), transparent);
          clip-path: polygon(190px 29px, 310px 29px, 100% 45%, 100% 100%, 0 100%, 0 45%);
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
        height: 250px;
        border: 5px dashed var(--theme-color);
        border-top: none;
        border-bottom: none;
      }

      .bottom {
        width: 35px;
        height: 50px;
        border: 5px dashed var(--theme-color);
        border-bottom: none;
      }
    }
  }

  .curb-container {
    width: 100%;
    height: 80px;
    display: flex;
    justify-content: space-around;
    box-sizing: border-box;
    border-top: 5px dashed var(--theme-color);
    mask-image: linear-gradient(to right, transparent, #000 200px, #000 calc(100% - 200px), transparent);
    transition: border-color 2s ease;
    z-index: 2;
  }
}
</style>