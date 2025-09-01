const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawn } = require("child_process");
const zlib = require("zlib");

const url =
  "https://github.com/Sparticuz/chromium/releases/download/v138.0.2/chromium-v138.0.2-pack.x64.tar";

const destDir = path.join(".next", "serverless");
const destFile = path.join(destDir, "chromium.tar");

async function downloadChromium() {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(destDir, { recursive: true });

    function download(downloadUrl, maxRedirects = 5) {
      if (maxRedirects <= 0) {
        return reject(new Error("Too many redirects"));
      }

      const file = fs.createWriteStream(destFile);
      https.get(downloadUrl, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          file.close();
          try {
            fs.unlinkSync(destFile); // Clean up partial file
          } catch (e) {
            // File might not exist yet, ignore error
          }
          const redirectUrl = response.headers.location;
          if (!redirectUrl) {
            return reject(new Error("Redirect location not found"));
          }
          console.log(`Following redirect to: ${redirectUrl}`);
          return download(redirectUrl, maxRedirects - 1);
        }

        if (response.statusCode !== 200) {
          file.close();
          return reject(new Error(`Failed to download: ${response.statusCode}`));
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
        file.on("error", (err) => {
          try {
            fs.unlinkSync(destFile);
          } catch (e) {
            // File might not exist, ignore error
          }
          reject(err);
        });
      }).on("error", (err) => {
        file.close();
        reject(err);
      });
    }

    download(url);
  });
}

async function extractChromium() {
  return new Promise((resolve, reject) => {
    const child = spawn("tar", ["-xf", destFile, "-C", destDir]);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error("Extraction failed"));
      fs.unlinkSync(destFile); // cleanup tar file
      resolve();
    });
  });
}

async function decompressBrotliFiles() {
  const brFiles = fs.readdirSync(destDir).filter(file => file.endsWith('.br'));
  
  for (const brFile of brFiles) {
    const brPath = path.join(destDir, brFile);
    const outputPath = path.join(destDir, brFile.replace('.br', ''));
    
    console.log(`Decompressing ${brFile}...`);
    
    await new Promise((resolve, reject) => {
      const input = fs.createReadStream(brPath);
      const output = fs.createWriteStream(outputPath);
      const brotli = zlib.createBrotliDecompress();
      
      input.pipe(brotli).pipe(output);
      
      output.on('finish', () => {
        fs.unlinkSync(brPath); // Remove .br file after decompression
        resolve();
      });
      
      output.on('error', reject);
      brotli.on('error', reject);
    });
  }
  
  // Make chromium executable
  const chromiumPath = path.join(destDir, 'chromium');
  if (fs.existsSync(chromiumPath)) {
    try {
      fs.chmodSync(chromiumPath, '755');
    } catch (err) {
      console.warn('Could not set executable permissions:', err.message);
    }
  }
}

(async () => {
  try {
    console.log("Downloading Chromium...");
    await downloadChromium();
    console.log("Extracting Chromium...");
    await extractChromium();
    console.log("Decompressing Brotli files...");
    await decompressBrotliFiles();
    console.log("Chromium installed into", destDir);
  } catch (err) {
    console.error("Failed to install Chromium:", err);
    process.exit(1);
  }
})();