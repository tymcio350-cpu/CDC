// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Helper: jeśli aplikacja jest hostowana w pod‑ścieżce,
 * musimy ustawić `base` na tę ścieżkę.
 *
 * Przykład:
 *   - Dev (localhost):  base = '/'
 *   - Prod (https://example.com/game/): base = '/game/'
 */
const getBasePath = () => {
  // Możesz ustawić zmienną środowiskową VITE_BASE_PATH w .env
  const envBase = import.meta.env.VITE_BASE_PATH as string | undefined;
  if (envBase) return envBase;          // np. '/game/'
  // domyślnie – root, jeśli aplikacja jest pod rootem
  return '/';
};

export default defineConfig(({ mode }) => {
  const base = getBasePath();

  return {
    /** 1️⃣ Pod‑ścieżka w produkcji */
    base,

    /** 2️⃣ Pluginy (React + ewentualnie inne) */
    plugins: [react()],

    /** 3️⃣ Gdzie szukać statycznych plików */
    publicDir: 'public', // domyślnie, ale podajemy dla jasności

    /** 4️⃣ Build – wszystko co potrzebne do produkcji */
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: { main: './index.html' }, // zapewnia poprawny entry
      },
    },

    /** 5️⃣ Serwer dev – nic specjalnego, ale przydatne flagi */
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      open: false,
    },

    /** 6️⃣ Zapewnij Vite, że ma traktować obrazy jako assets */
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.svg'],
  };
});
