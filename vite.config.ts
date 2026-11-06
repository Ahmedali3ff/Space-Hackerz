/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@simulation': path.resolve(__dirname, './src/simulation'),
      '@data': path.resolve(__dirname, './src/data'),
      '@ai': path.resolve(__dirname, './src/ai'),
      '@game': path.resolve(__dirname, './src/game'),
      '@store': path.resolve(__dirname, './src/store'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'src/game/**',
    ],
  },
})
