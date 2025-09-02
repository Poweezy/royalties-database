import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173/royalties.html",
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
  use: {
    baseURL: "http://localhost:5173",
  },
});
