<template>
  <div class="main">
    <MyHeader />
    <div class="content">
      <!-- 左侧内容 -->
      <div class="content-left">
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
                  content="复制URL"
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
              <div @click="openNow(item)">
                <el-tooltip
                  content="在当前窗口打开"
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
                  content="在新窗口打开"
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
              loading="lazy"
            ></iframe>
          </div>
        </div>
        <!-- 回到顶部 -->
        <el-backtop
          :target="'.content-left'"
          :visibility-height="100"
          :right="350"
          :bottom="40"
          class="back-top"
        />
      </div>
      <!-- 右侧内容 -->
      <div class="content-right">
        <div>
          <span class="title">统计信息</span>
          <div>
            <span>组件数量：</span>
            <span>{{ pageList.length }} 个</span>
          </div>
        </div>
        <div class="divider"></div>
        <div>
          <span class="title">系统信息</span>
          <div>
            <span>请求间隔：</span>
            <span
              class="query-time"
              :title="queryTime"
            >{{ queryTime }} ms</span>
            <el-icon
              class="edit-btn"
              title="点击修改请求间隔"
              @click="editQueryTime"
            >
              <Edit />
            </el-icon>
          </div>
          <div>
            <span>游戏名称：</span>
            <span
              class="query-time"
              :title="gameName"
            >{{ gameName }}</span>
            <el-icon
              class="edit-btn"
              title="点击修改游戏名称"
              @click="editGameName"
            >
              <Edit />
            </el-icon>
          </div>
          <div>
            <span>电脑配置：</span>
            <span
              class="query-time"
              :title="PCConfig"
            >{{ PCConfig }}</span>
            <el-icon
              class="edit-btn"
              title="点击修改电脑配置"
              @click="editPCConfig"
            >
              <Edit />
            </el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import router from '../router';
import { ElMessage, ElTooltip, ElBacktop, ElMessageBox } from 'element-plus';
import { Edit } from '@element-plus/icons-vue';
import MyHeader from '../components/myHeader.vue';

let routeList = router.getRoutes();
const pageList = routeList.filter(item => item.meta.isPage).map(item => {
  item.url = window.location.origin + item.path;
  return item;
});

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
const openNow = (route) => {
  router.push(route.path);
};
// 新窗口打开
const openNew = (url) => {
  window.open(url, '_blank');
};

// 请求间隔
const queryTime = ref(localStorage.getItem('queryTime') || '-');
const editQueryTime = () => {
  ElMessageBox.prompt('请输入请求间隔（单位：ms）', '修改请求间隔', {
    type: 'info',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: localStorage.getItem('queryTime') || '-',
    inputPattern: /^[0-9]+$/,
    inputErrorMessage: '请输入数字',
    draggable: true,
  })
    .then(({ value }) => {
      localStorage.setItem('queryTime', value);
      queryTime.value = value;
      ElMessage({
        type: 'success',
        message: `修改成功，当前请求间隔为 ${value}ms`,
      });
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消修改',
      })
    })
    .finally(() => {
      queryTime.value = localStorage.getItem('queryTime') || '-';
    });
};
// 游戏名称
const gameName = ref(JSON.parse(localStorage.getItem('extraInfo'))[0][0]);
const editGameName = () => {
  let extraInfo = JSON.parse(localStorage.getItem('extraInfo'));
  ElMessageBox.prompt('请输入游戏名称', '修改游戏名称', {
    type: 'info',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: extraInfo[0][0],
    // inputValidator: (value) => {
    //   if (value === "") return '请输入游戏名称';
    //   return true;
    // },
    draggable: true,
  })
    .then(({ value }) => {
      if (value !== '') {
        extraInfo[0][0] = value;
      } else {
        extraInfo[0].length = 0;
      }
      localStorage.setItem('extraInfo', JSON.stringify(extraInfo));
      ElMessage({
        type: 'success',
        message: '修改成功',
      });
      reloadAll();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消修改',
      })
    })
    .finally(() => {
      gameName.value = JSON.parse(localStorage.getItem('extraInfo'))[0][0];
    });
};
// 配置信息
const PCConfig = ref(JSON.parse(localStorage.getItem('extraInfo'))[1].join(' '));
const editPCConfig = () => {
  let extraInfo = JSON.parse(localStorage.getItem('extraInfo'));
  ElMessageBox.prompt('请输入配置信息(以空格分隔)', '修改配置信息', {
    type: 'info',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: JSON.parse(localStorage.getItem('extraInfo'))[1].join(' '),
    // inputValidator: (value) => {
    //   if (value === "") return '请输入配置信息';
    //   return true;
    // },
    draggable: true,
  })
    .then(({ value }) => {
      if (value !== '') {
        extraInfo[1] = value.split(' ');
      } else {
        extraInfo[1].length = 0;
      }
      localStorage.setItem('extraInfo', JSON.stringify(extraInfo));
      ElMessage({
        type: 'success',
        message: '修改成功',
      });
      reloadAll();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消修改',
      })
    })
    .finally(() => {
      PCConfig.value = JSON.parse(localStorage.getItem('extraInfo'))[1].join(' ');
    });
};
// 重新加载所有iframe
const reloadAll = () => {
  let iframes = document.querySelectorAll('iframe');
  iframes.forEach((item) => {
    item.contentWindow.location.reload();
  });
};

onMounted(() => {
  pageList.forEach(item => {
    copied.value.push(false);
    isRotating.value.push(false);
  });
});
</script>
<style lang="less" scoped>
.main {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background-color 0.3s ease;
  background-color: var(--background-color);

  .content {
    height: calc(100% - 70px);
    display: flex;
    flex-direction: row;

    .content-left {
      height: 100%;
      flex: 1;
      box-sizing: border-box;
      padding: 20px;
      display: grid;
      gap: 20px;
      grid-template-columns: 1fr 1fr;
      overflow: auto;

      /* 滚动条轨道 */
      ::-webkit-scrollbar-track {
        background-color: transparent;
      }

      scrollbar-color: #888 transparent;

      .page-container {
        width: 100%;
        height: min-content;
        border-radius: 10px;
        box-shadow: 0 4px 10px var(--shadow-color);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        &:hover {
          box-shadow: 0 6px 10px var(--shadow-color-hover);
          // transform: translateY(-5px);
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
          position: relative;

          &>div:nth-child(1) {
            transition: all 0.3s ease;
            user-select: none;
            transform-origin: 0% 50%;
          }

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
            white-space: nowrap;
          }

          &:hover {
            &>div:nth-child(1) {
              opacity: 0.4;
              filter: blur(2px);
              transform: scale(0.9);
            }

            .page-header-url {
              opacity: 1;
              transform: scale(1);
            }
          }

          .page-header-url {
            position: absolute;
            margin-right: auto;
            margin-left: 10px;
            font-size: 20px;
            opacity: 0;
            transform: scale(0.9);
            transform-origin: 0% 50%;
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
            position: relative;
            pointer-events: none;

            &::before {
              content: "";
              position: absolute;
              top: 0;
              left: 0;
              height: inherit;
              width: inherit;
              z-index: 2;
              pointer-events: auto;
            }
          }
        }
      }

      .back-top {
        background-color: var(--background-color);
        box-shadow: 0 0 6px var(--shadow-color-hover);
      }
    }

    .content-right {
      width: 300px;
      height: calc(100% - 20px);
      margin: 10px;
      overflow: auto;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      box-sizing: border-box;
      border-radius: 10px;
      box-shadow: 0 0 10px var(--shadow-color-hover);
      color: var(--text-color);
      font-size: 18px;
      transition: all 0.3s ease;

      /* 滚动条轨道 */
      ::-webkit-scrollbar-track {
        background-color: transparent;
      }

      scrollbar-color: #888 transparent;

      // 模块
      &>div:not(.divider) {
        width: 100%;
        box-sizing: border-box;
        padding: 10px;
        display: flex;
        flex-direction: column;

        .title {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 10px;
          border-left: 6px solid #4286f4;
          padding-left: 5px;
        }

        // 单行内容
        &>div {
          display: flex;
          justify-content: space-between;
          margin: 5px 15px;
          position: relative;

          span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .query-time {
            flex: 1;
            text-align: right;
          }

          .edit-btn {
            position: absolute;
            opacity: 0;
            right: -20px;
            top: 0;
            transition: all 0.3s ease;
            user-select: none;
            cursor: pointer;
          }

          &:hover {
            .edit-btn {
              opacity: 1;
            }
          }
        }
      }

      .divider {
        width: 100%;
        height: 1px;
        background-color: var(--shadow-color);
      }
    }
  }
}
</style>