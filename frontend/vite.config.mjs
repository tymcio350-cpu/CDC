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
    open: true,
    // Wyłącz cache w trybie deweloperskim
    // Nagłówek działa dla większości przeglądarek podczas `npm run dev`.
    headers: {
      'Cache-Control': 'no-store'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    // manifest pomaga narzędziom/deployom oraz przy debugowaniu produkcji
    manifest: true,
    // jawne nazwy z hashem -> wymusi pobranie nowych plików po deployu
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})
