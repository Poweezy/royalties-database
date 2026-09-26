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
      // CSP is intentionally NOT set here: the dev-server header previously
      // diverged from the page's meta CSP (blocked unpkg.com/cdnjs.cloudflare.com
      // scripts, which broke Leaflet and killed the entire app boot — see
      // APPLICATION_REVIEW.md §8). royalties.html's meta CSP is the single
      // source of truth and is stricter.
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
  // M4: 'process.env' injection removed — nothing in the browser bundle reads
  // process.env (config.js uses window.__ENV__), and exposing the entire
  // process.env object to client code leaks all environment variables.
});


