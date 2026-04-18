import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router-dom')) return 'router';
          if (id.includes('react-dom') || id.includes('react/jsx-runtime') || id.includes('/react/')) return 'react';
          if (id.includes('@react-three') || id.includes('/three') || id.includes('maath')) return 'three';
          if (id.includes('framer-motion') || id.includes('gsap') || id.includes('lenis')) return 'motion';
          if (id.includes('firebase')) return 'firebase';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('canvas-confetti')) return 'effects';
          if (id.includes('@vercel/analytics')) return 'analytics';
        },
      },
    },
  },
})
