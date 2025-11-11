import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react";

// Se você estiver usando uma variável de ambiente para a URL de API:
const apiUrl = process.env.VITE_API_BASE_URL || "http://localhost:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: apiUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    // Aqui você pode adicionar configurações específicas de build, como otimizações.
    outDir: 'dist',  // Garante que a saída será para o diretório `dist`
  }
});
