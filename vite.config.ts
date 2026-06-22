import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const isSandbox =
  !!process.env.CSB ||
  !!process.env.CODESANDBOX_SSE ||
  !!process.env.CODESANDBOX_HOST

export default defineConfig({
  // Required for GitHub Pages (https://user.github.io/repo-name/)
  base: process.env.GITHUB_ACTIONS ? '/giga-corp-org-chart/' : '/',
  plugins: [vue(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: isSandbox ? false : undefined,
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
})
