import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          // Material UI components in separate chunk
          'mui': [
            '@mui/material',
            '@mui/icons-material',
            '@mui/x-charts',
          ],
          // Chart libraries
          'charts': [
            'recharts',
            '@mui/x-charts/LineChart',
            '@mui/x-charts/BarChart',
          ],
        },
      },
    },
  },
})
