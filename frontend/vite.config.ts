import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/clientes': {
        target: process.env.VITE_CLIENTES_URL || 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/productos': {
        target: process.env.VITE_PRODUCTOS_URL || 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/inventario': {
        target: process.env.VITE_INVENTARIO_URL || 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/ventas': {
        target: process.env.VITE_VENTAS_URL || 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/solicitudes': {
        target: process.env.VITE_VENTAS_URL || 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/conversaciones': {
        target: process.env.VITE_VENTAS_URL || 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/facturas': {
        target: process.env.VITE_FACTURACION_URL || 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
});
