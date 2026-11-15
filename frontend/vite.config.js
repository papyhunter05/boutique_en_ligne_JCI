import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import http from 'node:http'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // l'URL de php artisan serve
        changeOrigin: true,
      },
    },
  },
})
