import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

export const dynamic = "force-dynamic";

export async function getBrowser() {
  if (process.env.NODE_ENV === "development") {
    console.log("Launching Chromium in development mode...");
    return puppeteer.launch({
      headless: false, // "shell" works too
      defaultViewport: { width: 1920, height: 1080 },
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  console.log("Launching Chromium in production mode...");

  try {
    // chrome-aws-lambda exposes executablePath() and default args for serverless
    const executablePath = await chromium.executablePath;
    const args = chromium.args || [];

    const launchOptions = {
      args: [
        ...args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      executablePath: executablePath || undefined,
      headless: chromium.headless ?? true,
      defaultViewport: chromium.defaultViewport ?? { width: 1280, height: 800 },
      ignoreHTTPSErrors: true,
      timeout: 60000,
    };

    // If chrome-aws-lambda didn't provide a binary in this environment, fall back to puppeteer
    if (!executablePath) {
      console.warn(
        "chrome-aws-lambda did not provide an executablePath; falling back to puppeteer bundled Chromium."
      );
      return puppeteer.launch({ headless: true, args: launchOptions.args });
    }

    const browser = await puppeteerCore.launch(launchOptions);
    return browser;
  } catch (err) {
    console.error("Failed to launch chromium via chrome-aws-lambda:", err);
    console.warn("Falling back to puppeteer.launch()");
    return puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  }
}
