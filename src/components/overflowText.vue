<template>
  <div class="marquee">
    <div class="marquee-warp">
      <div class="marquee-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'overflowText',
  props: {
    // 文字颜色
    color: {
      type: String,
      default: 'rgba(255, 255, 255, 1)'
    },
    // 文字内容
    text: {
      type: String,
      default: ''
    },
    // 文字大小
    fontSize: {
      type: String,
      default: '35px'
    },
    // 是否加粗
    isBold: {
      type: String,
      default: 'normal'
    },
  }
});
</script>
<style lang="less" scoped>
// 背景过渡时间
@bg-transition-time: 2s;
// 文字滚动时间
@text-transition-time: 10s;

@keyframes marquee-wrap {

  0%,
  30% {
    transform: translateX(0);
  }

  70%,
  100% {
    transform: translateX(100%);
  }
}

@keyframes marquee-content {

  0%,
  30% {
    transform: translateX(0);
  }

  70%,
  100% {
    transform: translateX(-100%);
  }
}

.marquee {
  overflow: hidden;

  .marquee-warp {
    width: 100%;
    animation: marquee-wrap @text-transition-time linear infinite;

    .marquee-content {
      float: left;
      white-space: nowrap;
      min-width: 100%;
      animation: marquee-content @text-transition-time infinite linear;

      font-size: v-bind(fontSize);
      font-weight: v-bind(isBold);
      color: v-bind(color);
      transition: color @bg-transition-time ease;
    }
  }
}
</style>