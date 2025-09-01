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
      // Get the chromium executable path
      const executablePath = await chromium.executablePath();
      console.log("Chromium executable path:", executablePath);

      // Verify the file exists before making it executable
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

      // Verify the file is executable
      try {
        await access(executablePath, constants.X_OK);
        console.log("Chromium executable is accessible");
      } catch (error) {
        console.error("Chromium executable is not accessible:", error);
      }

      const launchOptions = {
        args: [
          ...chromium.args,
          "--no-sandbox",
          "--headless",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
          "--single-process",
          "--no-zygote", // Important for serverless
          "--disable-features=VizDisplayCompositor", // Helps with serverless
        ],
        defaultViewport: chromium.defaultViewport,
        headless: true,
        executablePath: executablePath,
        timeout: 30000,
      };

      console.log("Launch options:", JSON.stringify(launchOptions, null, 2));

      const browser = await puppeteerCore.launch(launchOptions);
      console.log("Browser launched successfully");
      return browser;
    } catch (error) {
      console.error("Failed to launch browser:", error);

      // Log additional system information
      console.log("Process platform:", process.platform);
      console.log("Process arch:", process.arch);
      console.log("NODE_ENV:", process.env.NODE_ENV);
      console.log("Current working directory:", process.cwd());

      throw error;
    }
  }
}
