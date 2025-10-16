import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'

const repo = "myNowPlaying";

// https://vite.dev/config/
export default defineConfig({
  // base: process.env.NODE_ENV === 'production' ? `/${repo}/` : '/',
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  server: {
    proxy: {
      '/image': {
        target: 'https://y.qq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/image/, '')
      }
    }
  }
})
