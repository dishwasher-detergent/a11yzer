import chromium from "@sparticuz/chromium";
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

  const executablePath = await chromium.executablePath();

  const browser = await puppeteerCore.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: "shell",
  });

  return browser;
}
