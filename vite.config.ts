import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure MSW is included in production build since this is a front-end only app
  optimizeDeps: {
    include: ['msw'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'msw-handlers': ['./src/mocks/handlers', './src/mocks/browser'],
        },
      },
    },
  },
})
