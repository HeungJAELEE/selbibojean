import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PREDEPLOY_PORT ?? "3392");
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: [
    "predeploy-representative-flows.spec.ts",
    "practical-prompt-visuals.spec.ts",
  ],
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: [
      "wrangler dev",
      "--config dist/server/wrangler.json",
      "--ip 127.0.0.1",
      `--port ${port}`,
      "--show-interactive-dev-session false",
    ].join(" "),
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
