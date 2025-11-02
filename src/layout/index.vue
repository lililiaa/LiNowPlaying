<template>
  <div class="main">
    <MyHeader />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>
<script>
import MyHeader from '../components/common/myHeader.vue';


</script>
<style lang="scss" scoped>
.main {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    height: 0;
  }
}
</style>