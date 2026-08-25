import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure Vite pre-bundles socket.io-client so Rollup can resolve it during build
  optimizeDeps: {
    include: ['socket.io-client']
  }
})
