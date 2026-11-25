import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/low-code-development-platforms/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
