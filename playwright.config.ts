import { defineConfig } from "@playwright/test";

const baseURL = (process.env.PLAYWRIGHT_TEST_BASE_URL || "https://joukko-staging.onrender.com").replace(/\/$/, "");

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/global-setup.ts",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL,
    browserName: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  }
});
