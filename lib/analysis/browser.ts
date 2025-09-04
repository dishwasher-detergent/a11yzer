import chromium from "@sparticuz/chromium";
import { execSync } from "child_process";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

export const dynamic = "force-dynamic";
let installed = false;

export async function getBrowser() {
  if (process.env.NODE_ENV === "development") {
    console.log("Launching Chromium in development mode...");
    return puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 },
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  if (process.env.APPWRITE_SITES && !installed) {
    try {
      execSync("apk update && apk add --no-cache nss nspr", {
        stdio: "inherit",
      });
      installed = true;
    } catch (err) {
      const error = err as Error;

      console.error(error);
      throw new Error(`Chromium installation failed: ${error.message}`);
    }
  }

  const executablePath = await chromium.executablePath();

  const browser = await puppeteerCore.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });

  return browser;
}
