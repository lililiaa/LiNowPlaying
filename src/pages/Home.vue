<template>
  <div class="main">
    <div class="header">
      <img
        src="../assets/music.svg"
        alt="music"
      >
      <span>组件预览</span>
      <span class="time">{{ timeNow }}</span>
    </div>
    <div class="content">
      <div
        class="page-container"
        v-for="(item, index) in pageList"
        :key="index"
      >
        <div class="page-header">
          <img
            src="../assets/html.svg"
            alt="html"
          >
          <span>{{ item.meta.title }}</span>
          <div class="page-header-url">
            <div>
              <span>页面地址</span>
            </div>
            <span>{{ item.url }}</span>
            <div
              class="page-header-url-btn"
              @click="copyUrl(item.url)"
            >
              <el-tooltip
                content="点击复制URL"
                placement="top"
                effect="dark"
              >
                <img
                  v-if="!copied"
                  src="../assets/copy.svg"
                  alt="copy"
                >
                <img
                  v-else
                  src="../assets/success.svg"
                  alt="success"
                >
              </el-tooltip>
            </div>
            <div
              class="page-header-url-btn"
              @click="openNew(item.url)"
            >
              <el-tooltip
                content="点击在新窗口打开"
                placement="top"
                effect="dark"
              >
                <img
                  v-if="!copied"
                  src="../assets/open-in-new.svg"
                  alt="copy"
                >
                <img
                  v-else
                  src="../assets/open-in-new.svg"
                  alt="success"
                >
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="page-content">
          <iframe
            :src="item.url"
            frameborder="0"
          ></iframe>
        </div>
      </div>
      <!-- 回到顶部 -->
      <el-backtop
        :target="'.content'"
        :right="40"
        :bottom="40"
      ></el-backtop>
    </div>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import router from '../router';
import { ElMessage, ElTooltip, ElBacktop } from 'element-plus';

let dateInterval = null;
let routeList = router.getRoutes();
const pageList = routeList.filter(item => item.meta.isPage).map(item => {
  item.url = window.location.origin + item.path;
  return item;
});

const timeNow = ref(new Date().toLocaleString());
// 复制url
const copied = ref(false);
const copyUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    copied.value = true;
    ElMessage.success('复制成功');
    setTimeout(() => (copied.value = false), 2000);
  } catch (error) {
    ElMessage.error('复制失败');
  }
  // const input = document.createElement('input');
  // input.value = url;
  // document.body.appendChild(input);
  // input.select();
  // document.execCommand('copy');
  // document.body.removeChild(input);
  // alert('复制成功');
};
// 新窗口打开
const openNew = (url) => {
  window.open(url, '_blank');
};

onMounted(() => {
  dateInterval = setInterval(() => {
    timeNow.value = new Date().toLocaleString();
  }, 1000);
});

onBeforeUnmount(() => {
  if (dateInterval) clearInterval(dateInterval);
});
</script>
<style lang="less" scoped>
.main {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background-color: #fff;

  .header {
    width: 100%;
    height: 80px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
    box-sizing: border-box;
    padding: 0 30px;
    background: #8360c3;
    background: -webkit-linear-gradient(to right, #2ebf91, #8360c3);
    background: linear-gradient(to right, #2ebf91, #8360c3);
    font-size: 40px;

    img {
      width: 60px;
      height: 60px;
    }

    .time {
      margin-left: auto;
      font-size: 30px;
    }
  }

  .content {
    width: 100%;
    flex: 1;
    box-sizing: border-box;
    padding: 20px;
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr 1fr;
    overflow: auto;
    position: relative;

    .page-container {
      width: 100%;
      height: min-content;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      &:hover {
        box-shadow: 0 6px 10px rgba(0, 0, 0, 0.5);
        transform: translateY(-5px);
      }

      .page-header {
        width: 100%;
        height: 50px;
        box-sizing: border-box;
        padding: 0 10px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
        align-items: center;
        color: #fff;
        background: #BE5869;
        background: -webkit-linear-gradient(to right, #BE5869, #c48791);
        background: linear-gradient(to right, #BE5869, #c48791);

        img {
          width: 35px;
          height: 35px;
        }

        span {
          font-size: 30px;
        }

        .page-header-url {
          height: 35px;
          display: flex;
          margin-left: auto;
          min-width: 200px;
          background-color: #999999aa;
          box-sizing: border-box;
          border: 3px solid #555;
          border-radius: 5px;
          overflow: hidden;
          color: #eee;

          &>div {
            height: 100%;
            background-color: #555;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 20px;
          }

          span {
            font-size: 20px;
            margin: 0 10px;
          }

          .page-header-url-btn {
            height: 100%;
            aspect-ratio: 1/1;
            cursor: pointer;
            user-select: none;

            img {
              width: 20px;
              height: 20px;
              animation: fade 1s ease;
            }

            @keyframes fade {
              0% {
                opacity: 0;
              }

              100% {
                opacity: 1;
              }
            }
          }
        }
      }

      .page-content {
        width: 100%;
        aspect-ratio: 16/9;

        iframe {
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
      }
    }
  }
}
</style>