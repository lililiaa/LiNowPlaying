<template>
  <div class="main">
    <div class="header">
      <img
        src="../assets/music.svg"
        alt="music"
      >
      <span>组件预览</span>
      <div class="header-right">
        <span>{{ timeNow }}</span>
        <img
          src="../assets/github.svg"
          alt="github"
          title="github"
          @click="openGithub"
        >
      </div>
    </div>
    <div class="content">
      <div
        class="page-container"
        v-for="(item, index) in pageList"
        :key="index"
      >
        <div class="page-header">
          <div>
            <i class="iconfont icon-yemian"></i>
            <span>{{ item.meta.title }}</span>
          </div>
          <span class="page-header-url">{{ item.url }}</span>
          <div class="page-header-btn">
            <div @click="refresh(item.url, index)">
              <el-tooltip
                content="刷新组件"
                placement="top"
                effect="dark"
              >
                <img
                  :class="{ 'refresh-rotate': isRotating[index] }"
                  src="../assets/refresh.svg"
                  alt="refresh"
                >
              </el-tooltip>
            </div>
            <div @click="copyUrl(item.url, index)">
              <el-tooltip
                content="点击复制URL"
                placement="top"
                effect="dark"
              >
                <img
                  v-if="!copied[index]"
                  class="fade"
                  src="../assets/copy.svg"
                  alt="copy"
                >
                <img
                  v-else
                  class="fade"
                  src="../assets/success.svg"
                  alt="success"
                >
              </el-tooltip>
            </div>
            <div @click="openNow(item.url)">
              <el-tooltip
                content="点击在当前窗口打开"
                placement="top"
                effect="dark"
              >
                <img
                  src="../assets/open-in-window.svg"
                  alt="open-in-window"
                >
              </el-tooltip>
            </div>
            <div @click="openNew(item.url)">
              <el-tooltip
                content="点击在新窗口打开"
                placement="top"
                effect="dark"
              >
                <img
                  src="../assets/open-in-new.svg"
                  alt="open-in-new"
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
// 刷新组件
const isRotating = ref([]);
const refresh = (url, index) => {
  isRotating.value[index] = true;

  const iframes = document.querySelectorAll('iframe');
  if (iframes[index]) {
    iframes[index].contentWindow.location.reload();
  }

  setTimeout(() => (isRotating.value[index] = false), 1000);
};
// 复制url
const copied = ref([]);
const copyUrl = async (url, index) => {
  try {
    await navigator.clipboard.writeText(url);
    copied.value[index] = true;
    ElMessage.success('复制成功');
    setTimeout(() => (copied.value[index] = false), 2000);
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
// 当前窗口打开
const openNow = (url) => {
  window.open(url, '_self');
};
// 新窗口打开
const openNew = (url) => {
  window.open(url, '_blank');
};
// 打开github
const openGithub = () => {
  window.open('https://github.com/lililiaa/myNowPlaying', '_blank');
};

onMounted(() => {
  dateInterval = setInterval(() => {
    timeNow.value = new Date().toLocaleString();
  }, 1000);
  pageList.forEach(item => {
    copied.value.push(false);
    isRotating.value.push(false);
  });
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
  background-color: #e9e9e9;

  .header {
    width: 100%;
    height: 70px;
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
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);

    img {
      width: 55px;
      height: 55px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-left: auto;
      font-size: 25px;
      user-select: none;

      img {
        width: 35px;
        height: 35px;
        cursor: pointer;
      }
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
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        align-items: center;
        color: #fff;
        background: #BE5869;
        background: -webkit-linear-gradient(to right, #BE5869, #c48791);
        background: linear-gradient(to right, #BE5869, #c48791);

        i {
          font-size: 30px;
          margin-right: 10px;
        }

        img {
          width: 35px;
          height: 35px;
        }

        span {
          font-size: 30px;
        }

        &:hover {
          .page-header-url {
            opacity: 1;
          }
        }

        .page-header-url {
          margin-right: auto;
          margin-left: 10px;
          font-size: 20px;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .page-header-btn {
          height: 35px;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          border-radius: 5px;
          overflow: hidden;
          color: #eee;
          gap: 10px;

          &>div {
            height: 28px;
            aspect-ratio: 1/1;
            cursor: pointer;
            user-select: none;

            img {
              width: 100%;
              height: 100%;
            }

            .fade {
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

            .refresh-rotate {
              animation: refresh-rotate 1s ease-out;
            }

            @keyframes refresh-rotate {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
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