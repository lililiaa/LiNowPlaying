<template>
  <v-scale-screen
    :width="1900"
    :height="1200"
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
        
      </div>
      <div class="curb-container"></div>
    </div>
  </v-scale-screen>
</template>

<script setup>
import overflowText from '../../components/overflowText.vue';
import VScaleScreen from 'v-scale-screen';
import { useSongStore } from '../../stores/song';
import { onMounted, ref } from 'vue';

const songStore = useSongStore();

// 主体颜色
const themeColor = ref(localStorage.getItem('backgroundColor') || 'rgba(0, 0, 0, 0.8)');
const textColor = ref(localStorage.getItem('textColor') || 'rgba(255, 255, 255, 1)');
const shadowColor = ref(localStorage.getItem('shadowColor') || 'rgba(255, 255, 255, 1)');
const themeColorList = ref([]);

// 雨滴倾斜角度
const rainDropAngle = 30;
// 雨滴数量
const rainDropCount = 30;
// 雨滴下落速度
const rainDropSpeed = 4;

onMounted(() => {

});
</script>

<style lang="scss" scoped>
.main {
  width: 1700px;
  height: 1000px;
  margin: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .surface-container {
    position: relative;
    flex: 1;
  }

  .curb-container {
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: space-around;
    box-sizing: border-box;
    border-top: 5px dashed var(--theme-color);
    mask-image: linear-gradient(to right, rgba(0, 0, 0, 0), #000 20%, #000 80%, rgba(0, 0, 0, 0));
  }
}
</style>