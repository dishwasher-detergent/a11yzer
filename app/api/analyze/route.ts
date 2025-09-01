import * as cheerio from "cheerio";
import { NextRequest } from "next/server";

import { analyzeWithAIStreaming } from "@/lib/analysis/ai-analyzer";
import { extractAccessibilityData } from "@/lib/analysis/extractors";
import { createLimitsInfo } from "@/lib/analysis/limits-info";
import { extractProblematicElements } from "@/lib/analysis/problematic-elements";
import {
  createErrorResponse,
  createValidationErrorResponse,
} from "@/lib/analysis/response-utils";
import { addHighlightsToScreenshot } from "@/lib/analysis/screenshot-highlights";
import { getLoggedInUser, getUserData } from "@/lib/auth";
import {
  ENDPOINT,
  MAX_ANALYSIS_LIMIT,
  PROJECT_ID,
  SCREENSHOT_BUCKET_ID,
} from "@/lib/constants";
import { createAnalysis } from "@/lib/db";
import { uploadScreenshotImage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { url, teamId } = await request.json();

    if (!url) {
      return createValidationErrorResponse("URL is required");
    }

    if (!teamId) {
      return createValidationErrorResponse("Team ID is required");
    }

    const user = await getLoggedInUser();
    const { data: userData } = await getUserData();

    if (!user || !userData) {
      return createValidationErrorResponse("User is not logged in");
    }

    if ((userData?.count || 0) >= MAX_ANALYSIS_LIMIT) {
      return createValidationErrorResponse("Daily analysis limit reached");
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                message: "Starting analysis...",
                step: 1,
                totalSteps: 6,
              })}\n\n`
            )
          );

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                message: "Launching browser and navigating to URL...",
                step: 2,
                totalSteps: 6,
              })}\n\n`
            )
          );

          // Configure Puppeteer for local vs production deployment
          const isLocal = process.env.NODE_ENV === "development";
          let puppeteer: any;
          let launchOptions: any = {
            headless: true,
          };

          if (isLocal) {
            // Use regular puppeteer for local development
            puppeteer = await import("puppeteer");
            launchOptions = {
              ...launchOptions,
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
            };
          } else {
            // Use puppeteer-core and @sparticuz/chromium for production
            const chromium = (await import("@sparticuz/chromium")).default;
            puppeteer = await import("puppeteer-core");
            launchOptions = {
              ...launchOptions,
              args: chromium.args,
              executablePath: await chromium.executablePath(),
            };
          }

          const browser = await puppeteer.launch(launchOptions);

          const page = await browser.newPage();
          await page.setViewport({ width: 1280, height: 800 });
          await page.goto(url, { waitUntil: "networkidle2" });

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                message: "Extracting accessibility data...",
                step: 3,
                totalSteps: 6,
              })}\n\n`
            )
          );

          const html = await page.content();
          const $ = cheerio.load(html);

          const accessibilityData = await extractAccessibilityData(page);
          const problematicElements = await extractProblematicElements(page, $);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                message: "Taking screenshot and processing...",
                step: 4,
                totalSteps: 6,
              })}\n\n`
            )
          );

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
          const screenshotFile = new File(
            [screenshotBuffer],
            "screenshot.png",
            {
              type: "image/png",
            }
          );

          const uploadResult = await uploadScreenshotImage({
            data: screenshotFile,
          });

          if (!uploadResult.success) {
            throw new Error("Failed to upload screenshot");
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                message: "Starting AI analysis...",
                step: 5,
                totalSteps: 6,
              })}\n\n`
            )
          );

          let analysis = null;
          let aiResponseBuffer = "";

          for await (const chunk of analyzeWithAIStreaming(accessibilityData)) {
            aiResponseBuffer += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "ai_chunk",
                  content: chunk,
                })}\n\n`
              )
            );
          }

          try {
            analysis = JSON.parse(aiResponseBuffer);
          } catch {
            analysis = {
              overallScore: 50,
              issues: [],
              summary: "Failed to parse AI response",
            };
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "status",
                message: "Saving results...",
                step: 6,
                totalSteps: 6,
              })}\n\n`
            )
          );

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
            count: (userData?.count || 0) + 1,
          };

          const analysisResult = await createAnalysis({
            data: {
              data: JSON.stringify(data),
              url: url,
              teamId: teamId,
            },
          });

          if (!analysisResult.success) {
            throw new Error("Failed to create analysis");
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                data: data,
                analysisId: analysisResult.data?.$id,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error("Analysis error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: "Failed to analyze webpage",
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return createErrorResponse("Failed to analyze webpage");
  }
}
