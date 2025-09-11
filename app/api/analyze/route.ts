import * as cheerio from "cheerio";
import { NextRequest } from "next/server";
import { Browser } from "puppeteer";

import { analyzeWithAIStreaming } from "@/lib/analysis/ai-analyzer";
import { getBrowser } from "@/lib/analysis/browser";
import { extractAccessibilityData } from "@/lib/analysis/extractors";
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sendMessage = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          const oneHourAgo = new Date();
          oneHourAgo.setHours(oneHourAgo.getHours() - 1);
          const now = new Date();

          // const existingAnalysis = await listAnalysis([
          //   Query.limit(1),
          //   Query.orderDesc("$createdAt"),
          //   Query.equal("url", url),
          //   Query.equal("teamId", teamId),
          //   Query.between(
          //     "$createdAt",
          //     oneHourAgo.toISOString(),
          //     now.toISOString()
          //   ),
          // ]);

          // if (existingAnalysis.data && existingAnalysis.data?.rows.length > 0) {
          //   sendMessage({
          //     type: "complete",
          //     data: existingAnalysis.data?.rows[0].data,
          //     analysisId: existingAnalysis.data?.rows[0]?.$id,
          //     cached: true,
          //   });

          //   controller.close();
          //   return;
          // }

          let browser: Browser | null = null;
          let page = null;

          try {
            browser = (await getBrowser()) as Browser;

            let navigationSuccess = false;
            const maxRetries = 3;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
              try {
                if (page) {
                  try {
                    await page.close();
                  } catch {
                    // Ignore errors when closing potentially detached page
                  }
                }

                page = await browser.newPage();

                await page.setUserAgent(
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                );
                await page.setViewport({ width: 1920, height: 1080 });
                const waitStrategy =
                  attempt === 1
                    ? "networkidle2"
                    : attempt === 2
                    ? "domcontentloaded"
                    : "load";

                console.log(waitStrategy);

                await page.goto(url, {
                  waitUntil: waitStrategy,
                  timeout: 30000,
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

            const html = await page.content();
            const $ = cheerio.load(html);

            const accessibilityData = await extractAccessibilityData(page);
            const problematicElements = await extractProblematicElements(
              page,
              $
            );

            sendMessage({
              type: "ai_chunk",
              content: `{% technical-details data="${Buffer.from(
                JSON.stringify(accessibilityData)
              ).toString("base64")}" /%}\n`,
            });

            const screenshot = await page.screenshot({
              encoding: "base64",
              fullPage: true,
            });

            const highlightedScreenshot = await addHighlightsToScreenshot(
              browser,
              screenshot as string,
              problematicElements.items
            );

            const screenshotBuffer = Buffer.from(
              highlightedScreenshot,
              "base64"
            );
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

            const screenshotUrl = `${ENDPOINT}/storage/buckets/${SCREENSHOT_BUCKET_ID}/files/${
              uploadResult.data!.$id
            }/view?project=${PROJECT_ID}`;

            sendMessage({
              type: "ai_chunk",
              content: `{% problematic-elements screenshot="${screenshotUrl}" elements="${Buffer.from(
                JSON.stringify(problematicElements)
              ).toString("base64")}" /%}\n`,
            });

            sendMessage({
              type: "ai_chunk",
              content: `{% ai-result %}\n`,
            });

            let aiResponseBuffer = "";

            for await (const chunk of analyzeWithAIStreaming(
              accessibilityData
            )) {
              aiResponseBuffer += chunk;
              sendMessage({
                type: "ai_chunk",
                content: chunk,
              });
            }

            sendMessage({
              type: "ai_chunk",
              content: `{% /ai-result %}\n`,
            });

            const analysisResult = await createAnalysis({
              data: {
                data: aiResponseBuffer,
                url: url,
                teamId: teamId,
                screenshot: screenshotUrl,
              },
            });
            if (!analysisResult.success) {
              throw new Error("Failed to create analysis");
            }

            sendMessage({
              type: "count",
              data: (userData?.count || 0) + 1,
            });

            sendMessage({
              type: "analysis_id",
              data: analysisResult?.data?.$id,
            });

            controller.close();
          } catch (browserError) {
            console.error("Browser operation error:", browserError);
            throw browserError;
          } finally {
            // Always cleanup browser resources with proper error handling
            try {
              if (page && !page.isClosed()) {
                await page.close().catch(() => {
                  // Ignore errors during page cleanup
                });
              }
            } catch (pageCleanupError) {
              console.error("Page cleanup error:", pageCleanupError);
            }

            try {
              if (browser && browser.isConnected()) {
                await browser.close().catch(() => {
                  // Ignore errors during browser cleanup
                });
              }
            } catch (browserCleanupError) {
              console.error("Browser cleanup error:", browserCleanupError);
            }
          }
        } catch (error) {
          console.error("Analysis error:", error);
          sendMessage({
            type: "error",
            message: "Failed to analyze webpage",
            error: error instanceof Error ? error.message : "Unknown error",
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return createErrorResponse("Failed to analyze webpage");
  }
}
