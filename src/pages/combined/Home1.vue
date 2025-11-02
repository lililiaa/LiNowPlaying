<template>
  <v-scale-screen
    :width="1880"
    :height="300"
    :box-style="{ backgroundColor: 'none' }"
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
        src="../../assets/icons/music.svg"
        alt=""
      >
      <div class="basic-info">
        <div class="info-box">
          <div
            v-if="extraTextList.some(i => i.length > 0)"
            class="game-info"
          >
            <overflow-text
              v-if="extraTextList[0].length > 0"
              is-bold
              :color="textColor"
              content-align="center"
            >
              {{ extraTextList[0][0] }}
            </overflow-text>
            <div v-if="extraTextList[1].length > 0">
              <overflow-text
                :color="textColor"
                content-align="space-around"
              >
                <span
                  v-for="(item, index) in extraTextList[1].join(' | ').split(' ')"
                  :key="index"
                >{{ item }}</span>
              </overflow-text>
            </div>
          </div>
          <div
            class="song-info"
            :class="{ 'song-info2': extraTextList.length === 0 }"
          >
            <div class="song">
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
            <!-- 柱条动画 -->
            <!-- 太阳动画 -->
            <div class="playing-container">
              <div
                class="sun"
                :style="{ 'animation-play-state': songStore.songData?.player?.isPaused ? 'paused' : 'running' }"
              >
                <div
                  class="sun-body"
                  :style="{ 'animation-play-state': songStore.songData?.player?.isPaused ? 'paused' : 'running' }"
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
                  :style="{ 'animation-play-state': songStore.songData?.player?.isPaused ? 'paused' : 'running' }"
                ></div>
              </div>
              <div class="horizon"></div>
            </div>
            <!-- 旋转动画 -->
            <!-- <svg
            xmlns="http://www.w3.org/2000/svg"
            width="128"
            height="128"
            viewBox="0 0 24 24"
            class="rotate-icon"
            :style="{ 'animation-play-state': songData?.player.isPaused ? 'paused' : 'running' }"
          >
            <path
              :fill="textColor"
              d="M16 9h-3v5.5a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 8 14.5a2.5 2.5 0 0 1 2.5-2.5c.57 0 1.08.19 1.5.5V7h4zm-4-7a10 10 0 0 1 10 10a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8a8 8 0 0 0-8-8"
            />
          </svg> -->
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
        <!-- <div class="lyric-bg">
          <img
            :key="songStore.songData?.track?.cover"
            :src="songStore.songData?.track?.cover"
            alt=""
          >
        </div> -->
      </div>
    </div>
  </v-scale-screen>
</template>

<script setup>
import ColorThief from 'colorthief';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import overflowText from '../../components/overflowText.vue';
import VScaleScreen from 'v-scale-screen';
import { useSongStore } from '../../stores/song';
import { getCoverUrl } from '../../utils/cover';

const songStore = useSongStore();
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
    scrollPosition = -(index - 1) * 73;
  } else {
    scrollPosition = -(index) * 110;
  }
  // 滚动歌词
  const lyricContainer = document.querySelector('.lyric-box');
  if (lyricContainer) {
    lyricContainer.style.transform = `translateY(${scrollPosition}px)`;
  }
  return index;
});
// 提取图片主题色
const getImgColor1 = () => {
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
        getImgColor1();
      }
    },
  );
}
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
  songStore.resetSongData();
});
</script>

<style lang="scss" scoped>
// 边框圆角
$border-radius: 10px;
// 播放动画速度
$loading-time: 5s;
// 背景过渡时间
$bg-transition-time: 2s;
// 文字大小1
$font-size-big: 45px;
// 文字大小2
$font-size-small: 35px;


@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

%box {
  border-radius: $border-radius;
  transition: box-shadow $bg-transition-time ease;
  // box-shadow: 0 4px 10px 0 var(--shadow-color);
  filter: drop-shadow(0 4px 10px var(--shadow-color));
}

.song-container {
  height: 220px;
  width: 1800px;
  margin: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
  transition: background-color $bg-transition-time ease, color $bg-transition-time ease;

  .cover {
    height: 100%;
    aspect-ratio: 1/1;
    @extend %box;
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
        @extend %box;
        box-sizing: border-box;
        padding: 15px 20px;
        background-color: var(--theme-color);
        transition: background-color $bg-transition-time ease;
      }

      .game-info {
        width: fit-content;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;

        span {
          white-space: nowrap;
          color: var(--text-color);
          transition: color $bg-transition-time ease;
        }

        &>span:nth-child(1) {
          width: 100%;
          display: flex;
          justify-content: space-around;
          align-items: center;
          gap: 10px;
          font-size: $font-size-big;
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
            font-size: $font-size-small;
          }
        }
      }

      .song-info2 {
        min-width: 450px !important;
        max-width: 600px !important;
      }

      .song-info {
        width: auto;
        min-width: 320px;
        max-width: 400px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 10px;

        .song {
          height: 100%;
          flex: 1;
          min-width: 100px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          overflow: hidden;

          span {
            font-size: $font-size-big;
            font-weight: bold;
            color: var(--text-color);
          }
        }

        .rotate-icon {
          width: 120px;
          height: 120px;
          box-sizing: border-box;
          padding: 10px;
          animation: rotate 5s linear infinite;
        }

        .playing-container {
          position: relative;
          height: 120px;
          width: 120px;
          aspect-ratio: 1/1;
          overflow: hidden;
          box-sizing: border-box;
          border-bottom: 6px solid var(--text-color);
          transition: border-color $bg-transition-time ease;

          .sun {
            position: absolute;
            top: 60px;
            left: calc(50% - 50px);
            width: 100px;
            height: 100px;
            animation: sun $loading-time ease-in-out infinite;

            .sun-body {
              position: absolute;
              top: 10px;
              left: 20px;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              border: 6px solid var(--text-color);
              transition: border-color $bg-transition-time ease;
              animation: sun-body $loading-time linear infinite;

              .line {
                position: absolute;
                top: -25px;
                left: calc(50% - 3px);
                width: 6px;
                height: 15px;
                border-radius: 3px;
                background-color: var(--text-color);
                transition: background-color $bg-transition-time ease;
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
              background-color: var(--text-color);
              box-shadow: 16px 0 var(--text-color);
              transition: background-color $bg-transition-time ease, box-shadow $bg-transition-time ease;
              animation: eye $loading-time linear infinite;

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

          @keyframes sun {

            0%,
            10%,
            100% {
              transform: translateY(20px);
            }

            40%,
            70% {
              transform: translateY(-45px);
            }
          }
        }

      }

      svg {
        color: var(--text-color);
      }
    }

    .process-box {
      @extend %box;
      flex: 1;
      width: 100%;
      box-sizing: border-box;
      padding: 0 20px;
      background-color: var(--theme-color);
      transition: background-color $bg-transition-time ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;

      span {
        font-size: $font-size-small;
        font-weight: 600;
        color: var(--text-color);
        transition: color $bg-transition-time ease;
      }

      .process-bar {
        flex: 1;
        position: relative;
        height: 20px;
        border-radius: 14px;
        overflow: hidden;
        background-color: var(--bg-color);
        border: 4px solid var(--bg-color);
        transition: background-color $bg-transition-time ease, border-color $bg-transition-time ease;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          height: inherit;
          width: calc(var(--process) * 100%);
          background-color: var(--stress-color);
          transition: width 0.5s ease, background-color $bg-transition-time ease;
        }
      }
    }
  }

  .lyric-info {
    @extend %box;
    height: 100%;
    flex: 1;
    box-sizing: border-box;
    padding: 0 20px;
    background-color: var(--theme-color);
    transition: background-color $bg-transition-time ease;
    overflow: hidden;
    position: relative;

    .lyric-box {
      width: 100%;
      transition: transform 0.5s ease;

      .lyric-line {
        height: 73px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        box-sizing: border-box;
        color: var(--text-color);
        font-size: 45px;
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
          font-size: 55px;
          font-weight: bold;
        }

        &:not(.active) {
          filter: blur(1px);
        }
      }

      .lyric-line-translated {
        height: 110px;
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
        animation: fade $bg-transition-time ease $bg-transition-time forwards;
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