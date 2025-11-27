import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'
import { createPinia } from 'pinia'
// import 'amfe-flexible'

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(ContextMenu);
app.use(pinia);
app.mount('#app');
