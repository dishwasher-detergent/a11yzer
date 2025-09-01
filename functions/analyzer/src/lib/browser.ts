import puppeteer from 'puppeteer';

export const spawnBrowser = async (url: string, options: any = {}) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, options);
  } catch {
    throw new Error(`Failed to load ${url}.`);
  }

  return { browser, page };
};
