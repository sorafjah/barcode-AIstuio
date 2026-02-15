import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Allow app to run in subdirectories
  build: {
    outDir: 'dist',
  }
});