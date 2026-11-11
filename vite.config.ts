import { defineConfig } from 'vite';

// base './' để game chạy được ở bất kỳ đường dẫn nào (ví dụ GitHub Pages).
export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
