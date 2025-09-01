#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function setupChromium() {
  console.log('Setting up Chromium for serverless deployment...');
  
  try {
    // Check if we're in a serverless environment
    const isServerless = process.env.NODE_ENV === 'production' || 
                         process.env.VERCEL || 
                         process.env.AWS_LAMBDA_FUNCTION_NAME ||
                         process.env._HANDLER; // Appwrite Functions indicator

    if (!isServerless) {
      console.log('Development environment detected, skipping Chromium setup');
      return;
    }

    // Install Chromium using @sparticuz/chromium-min
    console.log('Installing Chromium for serverless environment...');
    
    // Create tmp directory if it doesn't exist
    const tmpDir = '/tmp';
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Download and extract Chromium if not already present
    const chromiumPath = path.join(tmpDir, 'chromium');
    if (!fs.existsSync(chromiumPath)) {
      console.log('Downloading Chromium binary...');
      
      try {
        // Use curl to download Chromium
        execSync(`curl -Lo /tmp/chromium.tar https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar`, {
          stdio: 'inherit'
        });
        
        // Extract the tar file
        execSync('cd /tmp && tar -xf chromium.tar', {
          stdio: 'inherit'
        });
        
        // Make chromium executable
        execSync('chmod +x /tmp/chromium', {
          stdio: 'inherit'
        });
        
        console.log('Chromium setup completed successfully');
      } catch (downloadError) {
        console.warn('Failed to download Chromium via curl, trying alternative method...');
        
        // Alternative: Use node to download
        const https = require('https');
        const chromiumUrl = 'https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar';
        
        await new Promise((resolve, reject) => {
          const file = fs.createWriteStream('/tmp/chromium.tar');
          https.get(chromiumUrl, (response) => {
            response.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          }).on('error', reject);
        });
        
        execSync('cd /tmp && tar -xf chromium.tar && chmod +x /tmp/chromium', {
          stdio: 'inherit'
        });
      }
    }

    // Verify Chromium installation
    if (fs.existsSync(chromiumPath)) {
      console.log('Chromium binary found at:', chromiumPath);
      try {
        const version = execSync(`${chromiumPath} --version`, { encoding: 'utf8' });
        console.log('Chromium version:', version.trim());
      } catch (versionError) {
        console.warn('Could not get Chromium version, but binary exists');
      }
    } else {
      console.error('Chromium binary not found after setup');
    }

  } catch (error) {
    console.error('Error setting up Chromium:', error.message);
    // Don't fail the build, just warn
    console.warn('Continuing without Chromium setup - browser functionality may be limited');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  setupChromium().catch(console.error);
}

module.exports = { setupChromium };
