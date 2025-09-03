import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60000, // 60 seconds
  fullyParallel: true,
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173/royalties.html",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  use: {
    baseURL: "http://localhost:5173",
  },
});
