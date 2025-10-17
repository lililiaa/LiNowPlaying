<template>
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    width="500"
    draggable
    align-center
  >
    <template #default>
      <div style="display: flex;justify-content: center;">
        <el-color-picker-panel
          v-model="color"
          show-alpha
          :border="true"
          color-format="rgb"
          :predefine="predefineColors"
        />
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
import { ref } from 'vue';
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

const dialogVisible = ref(false);
const color = ref('');
const title = ref('修改颜色');
const key = ref('');
const openDialog = (_title, _color, _key) => {
  color.value = _color;
  title.value = _title;
  key.value = _key;
  dialogVisible.value = true;
}
const handleSubmit = () => {
  localStorage.setItem(key.value, color.value);
  dialogVisible.value = false;
  emit('closed');
};

defineExpose({
  openDialog,
})
</script>

<style lang="less" scoped></style>