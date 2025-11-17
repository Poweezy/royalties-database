/**
 * Vite Configuration
 * Build configuration for Mining Royalties Manager
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: './',
  server: {
    port: 5173,
    open: true,
    cors: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Enable source maps in development only
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'royalties.html'),
      },
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-charts': ['chart.js'],
          'vendor-leaflet': ['leaflet'],
          'vendor-utils': ['xlsx', 'jspdf', 'html2canvas'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'chart.js',
      'chartjs-adapter-date-fns',
      'leaflet',
      'leaflet.markercluster',
      'xlsx',
      'jspdf',
      'html2canvas',
    ],
  },
  define: {
    // Inject environment variables at build time
    'process.env': process.env,
  },
});


