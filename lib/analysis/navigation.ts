import { Browser, Page } from "puppeteer";

export interface NavigationOptions {
  url: string;
  maxRetries?: number;
  timeout?: number;
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
}

export interface NavigationResult {
  page: Page;
  success: boolean;
  attempt: number;
}

export async function navigateToPage(
  browser: Browser,
  options: NavigationOptions
): Promise<NavigationResult> {
  const {
    url,
    maxRetries = 3,
    timeout = 30000,
    viewport = { width: 1920, height: 1080 },
    userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  } = options;

  let page: Page | null = null;
  let navigationSuccess = false;
  let lastAttempt = 0;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    lastAttempt = attempt;

    try {
      if (page) {
        try {
          await page.close();
        } catch {
          // Ignore errors when closing potentially detached page
        }
      }

      page = await browser.newPage();

      await page.setUserAgent(userAgent);
      await page.setViewport(viewport);

      const waitStrategy =
        attempt === 1
          ? "networkidle2"
          : attempt === 2
          ? "domcontentloaded"
          : "load";

      await page.goto(url, {
        waitUntil: waitStrategy,
        timeout,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      navigationSuccess = true;
      break;
    } catch (navError) {
      console.log(`Navigation attempt ${attempt} failed:`, navError);
      navigationSuccess = false;

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  if (!navigationSuccess || !page) {
    throw new Error(
      `Failed to navigate to ${url} after ${maxRetries} attempts`
    );
  }

  return {
    page,
    success: navigationSuccess,
    attempt: lastAttempt,
  };
}
