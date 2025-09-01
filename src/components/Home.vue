<template>
  <div class="song-container">
    <img
      id="cover"
      :src="songData?.track.cover"
      alt="cover"
    />
    <div class="basic-info">
      <div>
        <span :title="songData?.track.title">{{ songData?.track.title }}</span>
        <span :title="songData?.track.author">{{ songData?.track.author }}</span>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="128"
        height="128"
        viewBox="0 0 24 24"
        :style="{ 'animation-play-state': songData?.player.isPaused ? 'paused' : 'running' }"
      >
        <path
          fill="#ffffff"
          d="M16 9h-3v5.5a2.5 2.5 0 0 1-2.5 2.5A2.5 2.5 0 0 1 8 14.5a2.5 2.5 0 0 1 2.5-2.5c.57 0 1.08.19 1.5.5V7h4zm-4-7a10 10 0 0 1 10 10a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8a8 8 0 0 0-8-8"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const songData = ref();
let intervalId = null;

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
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.box() {
  border-radius: 20px;
  box-shadow: 0 5px 10px 3px rgba(0, 0, 0, 0.4);
}

.song-container {
  min-width: 40vw;
  max-width: 80vw;
  height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  box-shadow: 0 0 0 2px #000;
  color: #fff;

  img {
    width: 200px;
    height: 200px;
    .box();
  }

  .basic-info {
    .box();
    width: 200px;
    box-sizing: border-box;
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #000;

    &>div {
      width: calc(100% - 50px);
      display: flex;
      flex-direction: column;

      span {
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      span:nth-child(1) {
        font-size: 18px;
        font-weight: bold;
      }

      span:nth-child(2) {
        font-size: 16px;
        color: #eee;
      }
    }

    svg {
      width: 45px;
      height: 45px;
      animation: rotate 3s linear infinite;
      animation-play-state: var(--animation-play-state);
    }
  }
}
</style>