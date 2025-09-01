import chromium from "@sparticuz/chromium-min";
import { constants } from "fs";
import { access, chmod, readdir } from "fs/promises";
import { tmpdir } from "os";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

export const dynamic = "force-dynamic";

export async function getBrowser() {
  if (process.env.NODE_ENV === "development") {
    console.log("Launching browser in development mode");
    const browser = await puppeteer.launch({
      headless: "shell",
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
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

    console.log("Setting up chromium environment...");

    // Use the default path without custom font to avoid issues
    const executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar"
    );
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

    try {
      const temp = await readdir(tmpdir());
      console.log("Temporary directory contents:", temp);
    } catch (error) {
      console.error("Error reading temporary directory:", error);
    }

    // Set proper file permissions
    try {
      await chmod(executablePath, 0o755);
      console.log("Set chromium executable permissions");
    } catch (error) {
      console.warn("Could not set chromium executable permissions:", error);
    }

    // Enhanced launch options for serverless environments with library issues
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
        "--disable-plugins",
        // Additional flags for NSS/NSPR library compatibility
        "--disable-web-security",
        "--disable-features=TranslateUI,VizDisplayCompositor,AudioServiceOutOfProcess",
        "--disable-ipc-flooding-protection",
        "--disable-software-rasterizer",
        "--disable-background-networking",
        "--metrics-recording-only",
        "--safebrowsing-disable-auto-update",
        "--ignore-ssl-errors",
        "--ignore-certificate-errors",
        "--ignore-certificate-errors-spki-list",
      ],
      executablePath: executablePath,
      headless: true,
      timeout: 60000,
      ignoreHTTPSErrors: true,
      dumpio: process.env.DEBUG_CHROMIUM === "true",
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
  }
}
