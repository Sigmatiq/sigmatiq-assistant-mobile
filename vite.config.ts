import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/core': {
        target: 'http://localhost:8050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/core/, ''),
      },
      '/api/assistant': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/assistant/, ''),
      },
    },
  },
})
