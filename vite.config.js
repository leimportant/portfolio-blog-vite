// vite.config.js
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // Optional: Add any aliases you need for the project
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "pdf.worker": ["/pdf.worker.min.mjs"],
        },
      },
    },
  },
});
