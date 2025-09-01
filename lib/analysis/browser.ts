import chromium from "@sparticuz/chromium";
import { readdir } from "fs/promises";
import { tmpdir } from "os";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

export const dynamic = "force-dynamic";

const remoteExecutablePath =
  "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar";

export async function getBrowser() {
  if (process.env.NODE_ENV === "development") {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    return browser;
  } else {
    try {
      const files = await readdir(tmpdir());
      console.log("Files in /tmp:", files);
    } catch (error) {
      console.error("Error reading /tmp directory:", error);
    }

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
