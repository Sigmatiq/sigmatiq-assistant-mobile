import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/core': {
        // Point to Core API (configurable via env)
        target: process.env.VITE_CORE_PROXY_TARGET || 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/core/, ''),
      },
      '/api/assistant': {
        // Point to Assistant API (configurable via env)
        target: process.env.VITE_ASSISTANT_PROXY_TARGET || 'http://localhost:8050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/assistant/, '/assistant'),
      },
    },
  },
})
