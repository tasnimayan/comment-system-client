import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react'
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';


// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
})



