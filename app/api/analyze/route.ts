import * as cheerio from "cheerio";
import { NextRequest } from "next/server";
import puppeteer from "puppeteer";

import { analyzeWithAI } from "@/lib/analysis/ai-analyzer";
import { extractAccessibilityData } from "@/lib/analysis/extractors";
import { createLimitsInfo } from "@/lib/analysis/limits-info";
import { extractProblematicElements } from "@/lib/analysis/problematic-elements";
import {
  createErrorResponse,
  createSuccessResponse,
  createValidationErrorResponse,
} from "@/lib/analysis/response-utils";
import { addHighlightsToScreenshot } from "@/lib/analysis/screenshot-highlights";
import { getLoggedInUser } from "@/lib/auth";
import { ENDPOINT, PROJECT_ID, SCREENSHOT_BUCKET_ID } from "@/lib/constants";
import { createAnalysis } from "@/lib/db";
import { uploadScreenshotImage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const user = await getLoggedInUser();

    if (!user) {
      return createValidationErrorResponse("User is not logged in");
    }

    const { url, teamId } = await request.json();

    if (!url) {
      return createValidationErrorResponse("URL is required");
    }

    if (!teamId) {
      return createValidationErrorResponse("Team ID is required");
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: "networkidle2" });

    const html = await page.content();
    const $ = cheerio.load(html);

    const accessibilityData = await extractAccessibilityData(page);
    const problematicElements = await extractProblematicElements(page, $);

    const screenshot = await page.screenshot({
      encoding: "base64",
      fullPage: true,
    });

    await browser.close();

    const highlightedScreenshot = await addHighlightsToScreenshot(
      screenshot as string,
      problematicElements.items
    );

    const screenshotBuffer = Buffer.from(highlightedScreenshot, "base64");
    const screenshotFile = new File([screenshotBuffer], "screenshot.png", {
      type: "image/png",
    });

    const uploadResult = await uploadScreenshotImage({
      data: screenshotFile,
    });

    if (!uploadResult.success) {
      throw new Error("Failed to upload screenshot");
    }

    const analysis = await analyzeWithAI(accessibilityData);
    const limitsInfo = createLimitsInfo(accessibilityData);

    const data = {
      url: url,
      accessibilityData: accessibilityData,
      problematicElements: problematicElements,
      analysis: analysis,
      screenshotUrl: `${ENDPOINT}/storage/buckets/${SCREENSHOT_BUCKET_ID}/files/${
        uploadResult.data!.$id
      }/view?project=${PROJECT_ID}`,
      limitsInfo: limitsInfo,
    };

    const analysisResult = await createAnalysis({
      data: {
        data: JSON.stringify(data),
        teamId: teamId,
      },
    });

    if (!analysisResult.success) {
      throw new Error("Failed to create analysis");
    }

    return createSuccessResponse(data);
  } catch (error) {
    console.error("Analysis error:", error);
    return createErrorResponse("Failed to analyze webpage");
  }
}
