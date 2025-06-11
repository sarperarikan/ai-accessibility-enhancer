import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

// Custom plugin to copy manifest and icons
const copyExtensionFiles = () => ({
  name: 'copy-extension-files',
  writeBundle() {
    // Copy manifest.json
    copyFileSync('public/manifest.json', 'dist/manifest.json');
    
    // Create icons directory if it doesn't exist
    if (!existsSync('dist/icons')) {
      mkdirSync('dist/icons', { recursive: true });
    }
    
    // Copy all icon files
    ['icon-16.png', 'icon-32.png', 'icon-48.png', 'icon-128.png'].forEach(icon => {
      copyFileSync(`public/icons/${icon}`, `dist/icons/${icon}`);
    });
    
    console.log('✅ Extension files copied to dist/');
  }
});

export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        background: resolve(__dirname, 'src/background/background.ts')
      },
      output: {
        format: 'es',
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'src/background/background.js';
          }
          if (chunkInfo.name === 'popup') {
            return 'src/popup/popup.js';
          }
          return `src/${chunkInfo.name}/[name].js`;
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep icons in icons/ directory
          if (assetInfo.name?.endsWith('.png') && assetInfo.name?.includes('icon')) {
            return 'icons/[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  esbuild: {
    target: 'esnext',
    legalComments: 'none'
  }
});
