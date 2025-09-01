// scripts/download-chromium.js
import { findChromium, install } from "@sparticuz/chromium";
import fs from "fs";
import path from "path";

async function setup() {
  // Download binary if not cached
  await install();

  // Find where @sparticuz/chromium put the binary
  const { executablePath } = await findChromium();

  if (!executablePath) {
    throw new Error("Could not find Chromium binary after install");
  }

  // Copy binary into .next/serverless/chromium
  const destDir = path.join(".next", "serverless");
  const destPath = path.join(destDir, "chromium");

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(executablePath, destPath);

  console.log(`Chromium binary copied to ${destPath}`);
}

setup().catch((err) => {
  console.error("Failed to download Chromium:", err);
  process.exit(1);
});
