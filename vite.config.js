import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// Obtener IP local automáticamente
function getLocalIP() {
  try {
    const result = execSync('hostname -I').toString().trim().split(' ')[0]
    return result || 'localhost'
  } catch {
    return 'localhost'
  }
}

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-lucide':   ['lucide-react'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    middlewareMode: false,
    hmr: {
      host: getLocalIP(),
      port: 5173,
      protocol: 'http'
    }
  },
})
