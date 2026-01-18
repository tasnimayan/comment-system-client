import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react'
import react from "@vitejs/plugin-react-swc";
import autoprefixer from 'autoprefixer';
import path from "path";
import tailwindcss from 'tailwindcss';


// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 3000,
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



