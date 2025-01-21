import { test as base, expect } from "@playwright/test";
import { addCoverageReport } from "monocart-reporter";

type CustomFixtures = {
  autoTestFixture: string;
};

const test = base.extend<CustomFixtures>({
  autoTestFixture: [
    async ({ page }, use) => {
      const isChromium = test.info().project.name === "chromium";

      if (isChromium) {
        await Promise.all([
          page.coverage.startJSCoverage({
            resetOnNavigation: false,
          }),
          page.coverage.startCSSCoverage({
            resetOnNavigation: false,
          }),
        ]);
      }

      await use("autoTestFixture");

      if (isChromium) {
        const [jsCoverage, cssCoverage] = await Promise.all([
          page.coverage.stopJSCoverage(),
          page.coverage.stopCSSCoverage(),
        ]);
        const coverageList = [...jsCoverage, ...cssCoverage];
        await addCoverageReport(coverageList, test.info());
      }
    },
    {
      scope: "test",
      auto: true,
    },
  ],
});

export { expect, test };
