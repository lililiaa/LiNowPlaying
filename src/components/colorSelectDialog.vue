<template>
  <el-dialog
    title="修改颜色搭配"
    v-model="dialogVisible"
    width="800"
    draggable
    align-center
    destroy-on-close
    @closed="handleClose"
  >
    <template #default>
      <div class="container">
        <div class="preview-container">
          <div
            class="preview"
            :style="{ backgroundColor: colors.backgroundColor, color: colors.textColor, filter: `drop-shadow(0 4px 10px ${colors.shadowColor})` }"
          >
            <span>预览文本</span>
          </div>
        </div>
        <div>
          <el-radio-group v-model="key">
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
          />
        </div>
      </div>
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
import { reactive, ref, watch } from 'vue';
import { ElColorPickerPanel } from 'element-plus';

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

const colors = reactive({
  backgroundColor: localStorage.getItem('backgroundColor') || 'rgba(0, 0, 0, 1)',
  textColor: localStorage.getItem('textColor') || 'rgba(255, 255, 255, 1)',
  shadowColor: localStorage.getItem('shadowColor') || 'rgba(255, 255, 255, 1)',
});
const key = ref('backgroundColor');

const dialogVisible = ref(false);
const openDialog = () => {
  dialogVisible.value = true;
}
const handleSubmit = () => {
  Object.keys(colors).forEach((key) => {
    localStorage.setItem(key, colors[key]);
  });
  dialogVisible.value = false;
  emit('closed');
};
const handleClose = () => {
  key.value = 'backgroundColor';
  colors.backgroundColor = localStorage.getItem('backgroundColor') || 'rgba(0, 0, 0, 1)';
  colors.textColor = localStorage.getItem('textColor') || 'rgba(255, 255, 255, 1)';
  colors.shadowColor = localStorage.getItem('shadowColor') || 'rgba(255, 255, 255, 1)';
};

defineExpose({
  openDialog,
})
</script>

<style lang="scss" scoped>
.container {
  height: 300px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .preview-container {
    flex: 1;
    height: 100%;
    display: flex;

    .preview {
      margin: auto;
      width: 60%;
      height: 50%;
      display: flex;
      border-radius: 10px;

      span {
        margin: auto;
        font-size: 40px;
      }
    }
  }
}
</style>