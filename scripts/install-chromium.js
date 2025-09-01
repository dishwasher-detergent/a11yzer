const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawn } = require("child_process");

const url =
  "https://github.com/Sparticuz/chromium/releases/download/v138.0.2/chromium-v138.0.2-pack.x64.tar";

const destDir = path.join(".next", "serverless");
const destFile = path.join(destDir, "chromium.tar");

async function downloadChromium() {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(destDir, { recursive: true });

    const file = fs.createWriteStream(destFile);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${response.statusCode}`));
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", reject);
  });
}

async function extractChromium() {
  return new Promise((resolve, reject) => {
    const child = spawn("tar", ["-xf", destFile, "-C", destDir]);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error("Extraction failed"));
      fs.unlinkSync(destFile); // cleanup
      resolve();
    });
  });
}

(async () => {
  try {
    console.log("Downloading Chromium...");
    await downloadChromium();
    console.log("Extracting Chromium...");
    await extractChromium();
    console.log("Chromium installed into", destDir);
  } catch (err) {
    console.error("Failed to install Chromium:", err);
    process.exit(1);
  }
})();