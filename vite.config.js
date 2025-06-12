import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'swiper/modules': 'swiper/esm/modules', // فقط در صورت نیاز
    },
  },
  base: '/imenmahdi-shop/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['@vue/eslint-config-prettier'],
  },
  build: {
    rollupOptions: {
      external: ['@vue/eslint-config-prettier'],
    },
  },
})
