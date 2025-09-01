import chromium from "@sparticuz/chromium";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";

export const dynamic = "force-dynamic";

export async function getBrowser() {
  if (process.env.NODE_ENV === "development") {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    return browser;
  } else {
    const path = await chromium.executablePath(
      "/usr/local/server/src/function/node_modules/@sparticuz/chromium/bin"
    );

    try {
      const files = await readdir(tmpdir());
      console.log("Files in /tmp:", files);

      const exists = existsSync(join(tmpdir(), "chromium"));
      console.log("Chromium exists in /tmp:", exists);

      const nextFiles = await readdir("/usr/local/server/src/function/.next");
      console.log("Files in .next:", nextFiles);
    } catch (error) {
      console.error("Error reading /tmp directory:", error);
    }

    console.log("Chromium executable path:", path);
    const browser = await puppeteerCore.launch({
      headless: true,
      args: chromium.args,
      executablePath: path,
    });

    return browser;
  }
}
