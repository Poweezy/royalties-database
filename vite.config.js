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
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://*; connect-src 'self' https://*;",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    }
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


