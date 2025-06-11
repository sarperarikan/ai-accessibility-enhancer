// Content Script için ayrı Vite config (IIFE bundle)
// WCAG 2.2-AA uyumlu, import hatası çözümü
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/content.ts')
      },
      output: {
        format: 'iife',
        entryFileNames: 'src/content/content.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});