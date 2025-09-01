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
      // Set up chromium with proper font support
      await chromium.font(
        "https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf"
      );

      // Get the chromium executable path
      const executablePath = await chromium.executablePath();
      console.log("Chromium executable path:", executablePath);

      // Verify the file exists
      try {
        await access(executablePath, constants.F_OK);
        console.log("Chromium executable exists");
      } catch (error) {
        console.error("Chromium executable not found:", error);
        throw new Error(`Chromium executable not found at ${executablePath}`);
      }

      // Make the chromium file executable
      try {
        await chmod(executablePath, 0o755);
        console.log("Made chromium executable:", executablePath);
      } catch (error) {
        console.warn("Could not make chromium executable:", error);
      }

      // Enhanced launch options for serverless environments
      const launchOptions = {
        args: [
          ...chromium.args,
          // Additional serverless-specific args
          "--disable-dev-shm-usage",
          "--disable-gpu-sandbox",
          "--disable-software-rasterizer",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-extensions",
          "--disable-default-apps",
          // Memory optimization
          "--memory-pressure-off",
          "--max_old_space_size=4096",
          // Security and stability
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--run-all-compositor-stages-before-draw",
          "--disable-background-networking",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-component-extensions-with-background-pages",
          // Font rendering
          "--disable-component-update",
          "--disable-domain-reliability",
          "--disable-sync",
          "--disable-translate",
          "--hide-scrollbars",
          "--mute-audio",
          "--no-default-browser-check",
          "--no-pings",
          "--password-store=basic",
          "--use-mock-keychain",
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
        // Add timeout and retry logic
        timeout: 30000,
        dumpio: false, // Disable debug output in production
      };

      console.log("Attempting to launch browser with enhanced options...");

      const browser = await puppeteerCore.launch(launchOptions);
      console.log("Browser launched successfully");

      // Test the browser by creating a page
      const page = await browser.newPage();
      await page.close();
      console.log("Browser validation successful");

      return browser;
    } catch (error) {
      console.error("Failed to launch browser:", error);

      // Log additional system information for debugging
      console.log("Process platform:", process.platform);
      console.log("Process arch:", process.arch);
      console.log("NODE_ENV:", process.env.NODE_ENV);
      console.log("Current working directory:", process.cwd());

      // Try a fallback with minimal options
      try {
        console.log("Attempting fallback launch with minimal options...");

        const fallbackOptions = {
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--single-process",
            "--no-zygote",
            "--headless",
          ],
          executablePath: await chromium.executablePath(),
          headless: true,
        };

        const browser = await puppeteerCore.launch(fallbackOptions);
        console.log("Fallback browser launch successful");
        return browser;
      } catch (fallbackError) {
        console.error("Fallback launch also failed:", fallbackError);
        throw new Error(
          `Both primary and fallback browser launches failed. Primary error: ${
            error instanceof Error ? error.message : String(error)
          }. Fallback error: ${
            fallbackError instanceof Error
              ? fallbackError.message
              : String(fallbackError)
          }`
        );
      }
    }
  }
}
