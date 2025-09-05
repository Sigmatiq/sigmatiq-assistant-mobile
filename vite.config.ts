import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/core': {
        target: 'http://localhost:8050',  // Core API (running via Assistant)
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/core/, ''),
      },
      '/api/assistant': {
        target: 'http://localhost:8050',  // Assistant API on same port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/assistant/, '/assistant'),
      },
    },
  },
})
