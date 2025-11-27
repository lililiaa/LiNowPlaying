<template>
  <v-scale-screen
    :width="1900"
    :height="400"
    :box-style="{ backgroundColor: 'none' }"
  >
    <div class="main">
      <div class="song-info">
        <div>
          <img
            src="../../assets/imgs/stardew/stardew_flute_block.png"
            alt=""
            class="left-img"
          >
          <overflow-text
            v-if="songStore.songData?.track?.title"
            color="#55150c"
            :font-size="fontSizeBig"
            is-bold="bold"
          >{{ songStore.songData?.track?.title }}</overflow-text>
        </div>
        <div>
          <img
            src="../../assets/imgs/stardew/stardew_player.png"
            alt=""
            class="left-img"
          >
          <overflow-text
            v-if="songStore.songData?.track?.author"
            color="#55150c"
            :font-size="fontSizeSmall"
          >{{ songStore.songData?.track?.author }}</overflow-text>
        </div>
        <div>

          <span v-if="!songStore.songData?.track?.title && !songStore.songData?.track?.author">暂无歌曲信息</span>
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
              <img
                :src="iconPaths[index % iconPaths.length]"
                alt=""
                class="lyric-icon"
              >
              <span>{{ item[2] || '......' }}</span>
              <img
                :src="iconPaths[index % iconPaths.length]"
                alt=""
                class="lyric-icon"
              >
            </div>
          </template>
          <template v-else>
            <div
              v-for="(item, index) in songStore.lyricData.lyric"
              class="lyric-line-translated"
              :class="{ 'active': index === currentLyricIndex }"
              :key="index"
            >
              <div class="original">
                <img
                  :src="iconPaths[index % iconPaths.length]"
                  alt=""
                  class="lyric-icon"
                >
                <span>{{songStore.lyricData.translatedLyric.find(i => i[1] ===
                  songStore.lyricData.lyric[index][1])?.[2] ?
                  item[2] : ''}}</span>
                <img
                  :src="iconPaths[index % iconPaths.length]"
                  alt=""
                  class="lyric-icon"
                >
              </div>
              <div class="translated">
                <img
                  :src="iconPaths[(index + 1) % iconPaths.length]"
                  alt=""
                  class="lyric-icon"
                >
                <span>{{songStore.lyricData.translatedLyric.find(i => i[1] === songStore.lyricData.lyric[index][1])?.[2]
                  ||
                  item[2]}}</span>
                <img
                  :src="iconPaths[(index + 1) % iconPaths.length]"
                  alt=""
                  class="lyric-icon"
                >
              </div>
            </div>
          </template>
        </div>
        <div
          v-else
          class="lyric-empty"
        >
          <img
            src="../../assets/imgs/stardew/emotes/stardew_emote_x.png"
            alt=""
            class="lyric-icon"
          >
          暂无歌词
          <img
            src="../../assets/imgs/stardew/emotes/stardew_emote_uh.gif"
            alt=""
            class="lyric-icon"
          >
        </div>
      </div>
    </div>
  </v-scale-screen>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import overflowText from '../../components/overflowText.vue';
import VScaleScreen from 'v-scale-screen';
import { useSongStore } from '../../stores/song';

const songStore = useSongStore();
// 字体大小
const fontSizeBig = "80px";
const fontSizeMedium = "70px";
const fontSizeSmall = "60px";

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
    scrollPosition = -(index - 0) * 90;
  } else {
    scrollPosition = -(index) * 180;
  }
  // 滚动歌词
  const lyricContainer = document.querySelector('.lyric-box');
  if (lyricContainer) {
    lyricContainer.style.transform = `translateY(${scrollPosition}px)`;
  }
  return index;
});
// 获取表情图片
const icons = import.meta.glob('../../assets/imgs/stardew/emotes/*.(png|gif)', {
  eager: true,
  import: 'default'
});
const iconPaths = Object.values(icons);

onMounted(() => {
  songStore.resetSongData();
});
</script>

<style lang="scss" scoped>
// 文字大小
$font-size-big: v-bind(fontSizeBig);
$font-size-medium: v-bind(fontSizeMedium);
$font-size-small: v-bind(fontSizeSmall);
// 文字颜色
$text-color: #55150c;

.main {
  width: 1700px;
  height: 200px;
  margin: 100px;
  box-sizing: border-box;
  border-image-source: url(../../assets/imgs/stardew/stardew_border.png);
  border-image-slice: 15;
  border-image-width: 30px;
  border-image-outset: 20px;
  background: linear-gradient(to bottom, #fdc979, #eaa865);
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 10px 20px;
  align-items: center;
  font-family: 'hyp', 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;

  .song-info {
    height: 100%;
    min-width: 20%;
    max-width: 35%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    &>div {
      height: 50%;
      display: flex;
      align-items: center;

      .left-img {
        height: auto;
        width: 80px;
        box-sizing: border-box;
        padding: 10px;
        flex-shrink: 0;
      }
    }

    span {
      font-size: $font-size-big;
    }
  }

  .lyric-info {
    height: 100%;
    flex: 1;
    overflow: hidden;

    .lyric-box {
      width: 100%;
      // transition: transform 0.5s ease;
      color: $text-color;

      .lyric-line {
        height: 90px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        font-size: $font-size-medium;
        z-index: 2;
        text-align: center;

        span {
          width: auto;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        &.active {
          font-size: $font-size-big;
          font-weight: bold;
        }
      }

      .lyric-line-translated {
        height: 180px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        font-size: $font-size-medium;
        text-align: center;

        &>div {
          width: 100%;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;

          span {
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }
        }

        &.active {
          opacity: 1;
          font-weight: bold;

          .original {
            font-size: $font-size-medium;
          }

          .translated {
            font-size: $font-size-big;
          }
        }
      }

      .lyric-icon {
        height: 60px;
        width: auto;
        margin-right: 15px;
      }
    }

    .lyric-empty {
      width: 100%;
      height: 100%;
      display: flex;
      gap: 10px;
      justify-content: center;
      align-items: center;
      font-size: $font-size-big;
      font-weight: bold;
      color: $text-color;

      img {
        height: 70px;
        width: auto;
      }
    }
  }
}
</style>