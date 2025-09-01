import chromium from "@sparticuz/chromium-min";
import { execSync } from "child_process";
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
    let executablePath: string = "";

    if (config && existsSync(config.executablePath)) {
      // Use pre-installed Chromium from postinstall script
      executablePath = config.executablePath;
      console.log("Using pre-installed Chromium at:", executablePath);
    } else {
      // Fallback to chromium-min download
      console.log(
        "Pre-installed Chromium not found, downloading via chromium-min"
      );
      try {
        executablePath = await chromium.executablePath(config?.remoteUrl);
        console.log("Downloaded Chromium to:", executablePath);
      } catch (downloadError) {
        console.error("Failed to download Chromium:", downloadError);
        // Try alternative paths
        const alternativePaths = [
          "/usr/bin/chromium-browser",
          "/usr/bin/chromium",
          "/usr/bin/google-chrome",
          "/opt/google/chrome/chrome",
        ];

        let found = false;
        for (const altPath of alternativePaths) {
          if (existsSync(altPath)) {
            executablePath = altPath;
            console.log("Using system Chromium at:", executablePath);
            found = true;
            break;
          }
        }

        if (!found) {
          throw new Error("No Chromium binary found in any expected location");
        }
      }
    }

    try {
      // Debug information
      const files = await readdir(tmpdir());
      console.log("Files in /tmp:", files.slice(0, 10)); // Limit output

      const exists = existsSync(executablePath);
      console.log("Chromium exists at path:", exists, executablePath);

      // Test chromium executable synchronously
      if (exists) {
        try {
          const version = execSync(`${executablePath} --version`, {
            encoding: "utf8",
            timeout: 5000,
          });
          console.log("Chromium version:", version.trim());
        } catch (versionError) {
          console.error(
            "Chromium version check failed:",
            versionError instanceof Error
              ? versionError.message
              : "Unknown error"
          );
          // Try to get more info about the executable
          try {
            const lsOutput = execSync(`ls -la ${executablePath}`, {
              encoding: "utf8",
            });
            console.log("Chromium file details:", lsOutput.trim());
          } catch (lsError) {
            console.error("Could not get file details");
          }
        }
      } else {
        console.error("Chromium executable not found at:", executablePath);
      }
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
