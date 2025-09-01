import chromium from "@sparticuz/chromium-min";
import { exec } from "child_process";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { tmpdir } from "os";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

export const dynamic = "force-dynamic";

// Chromium configuration for different environments
const getChromiumConfig = () => {
  const isAppwrite = process.env._HANDLER || process.env.APPWRITE_FUNCTION_ID;
  const isProduction = process.env.NODE_ENV === "production";

  if (isAppwrite || isProduction) {
    return {
      executablePath: "/tmp/chromium",
      remoteUrl:
        "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar",
    };
  }

  return null;
};

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

    const config = getChromiumConfig();
    let executablePath: string;

    if (config && existsSync(config.executablePath)) {
      // Use pre-installed Chromium from postinstall script
      executablePath = config.executablePath;
      console.log("Using pre-installed Chromium at:", executablePath);
    } else {
      // Fallback to chromium-min download
      console.log(
        "Pre-installed Chromium not found, downloading via chromium-min"
      );
      executablePath = await chromium.executablePath(config?.remoteUrl);
    }

    try {
      // Debug information
      const files = await readdir(tmpdir());
      console.log("Files in /tmp:", files.slice(0, 10)); // Limit output

      const exists = existsSync(executablePath);
      console.log("Chromium exists at path:", exists, executablePath);

      // Test chromium executable
      exec(`${executablePath} --version`, (err, stdout) => {
        if (err) {
          console.error("Chromium version check failed:", err.message);
        } else {
          console.log("Chromium version:", stdout.trim());
        }
      });
    } catch (error) {
      console.error("Error during browser setup:", error);
    }

    console.log("Launching puppeteer-core with executable:", executablePath);

    const browser = await puppeteerCore.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
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
      executablePath,
    });

    return browser;
  }
}
