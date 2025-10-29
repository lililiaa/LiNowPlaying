<template>
  <el-dialog
    title="修改rain组件配置"
    v-model="dialogVisible"
    width="500"
    draggable
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @closed="handleDialogClose"
  >
    <template #default>
      <el-form
        :model="form"
        :rules="rules"
        label-width="auto"
        label-position="left"
        label-suffix="："
      >
        <el-form-item
          label="是否有雨"
          prop="isRain"
        >
          <el-switch
            v-model="form.isRain"
            :active-value="true"
            active-text="有雨"
            :active-action-icon="Pouring"
            :inactive-value="false"
            inactive-text="无雨"
            :inactive-action-icon="Sunny"
          >
          </el-switch>
        </el-form-item>
        <el-form-item
          label="雨滴数量"
          prop="count"
        >
          <el-slider
            v-model="form.amount"
            :min="1"
            :max="1000"
            :step="1"
            show-input
            size="small"
          >
          </el-slider>
        </el-form-item>
        <el-form-item
          label="雨滴角度"
          prop="count"
        >
          <el-slider
            v-model="form.angle"
            :min="-45"
            :max="45"
            :step="0.1"
            show-input
            size="small"
          >
          </el-slider>
        </el-form-item>
        <el-form-item
          label="雨滴速度"
          prop="count"
        >
          <el-slider
            v-model="form.speed"
            :min="1"
            :max="30"
            :step="0.1"
            show-input
            size="small"
          >
          </el-slider>
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
import { Pouring, Sunny } from '@element-plus/icons-vue';
import { reactive, ref } from 'vue';

const emit = defineEmits(['closed']);

const dialogVisible = ref(false);
const form = ref(JSON.parse(localStorage.getItem('rainConfig')) || {});
const rules = reactive({

});

const openDialog = () => {
  dialogVisible.value = true;
};
const handleDialogClose = () => {
  dialogVisible.value = false;
  form.value = JSON.parse(localStorage.getItem('rainConfig')) || {};
};
const handleSubmit = () => {
  localStorage.setItem('rainConfig', JSON.stringify(form.value));
  dialogVisible.value = false;
  emit('closed');
};

defineExpose({
  openDialog,
});
</script>

<style lang="scss" scoped></style>