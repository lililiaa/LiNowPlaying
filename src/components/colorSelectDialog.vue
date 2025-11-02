<template>
  <el-dialog
    title="修改颜色搭配"
    v-model="dialogVisible"
    width="800"
    draggable
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleClose"
  >
    <template #default>
      <div class="preview-container">
        <img
          v-show="songStore.songData?.track?.cover"
          id="cover"
          class="cover"
          :src="songStore.songData?.track?.cover"
          alt="封面"
          :style="{ filter: `drop-shadow(0 4px 10px ${colors2.shadowColor})` }"
        />
        <div
          class="preview"
          :style="{ backgroundColor: colors2.backgroundColor, color: colors2.textColor, filter: `drop-shadow(0 4px 10px ${colors2.shadowColor})` }"
        >
          <span>预览文本</span>
        </div>
      </div>
      <el-form
        label-width="auto"
        label-position="left"
        label-suffix="："
      >
        <el-form-item label="取色方案">
          <el-radio-group v-model="isCustomColor">
            <el-radio :value="false">自适应配色(实验性功能)</el-radio>
            <el-radio :value="true">自定义配色</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="颜色搭配">
          <div>
            <el-radio-group
              v-model="key"
              :disabled="!isCustomColor"
            >
              <el-radio value="backgroundColor">背景颜色</el-radio>
              <el-radio value="textColor">文字颜色</el-radio>
              <el-radio value="shadowColor">阴影颜色</el-radio>
            </el-radio-group>
            <el-color-picker-panel
              v-model="colors[key]"
              show-alpha
              :border="true"
              color-format="rgb"
              :predefine="predefineColors"
              :disabled="!isCustomColor"
            />
          </div>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <span>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
        >确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { ElColorPickerPanel } from 'element-plus';
import { useSongStore } from '../stores/song';
import ColorThief from 'colorthief';
import { getCoverUrl } from '../utils/cover';

const songStore = useSongStore();
// 预定义颜色
const predefineColors = [
  "rgba(255 , 0, 0, 1)",
  "rgba(255 , 165, 0, 1)",
  "rgba(255 , 255, 0, 1)",
  "rgba(0 , 255, 0, 1)",
  "rgba(0 , 127, 255, 1)",
  "rgba(0, 0, 255, 1)",
  "rgba(139, 0, 255, 1)",
];

const emit = defineEmits(['closed']);

const isCustomColor = ref(JSON.parse(localStorage.getItem('isCustomColor')) || false);
const colors = reactive({
  backgroundColor: localStorage.getItem('backgroundColor') || 'rgba(0, 0, 0, 1)',
  textColor: localStorage.getItem('textColor') || 'rgba(255, 255, 255, 1)',
  shadowColor: localStorage.getItem('shadowColor') || 'rgba(255, 255, 255, 1)',
});
const imgColors = ref({
  backgroundColor: 'rgba(0, 0, 0, 1)',
  textColor: 'rgba(255, 255, 255, 1)',
  shadowColor: 'rgba(255, 255, 255, 1)',
});
const colors2 = computed(() => {
  if (isCustomColor.value) {
    // 自定义配色
    return colors;
  } else {
    // 自适应配色
    return imgColors.value;
  }
});
const key = ref('backgroundColor');

const dialogVisible = ref(false);
const openDialog = () => {
  dialogVisible.value = true;
  getImgColor();
};
// 提取图片主题色
const getImgColor = () => {
  const colorThief = new ColorThief();
  const img = new Image();
  img.src = getCoverUrl(songStore.songData?.track?.cover);
  img.onload = function () {
    const color = colorThief.getColor(img);
    imgColors.value.backgroundColor = `rgba(${color.join(',')}, 1)`;
    imgColors.value.textColor = `rgba(${color.map(i => 255 - i).join(',')}, 1)`;
    imgColors.value.shadowColor = `rgba(${color.map(i => 255 - i).join(',')}, 1)`;
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
const handleSubmit = () => {
  localStorage.setItem('isCustomColor', isCustomColor.value);
  Object.keys(colors).forEach((key) => {
    localStorage.setItem(key, colors[key]);
  });
  dialogVisible.value = false;
  emit('closed');
};
const handleClose = () => {
  isCustomColor.value = JSON.parse(localStorage.getItem('isCustomColor')) || false;
  key.value = 'backgroundColor';
  colors.backgroundColor = localStorage.getItem('backgroundColor') || 'rgba(0, 0, 0, 1)';
  colors.textColor = localStorage.getItem('textColor') || 'rgba(255, 255, 255, 1)';
  colors.shadowColor = localStorage.getItem('shadowColor') || 'rgba(255, 255, 255, 1)';
};

defineExpose({
  openDialog,
});
</script>

<style lang="scss" scoped>
.preview-container {
  flex: 1;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;

  .cover {
    height: 130px;
    width: 130px;
    aspect-ratio: 1 / 1;
    border-radius: 10px;
  }

  .preview {
    width: 300px;
    height: 130px;
    display: flex;
    border-radius: 10px;

    span {
      margin: auto;
      font-size: 40px;
    }
  }
}
</style>