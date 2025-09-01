import { ElementInfo } from "@/interfaces/analysis.interface";

export async function addHighlightsToScreenshot(
  screenshotBase64: string,
  elements: ElementInfo[]
): Promise<string> {
  try {
    const imageDataUrl = `data:image/png;base64,${screenshotBase64}`;
    const canvasHTML = createCanvasHTML(imageDataUrl, elements);
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    await page.setContent(canvasHTML);
    await page.waitForSelector("#canvas", { timeout: 10000 });
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const img = document.querySelector(
          "#original-image"
        ) as HTMLImageElement;
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
        }
      });
    });

    const canvasElement = await page.$("#canvas");
    const screenshotBuffer = await canvasElement!.screenshot({ type: "png" });

    await browser.close();

    const highlightedBase64 = Buffer.from(screenshotBuffer).toString("base64");
    return highlightedBase64;
  } catch (error) {
    console.error("Error adding highlights to screenshot:", error);
    return screenshotBase64;
  }
}

function createCanvasHTML(
  imageDataUrl: string,
  elements: ElementInfo[]
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 20px; }
        #canvas { position: relative; display: inline-block; }
        #original-image { display: block; max-width: none; }
        .highlight {
          position: absolute;
          border: 2px solid;
          box-sizing: border-box;
        }
        .highlight.high {
          background-color: rgba(239, 68, 68, 0.3);
          border-color: rgba(239, 68, 68, 0.8);
        }
        .highlight.medium {
          background-color: rgba(245, 158, 11, 0.3);
          border-color: rgba(245, 158, 11, 0.8);
        }
        .highlight.low {
          background-color: rgba(34, 197, 94, 0.3);
          border-color: rgba(34, 197, 94, 0.8);
        }
        .priority-indicator {
          position: absolute;
          width: 20px;
          height: 20px;
          color: white;
          font-weight: bold;
          font-size: 12px;
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          top: -20px;
          left: 0;
        }
        .priority-indicator.high { background-color: #ef4444; }
        .priority-indicator.medium { background-color: #f59e0b; }
        .priority-indicator.low { background-color: #22c55e; }
      </style>
    </head>
    <body>
      <div id="canvas">
        <img id="original-image" src="${imageDataUrl}" />
        ${elements
          .map((element) => {
            const { boundingBox, priority } = element;
            return `
            <div class="highlight ${priority}" style="
              left: ${boundingBox.x}px;
              top: ${boundingBox.y}px;
              width: ${boundingBox.width}px;
              height: ${boundingBox.height}px;
            ">
              <div class="priority-indicator ${priority}">!</div>
            </div>
          `;
          })
          .join("")}
      </div>
    </body>
    </html>
  `;
}
