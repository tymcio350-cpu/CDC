import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // Wczytaj zmienne z .env (np. VITE_BASE)
  const env = loadEnv(mode, process.cwd(), '')

  // 1) Jeśli jawnie ustawisz VITE_BASE w .env.production, użyj jej (np. "/CDC/")
  // 2) Jeśli build leci przez GitHub Actions, wykryj repo z GITHUB_REPOSITORY ("user/CDC" -> "/CDC/")
  // 3) Lokalnie ustaw "/" dla wygody dev
  const ghRepo = process.env.GITHUB_REPOSITORY // np. "michal/CDC"
  const autoBase = ghRepo ? /${ghRepo.split('/')[1]}/ : '/'
  const base =
    command === 'build'
      ? (env.VITE_BASE && env.VITE_BASE.trim()) || autoBase
      : '/'

  return {
    base,
    plugins: [react()],
    resolve: {
      alias: { '@': '/src' }
    },
    server: {
      port: 5173,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  }
})
