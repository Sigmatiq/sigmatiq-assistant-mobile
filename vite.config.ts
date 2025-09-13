import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const coreTarget = env.VITE_CORE_PROXY_TARGET || 'http://localhost:8001'
  const assistantTarget = env.VITE_ASSISTANT_PROXY_TARGET || 'http://localhost:8050'
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/core': {
          target: coreTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/core/, ''),
        },
        '/api/assistant': {
          target: assistantTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/assistant/, '/assistant'),
        },
      },
    },
  }
})
