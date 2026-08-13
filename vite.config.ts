import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        trainSvgPrototype: 'train-svg-prototype.html',
      },
    },
  },
})
