import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Cyber_Dino_Clicker/',  // <<< tu wpisz dokładnie nazwę repozytorium z GitHuba
  server: {
    port: 5173,
    open: true
  }
})
