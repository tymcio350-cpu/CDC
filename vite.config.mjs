// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ustaw base na nazwę repo w GitHub Pages: "/REPO_NAME/"
// W Twoim przypadku: "/CDC/"
export default defineConfig({
  base: '/CDC/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
