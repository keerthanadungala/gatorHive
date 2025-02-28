import { defineConfig } from "cypress";

export default defineConfig({
  projectId: '3tpkyf',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:5173", // ✅ Make sure this is your frontend URL
  },
});
