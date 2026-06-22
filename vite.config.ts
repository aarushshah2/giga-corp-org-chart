import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const isSandbox =
  !!process.env.CSB ||
  !!process.env.CODESANDBOX_SSE ||
  !!process.env.CODESANDBOX_HOST

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // CodeSandbox proxy chokes on Vite HMR websocket traffic
    hmr: isSandbox ? false : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
  },
})
