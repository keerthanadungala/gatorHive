
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // ✅ Enables global Vitest utilities
    environment: "jsdom", // ✅ Simulates a browser environment
    setupFiles: "./setupVitest.js", // ✅ Ensures proper test setup
    css: false, // ✅ Ignores CSS imports to prevent syntax errors
  },
});


