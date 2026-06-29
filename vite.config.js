import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

function getLocalIP() {
  try {
    const result = execSync('hostname -I').toString().trim().split(' ')[0]
    return result || 'localhost'
  } catch {
    return 'localhost'
  }
}

export default defineConfig({
  plugins: [
    react({
      // Babel fast-refresh solo en dev; en prod: SWC transform automático
      babel: {
        plugins: [],
      },
    }),
  ],
  build: {
    // Compresión máxima con esbuild (built-in, no requiere plugin)
    minify: 'esbuild',
    // Target moderno: elimina polyfills innecesarios (~15-20% menos JS)
    target: 'es2020',
    // CSS inline < 4KB para evitar round-trip extra
    cssCodeSplit: true,
    // Chunks más pequeños = mejor cache granular
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        // Cache de larga duración: cambiar solo el chunk que cambia, no todo
        entryFileNames:   'assets/[name]-[hash].js',
        chunkFileNames:   'assets/[name]-[hash].js',
        assetFileNames:   'assets/[name]-[hash][extname]',
        manualChunks(id) {
          // Supabase separado: pesa ~180KB y rara vez cambia
          if (id.includes('@supabase')) return 'vendor-supabase'
          // React core: cambia poco, beneficia del cache
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react'
          if (id.includes('react')) return 'vendor-react'
          // Lucide se importa por módulo; treeshaking lo reduce mucho
          if (id.includes('lucide-react')) return 'vendor-lucide'
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    hmr: {
      host: getLocalIP(),
      port: 5173,
      protocol: 'http',
    },
  },
  // Optimizar deps en dev: pre-bundle para evitar waterfalls
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
    ],
  },
})
