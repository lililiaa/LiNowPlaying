<template>
  <v-scale-screen
    width="1920"
    height="1080"
    :box-style="{ backgroundColor: none }"
  >
    <div class="main">
      <!-- 左侧内容 -->
      <div class="left-container">
        <!-- 直播容器 -->
        <div class="video-container">
          <el-icon>
            <VideoCamera />
          </el-icon>
        </div>
        <!-- 歌词容器 -->
        <div class="lyric-container">

        </div>
      </div>
      <!-- 右侧内容 -->
      <div class="right-container">

      </div>
    </div>
  </v-scale-screen>
</template>
<script setup>
import { VideoCamera } from '@element-plus/icons-vue';
import VScaleScreen from 'v-scale-screen';

</script>
<style lang="less" scoped>
.main {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 20px;
  display: flex;
  flex-direction: row;
  gap: 30px;
  background: #373B44;
  background: -webkit-linear-gradient(to right, #4286f4, #373B44);
  background: linear-gradient(to right, #4286f4, #373B44);
  
  .left-container {
    width: 80%;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .video-container {
      background-color: #999;
      width: 100%;
      aspect-ratio: 16 / 9;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 100px;
      box-sizing: border-box;
      border: 3px solid red;
    }

    .lyric-container {
      box-sizing: border-box;
      border: 1px solid red;
      width: 100%;
      flex: 1;
    }
  }

  .right-container {
    flex: 1;
    box-sizing: border-box;
    border: 1px solid green;
  }

}
</style>