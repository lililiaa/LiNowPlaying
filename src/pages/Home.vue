<template>
  <div class="main">
    <MyHeader @open-tour="openTour" />
    <div class="content">
      <!-- 左侧内容 -->
      <el-scrollbar
        height="100%"
        style="flex: 1;"
        always
      >
        <div class="content-left">
          <div
            class="page-container"
            v-for="(item, index) in filterdPageList"
            :key="index"
          >
            <div class="page-header">
              <div class="header-left">
                <i class="iconfont icon-yemian"></i>
                <span class="title-span">{{ item.meta.title }}</span>
                <div class="tag-container">
                  <el-tag
                    v-for="tag in item.meta.tags"
                    :type="tag.type"
                    :effect="params.tags.includes(tag.label) ? 'dark' : 'plain'"
                  >{{ tag.label }}</el-tag>
                </div>
              </div>
              <div class="page-header-btn">
                <div @click="refresh(item.url, index)">
                  <el-tooltip
                    content="刷新组件"
                    placement="top"
                    effect="dark"
                  >
                    <img
                      :class="{ 'refresh-rotate': isRotating[index] }"
                      src="../assets/icons/refresh.svg"
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
                      src="../assets/icons/copy.svg"
                      alt="copy"
                    >
                    <img
                      v-else
                      class="fade"
                      src="../assets/icons/success.svg"
                      alt="success"
                    >
                  </el-tooltip>
                </div>
                <div @click.stop="openNow(item)">
                  <el-tooltip
                    content="在当前窗口打开"
                    placement="top"
                    effect="dark"
                  >
                    <img
                      src="../assets/icons/open-in-window.svg"
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
                      src="../assets/icons/open-in-new.svg"
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
        <el-empty
          v-if="filterdPageList.length === 0"
          description="暂无数据"
        />
      </el-scrollbar>
      <!-- 右侧内容 -->
      <div class="content-right-box">
        <el-scrollbar
          height="100%"
          always
        >
          <div class="content-right">
            <div>
              <span class="title">组件筛选</span>
              <div class="form-item">
                <span>组件名称</span>
                <el-input
                  v-model="params.name"
                  placeholder="请输入组件名称"
                  clearable
                />
              </div>
              <div class="form-item">
                <span>组件标签</span>
                <el-select
                  v-model="params.tags"
                  placeholder="请选择组件标签"
                  filterable
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  :max-collapse-tags="3"
                >
                  <el-option
                    v-for="item in tagOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </div>
            </div>
            <div class="divider"></div>
            <div>
              <span class="title">统计信息</span>
              <div>
                <span>组件数量：</span>
                <span>{{ filterdPageList.length }} / {{ pageList.length }}&ensp;个</span>
              </div>
            </div>
            <div class="divider"></div>
            <div class="system-box">
              <span class="title">系统信息</span>
              <div>
                <span>请求间隔：</span>
                <span
                  class="right-text"
                  :title="queryTime"
                >{{ queryTime }}&ensp;ms</span>
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
                  class="right-text"
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
                  class="right-text"
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
              <div>
                <span>背景颜色：</span>
                <div
                  class="color-box"
                  :style="{ '--box-color': backgroundColor }"
                  :title="backgroundColor"
                ></div>
                <el-icon
                  v-if="!isDevelopment"
                  class="edit-btn"
                  title="点击修改背景颜色"
                  @click="editBackgroundColor"
                >
                  <Edit />
                </el-icon>
              </div>
              <div>
                <span>文字颜色：</span>
                <div
                  class="color-box"
                  :style="{ '--box-color': textColor }"
                  :title="textColor"
                ></div>
                <el-icon
                  v-if="!isDevelopment"
                  class="edit-btn"
                  title="点击修改文字颜色"
                  @click="editTextColor"
                >
                  <Edit />
                </el-icon>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>
    <!-- 漫游式引导 -->
    <el-tour
      v-model="tourOpen"
      :target-area-clickable="false"
      @close="handleFinishTour"
    >
      <el-tour-step
        target=".page-header-btn"
        title="歌曲组件"
        description="每个歌曲组件右上角可以进行组件相关操作"
        placement="bottom"
        :prev-button-props="{ children: '上一步' }"
        :next-button-props="{ children: '下一步' }"
      />
      <el-tour-step
        target=".content-right-box"
        title="控制面板"
        description="控制面板包含组件筛选功能、组件信息统计、系统配置信息"
        placement="left"
        :prev-button-props="{ children: '上一步' }"
        :next-button-props="{ children: '下一步' }"
      />
      <el-tour-step
        target=".system-box"
        title="系统信息"
        description="系统信息可以进行编辑操作"
        placement="left"
        :prev-button-props="{ children: '上一步' }"
        :next-button-props="{ children: '下一步' }"
      />
      <el-tour-step
        target=".header-right"
        title="系统操作"
        description="标题栏右侧为系统相关操作"
        placement="bottom-right"
        :prev-button-props="{ children: '上一步' }"
        :next-button-props="{ children: '下一步' }"
      />
      <el-tour-step
        title="右键菜单"
        description="鼠标右键可以进行组件刷新、页面跳转操作"
        :prev-button-props="{ children: '上一步' }"
        :next-button-props="{ children: '完成' }"
      />
      <template #indicators="{ current, total }">
        <span style="color: var(--el-tour-text-color);">{{ current + 1 }} / {{ total }}</span>
      </template>
    </el-tour>
    <!-- 颜色选取dialog -->
    <ColorSelectDialog
      ref="colorSelectRef"
      @closed="handleColorChange"
    />
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import router from '../router';
import { ElMessage, ElTooltip, ElBacktop, ElMessageBox, ElInput, ElTag, ElTour, ElTourStep } from 'element-plus';
import { Edit } from '@element-plus/icons-vue';
import MyHeader from '../components/myHeader.vue';
import ColorSelectDialog from '../components/colorSelectDialog.vue';

const colorSelectRef = ref(null);
const handleColorChange = () => {
  window.location.reload();
};
const isDevelopment = process.env.NODE_ENV === 'development';
// 组件列表
let routeList = router.getRoutes();
const pageList = routeList.filter(item => item.meta.isPage).map(item => {
  item.url = window.location.origin + window.location.pathname + '#' + item.path;
  return item;
});
const tagOptions = [...new Set(pageList.map(i => i.meta.tags).flat(Infinity).map(i => i.label))];
const params = reactive({
  name: '',
  tags: tagOptions,
});
const filterdPageList = computed(() => {
  return pageList.filter(item => item.meta.title.includes(params.name) && item.meta.tags.some(i => params.tags.includes(i.label)));
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
const openNow = async (route) => {
  await router.push(route.path);
  await new Promise(resolve => setTimeout(resolve, 100));
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
        message: '修改成功',
      });
      window.location.reload();
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
// 背景颜色
const backgroundColor = ref(localStorage.getItem('backgroundColor') || 'rgba(0, 0, 0, 1)');
const editBackgroundColor = () => {
  colorSelectRef.value.openDialog('修改背景颜色', backgroundColor.value, 'backgroundColor');
};
// 文字颜色
const textColor = ref(localStorage.getItem('textColor') || 'rgba(255, 255, 255, 1)');
const editTextColor = () => {
  colorSelectRef.value.openDialog('修改文字颜色', textColor.value, 'textColor');
};
// 重新加载所有iframe
const reloadAll = () => {
  let iframes = document.querySelectorAll('iframe');
  iframes.forEach((item) => {
    item.contentWindow.location.reload();
  });
};
// 漫游式引导
const tourOpen = ref(false);
const openTour = () => {
  tourOpen.value = true;
};
const handleFinishTour = () => {
  localStorage.setItem('tour', 'true');
  tourOpen.value = false;
};

onMounted(() => {
  if (localStorage.getItem('tour') !== 'true') {
    openTour();
  }
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
      flex: 1;
      min-height: 100%;
      box-sizing: border-box;
      padding: 20px;
      display: grid;
      gap: 20px;
      grid-template-columns: 1fr 1fr;

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
          position: relative;

          .header-left {
            user-select: none;
            display: flex;
            align-items: center;
            gap: 10px;

            .title-span {
              font-size: 30px;
              white-space: nowrap;
            }

            .tag-container {
              margin-left: 10px;
              display: flex;
              gap: 5px;
            }
          }

          i {
            font-size: 30px;
          }

          img {
            width: 35px;
            height: 35px;
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

    .content-right-box {
      width: 300px;
      height: calc(100% - 20px);
      margin: 10px;
      justify-content: flex-start;
      box-sizing: border-box;
      border-radius: 10px;
      box-shadow: 0 0 10px var(--shadow-color-hover);
      color: var(--text-color);
      font-size: 15px;
      transition: all 0.3s ease;

      .content-right {
        display: flex;
        flex-direction: column;

        // 模块
        &>div:not(.divider) {
          width: 100%;
          box-sizing: border-box;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;

          .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
            border-left: 6px solid #4286f4;
            padding-left: 5px;
          }

          .form-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }

          // 单行内容
          &>div {
            display: flex;
            justify-content: space-between;
            margin: 0 15px;
            position: relative;

            span {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .right-text {
              flex: 1;
              text-align: right;
            }

            .color-box {
              width: 50px;
              height: 15px;
              background-color: var(--box-color);
              box-shadow: 0 0 5px 2px var(--shadow-color);
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
}
</style>