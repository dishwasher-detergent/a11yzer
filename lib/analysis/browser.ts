import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";

export const dynamic = "force-dynamic";

const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

export async function getBrowser() {
  if (process.env.NODE_ENV === "development") {
    const browser = await puppeteerCore.launch({
      headless: true,
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--disable-gpu",
      ],
      executablePath: await chromium.executablePath(remoteExecutablePath),
    });

    return browser;
  } else {
    const browser = await puppeteerCore.launch({
      headless: true,
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
        "--disable-gpu",
      ],
      executablePath: await chromium.executablePath(remoteExecutablePath),
    });

    return browser;
  }
}
