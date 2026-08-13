import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        'train-svg-prototype': resolve(import.meta.dirname, 'train-svg-prototype.html'),
      },
    },
  },
})
