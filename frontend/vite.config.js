import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/chat': { target: 'http://localhost:8080', changeOrigin: true },
      '/profile': { target: 'http://localhost:8080', changeOrigin: true },
      '/cards': { target: 'http://localhost:8080', changeOrigin: true },
      '/dream': { target: 'http://localhost:8080', changeOrigin: true },
      '/schedule': { target: 'http://localhost:8080', changeOrigin: true },
      '/health': { target: 'http://localhost:8080', changeOrigin: true },
      '/models': { target: 'http://localhost:8080', changeOrigin: true },
      '/cost': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
  },
})
