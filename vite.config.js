import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import glsl from 'vite-plugin-glsl'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 'swiper/modules': 'swiper/esm/modules',
    },
  },
  base: process.env.VERCEL ? '/' : '/imenmahdi-shop/',
  plugins: [vue(), glsl(), ...(command === 'serve' ? [vueDevTools()] : [])],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/uploads': 'http://127.0.0.1:3001',
    },
    watch: {
      ignored: ['**/.agents/**', '**/.cursor/**', '**/.claude/**'],
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
}))
