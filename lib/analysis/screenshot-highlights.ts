import { createCanvas, loadImage } from "canvas";
import { Page } from "puppeteer";

import { ElementInfo, LimitedData } from "@/interfaces/analysis.interface";

export async function addHighlightsToScreenshot(
  screenshotBase64: string,
  elements: ElementInfo[]
): Promise<string> {
  try {
    const imageBuffer = Buffer.from(screenshotBase64, "base64");
    const originalImage = await loadImage(imageBuffer);
    const canvas = createCanvas(originalImage.width, originalImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(originalImage, 0, 0);

    elements.forEach((element) => {
      const { boundingBox, priority } = element;

      let color = "";
      switch (priority) {
        case "high":
          color = "rgba(239, 68, 68, 0.3)";
          break;
        case "medium":
          color = "rgba(245, 158, 11, 0.3)";
          break;
        case "low":
          color = "rgba(34, 197, 94, 0.3)";
          break;
      }

      // Draw highlight rectangle
      ctx.fillStyle = color;
      ctx.fillRect(
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );

      // Draw border
      ctx.strokeStyle = color.replace("0.3", "0.8");
      ctx.lineWidth = 2;
      ctx.strokeRect(
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );

      // Add priority indicator
      const indicatorSize = 20;
      ctx.fillStyle =
        priority === "high"
          ? "#ef4444"
          : priority === "medium"
          ? "#f59e0b"
          : "#22c55e";
      ctx.fillRect(
        boundingBox.x,
        boundingBox.y - indicatorSize,
        indicatorSize,
        indicatorSize
      );

      // Add exclamation mark or warning symbol
      ctx.fillStyle = "white";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "!",
        boundingBox.x + indicatorSize / 2,
        boundingBox.y - indicatorSize / 2 + 4
      );
    });

    const buffer = canvas.toBuffer("image/png");
    return buffer.toString("base64");
  } catch (error) {
    console.error("Error adding highlights to screenshot:", error);
    return screenshotBase64;
  }
}

export async function highlightProblematicElements(
  page: Page,
  problematicElements: LimitedData<ElementInfo>
): Promise<string> {
  // Take screenshot
  const screenshotBuffer = await page.screenshot({
    type: "png",
    fullPage: false,
  });
  const screenshotBase64 = Buffer.from(screenshotBuffer).toString("base64");

  // Add highlights to screenshot
  return addHighlightsToScreenshot(screenshotBase64, problematicElements.items);
}
