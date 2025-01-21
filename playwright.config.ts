import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import { CoverageReportOptions } from "monocart-reporter";
dotenv.config();

const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || "localhost";
const baseURL = `http://${HOSTNAME}:${PORT}`;

const isCI = process.env.CI;

// See https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: "./playwright",
  outputDir: "playwright/test-results",
  fullyParallel: true,
  forbidOnly: true,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  globalTeardown: "./global-teardown.js",
  reporter: [
    ["list"],
    [
      "junit",
      {
        outputFile: "coverage-reports/integration-report.xml",
      },
    ],
    [
      "monocart-reporter",
      {
        coverage: {
          name: "Integration tests report",
          outputDir: "coverage-reports/integration",
          lcov: true,
          entryFilter: (entry) => {
            return (
              entry.url.includes("next/static/chunks") ||
              entry.url.includes("next/server")
            );
          },
          sourceFilter: (sourcePath) => {
            return (
              sourcePath.includes("src/") &&
              !sourcePath.includes("node_modules")
            );
          },
          sourcePath: (fileSource) => {
            const list = ["_N_E/", "nextjs-with-playwright/"];
            for (const pre of list) {
              if (fileSource.startsWith(pre)) {
                return fileSource.slice(pre.length);
              }
            }
            return fileSource;
          },
          reports: ["v8", "console-details", "lcovonly"],
        } as CoverageReportOptions,
      },
    ],
  ],
  use: {
    baseURL,
    trace: "retry-with-trace",
    serviceWorkers: "allow",
  },
  webServer: {
    command: "npm run test:command",
    url: baseURL,
    timeout: 120 * 1000,
    stdout: "pipe",
    stderr: "pipe",
    reuseExistingServer: !isCI,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        bypassCSP: true,
        launchOptions: {
          args: ["--disable-web-security"],
        },
      },
      testIgnore: ["**/node_modules/**"],
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        bypassCSP: true,
        launchOptions: {
          args: ["--disable-web-security"],
        },
      },
      testIgnore: ["**/node_modules/**"],
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        bypassCSP: true,
        launchOptions: {
          args: ["--disable-web-security"],
        },
      },
      testIgnore: ["**/node_modules/**"],
    },
  ],
});
