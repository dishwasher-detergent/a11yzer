import chromium from "@sparticuz/chromium";
import { constants } from "fs";
import { access, chmod } from "fs/promises";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

export const dynamic = "force-dynamic";

export async function getBrowser() {
  if (process.env.NODE_ENV === "development") {
    console.log("Launching browser in development mode");
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    return browser;
  } else {
    console.log("Launching browser in production mode");

    try {
      // Important: Set up chromium library path and dependencies first
      console.log("Setting up chromium environment...");

      // Use the default path without custom font to avoid issues
      const executablePath = await chromium.executablePath();
      console.log("Chromium executable path:", executablePath);

      // Verify the file exists and is accessible
      try {
        await access(executablePath, constants.F_OK | constants.X_OK);
        console.log("Chromium executable exists and is accessible");
      } catch (error) {
        console.error("Chromium executable access error:", error);
        throw new Error(
          `Chromium executable not accessible at ${executablePath}`
        );
      }

      // Set proper file permissions
      try {
        await chmod(executablePath, 0o755);
        console.log("Set chromium executable permissions");
      } catch (error) {
        console.warn("Could not set chromium executable permissions:", error);
      }

      // Minimal, reliable launch options for serverless
      const launchOptions = {
        args: [
          ...chromium.args,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--single-process",
          "--no-zygote",
          "--disable-extensions",
          "--disable-default-apps",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-component-extensions-with-background-pages",
          "--mute-audio",
          "--hide-scrollbars",
          "--no-first-run",
          "--disable-component-update",
          "--disable-sync",
          "--disable-translate",
          "--disable-features=TranslateUI,VizDisplayCompositor",
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: true,
        timeout: 60000, // Increased timeout for serverless cold starts
        ignoreHTTPSErrors: true,
        dumpio: process.env.DEBUG_CHROMIUM === "true", // Only enable debug output if explicitly requested
      };

      console.log("Launch options prepared, attempting browser launch...");

      const browser = await puppeteerCore.launch(launchOptions);
      console.log("Browser launched successfully");

      // Quick validation
      try {
        const page = await browser.newPage();
        await page.close();
        console.log("Browser validation successful");
      } catch (validationError) {
        console.warn(
          "Browser validation failed, but continuing:",
          validationError
        );
      }

      return browser;
    } catch (error) {
      console.error("Primary browser launch failed:", error);

      // Enhanced debugging information
      console.log("Environment debugging info:");
      console.log("- Platform:", process.platform);
      console.log("- Architecture:", process.arch);
      console.log("- NODE_ENV:", process.env.NODE_ENV);
      console.log("- Working directory:", process.cwd());
      console.log("- PATH:", process.env.PATH);
      console.log("- LD_LIBRARY_PATH:", process.env.LD_LIBRARY_PATH);

      // Try alternative chromium setup
      try {
        console.log("Attempting alternative chromium setup...");

        // Force chromium to extract/setup again
        const altExecutablePath = await chromium.executablePath();
        console.log("Alternative executable path:", altExecutablePath);

        const minimalOptions = {
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--single-process",
            "--no-zygote",
            "--headless=new",
            "--disable-extensions",
            "--disable-software-rasterizer",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
          ],
          executablePath: altExecutablePath,
          headless: true,
          timeout: 60000,
        };

        const browser = await puppeteerCore.launch(minimalOptions);
        console.log("Alternative browser launch successful");
        return browser;
      } catch (fallbackError) {
        console.error("Alternative launch also failed:", fallbackError);

        // Final attempt with system chromium if available
        try {
          console.log("Attempting system chromium fallback...");

          const systemOptions = {
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--disable-gpu",
              "--headless=new",
            ],
            headless: true,
            timeout: 30000,
          };

          const browser = await puppeteerCore.launch(systemOptions);
          console.log("System chromium launch successful");
          return browser;
        } catch (systemError) {
          console.error("System chromium launch failed:", systemError);

          throw new Error(
            `All browser launch attempts failed. Environment may not support chromium. ` +
              `Primary error: ${
                error instanceof Error ? error.message : String(error)
              }. ` +
              `Alternative error: ${
                fallbackError instanceof Error
                  ? fallbackError.message
                  : String(fallbackError)
              }. ` +
              `System error: ${
                systemError instanceof Error
                  ? systemError.message
                  : String(systemError)
              }`
          );
        }
      }
    }
  }
}
