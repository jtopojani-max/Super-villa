import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core Firebase (auth + firestore) — needed on every page load.
          if (id.includes("node_modules/firebase/auth") || id.includes("node_modules/@firebase/auth")) return "vendor-firebase-core";
          if (id.includes("node_modules/firebase/firestore") || id.includes("node_modules/@firebase/firestore")) return "vendor-firebase-core";
          if (id.includes("node_modules/firebase/app") || id.includes("node_modules/@firebase/app")) return "vendor-firebase-core";
          // Heavy Firebase modules — only loaded when used (storage, functions, analytics).
          if (id.includes("node_modules/firebase/storage") || id.includes("node_modules/@firebase/storage")) return "vendor-firebase-lazy";
          if (id.includes("node_modules/firebase/functions") || id.includes("node_modules/@firebase/functions")) return "vendor-firebase-lazy";
          if (id.includes("node_modules/firebase/analytics") || id.includes("node_modules/@firebase/analytics")) return "vendor-firebase-lazy";
          // Other Firebase utilities
          if (id.includes("node_modules/firebase") || id.includes("node_modules/@firebase")) return "vendor-firebase-core";
          if (id.includes("node_modules/react")) return "vendor-react";
        },
      },
    },
  },
})
