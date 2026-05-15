import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo: cualquier ruta desconocida sirve index.html (SPA fallback)
    historyApiFallback: true,
  },
  preview: {
    // En `vite preview` (producción local): misma lógica
    historyApiFallback: true,
  },
})