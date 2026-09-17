import { defineConfig, devices } from "@playwright/test";
import { BASE_URL } from "./support/env";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./specs",
  testMatch: /.*\.e2e\.ts$/,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: isCI
    ? [["list"], ["github"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: BASE_URL,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
