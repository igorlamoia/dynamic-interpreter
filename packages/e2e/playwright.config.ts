import { defineConfig, devices } from "@playwright/test";
import { BASE_URL } from "./support/env";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./specs",
  testMatch: /.*\.e2e\.ts$/,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Um teste que so passa no retry REPROVA o CI. Sem isto, as duas corridas
  // de leitura-apos-escrita que esta suite encontrou teriam passado
  // disfarcadas de "flaky". Os retries continuam servindo para o relatorio
  // distinguir falha consistente de intermitente.
  failOnFlakyTests: isCI,
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
