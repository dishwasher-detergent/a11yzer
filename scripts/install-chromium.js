const { install, findChromium } = require("@sparticuz/chromium");
const fs = require("fs");
const path = require("path");

async function setup() {
  await install();
  const { executablePath } = await findChromium();

  if (!executablePath) {
    throw new Error("Could not find Chromium binary after install");
  }

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