import chromium from "@sparticuz/chromium-min";
import { execSync } from "child_process";
import { existsSync } from "fs";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

export const dynamic = "force-dynamic";
let installed = false;

function ensureChromiumInstalled(context?: { log: (message: string) => void }) {
  if (installed) {
    context?.log?.("already installed chromium") ||
      console.log("already installed chromium");
  } else {
    try {
      // Check if we're in a serverless environment that needs APK installation
      if (
        existsSync("/usr/local/server/src/function/") &&
        existsSync("/usr/local/server/src/function/*.apk")
      ) {
        execSync("apk add /usr/local/server/src/function/*.apk");
        context?.log?.("installed chromium") ||
          console.log("installed chromium");
      } else {
        // For other environments, Chromium will be downloaded by @sparticuz/chromium
        context?.log?.("chromium will be downloaded automatically") ||
          console.log("chromium will be downloaded automatically");
      }
      installed = true;
    } catch (error) {
      context?.log?.(`chromium installation failed: ${error}`) ||
        console.error("chromium installation failed:", error);
      throw error;
    }
  }
}

export async function getBrowser(context?: { log: (message: string) => void }) {
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
    ensureChromiumInstalled(context);

    const browser = await puppeteerCore.launch({
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
      ],
      defaultViewport: chromium.defaultViewport,
      headless: true,
      executablePath: "/usr/bin/chromium-browser",
    });

    return browser;
  }
}
