import { NextRequest, NextResponse } from "next/server";
import { Browser } from "puppeteer";

import { analyzeWithAIStreaming } from "@/lib/analysis/ai-analyzer";
import { getBrowser } from "@/lib/analysis/browser";
import { extractAccessibilityData } from "@/lib/analysis/extractors";
import { navigateToPage } from "@/lib/analysis/navigation";
import { extractProblematicElements } from "@/lib/analysis/problematic-elements";
import { MessageType, sendMessage } from "@/lib/analysis/response-utils";
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
      return NextResponse.json(
        {
          error: "URL is required.",
        },
        { status: 400 }
      );
    }

    if (!teamId) {
      return NextResponse.json(
        {
          error: "Team ID is required.",
        },
        { status: 400 }
      );
    }

    const user = await getLoggedInUser();
    const { data: userData } = await getUserData();

    if (!user || !userData) {
      return NextResponse.json(
        {
          error: "User is not logged in.",
        },
        { status: 401 }
      );
    }

    if ((userData?.count || 0) >= MAX_ANALYSIS_LIMIT) {
      return NextResponse.json(
        {
          error: "Daily analysis limit reached.",
        },
        { status: 429 }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // const oneHourAgo = new Date();
          // oneHourAgo.setHours(oneHourAgo.getHours() - 1);
          // const now = new Date();

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

          const browser = (await getBrowser()) as Browser;
          let page = null;
          let totalMessage = "";

          try {
            const navigationResult = await navigateToPage(browser, {
              url,
              maxRetries: 3,
              timeout: 30000,
              viewport: { width: 1920, height: 1080 },
            });

            page = navigationResult.page;
          } catch (navigationError) {
            console.error("Navigation error:", navigationError);

            sendMessage({
              controller,
              type: MessageType.ERROR,
              content: "Failed to analyze webpage.",
            });
            controller.close();
            return;
          }

          let accessibilityData;
          let problematicElements;

          try {
            accessibilityData = await extractAccessibilityData(page);
          } catch (error) {
            console.error("Failed to extract accessibility data:", error);
            sendMessage({
              controller,
              type: MessageType.ERROR,
              content: "Failed to extract accessibility data from webpage.",
            });
            controller.close();
            return;
          }

          try {
            problematicElements = await extractProblematicElements(page);
          } catch (error) {
            console.error("Failed to extract problematic elements:", error);
            sendMessage({
              controller,
              type: MessageType.ERROR,
              content: "Failed to extract problematic elements from webpage.",
            });
            controller.close();
            return;
          }

          const techDetailsContent = `{% technical-details data="${Buffer.from(
            JSON.stringify(accessibilityData)
          ).toString("base64")}" /%}\n`;

          sendMessage({
            controller,
            type: MessageType.AI_CHUNK,
            content: techDetailsContent,
          });

          totalMessage += techDetailsContent;

          let screenshot;
          try {
            screenshot = await page.screenshot({
              encoding: "base64",
              fullPage: true,
            });
          } catch (error) {
            console.error("Failed to take screenshot:", error);

            sendMessage({
              controller,
              type: MessageType.ERROR,
              content: "Failed to capture webpage screenshot.",
            });

            controller.close();
            return;
          }

          let highlightedScreenshot;
          try {
            highlightedScreenshot = await addHighlightsToScreenshot(
              browser,
              screenshot as string,
              problematicElements.items
            );
          } catch (error) {
            console.error("Failed to add highlights to screenshot:", error);

            sendMessage({
              controller,
              type: MessageType.ERROR,
              content:
                "Failed to highlight problematic elements in screenshot.",
            });

            controller.close();
            return;
          }

          let screenshotFile;
          try {
            const screenshotBuffer = Buffer.from(
              highlightedScreenshot,
              "base64"
            );
            screenshotFile = new File([screenshotBuffer], "screenshot.png", {
              type: "image/png",
            });
          } catch (error) {
            console.error("Failed to create screenshot file:", error);

            sendMessage({
              controller,
              type: MessageType.ERROR,
              content: "Failed to prepare screenshot for upload.",
            });

            controller.close();
            return;
          }

          const uploadResult = await uploadScreenshotImage({
            data: screenshotFile,
          });

          if (!uploadResult.success) {
            sendMessage({
              controller,
              type: MessageType.ERROR,
              content: "Failed to upload screenshot to storage.",
            });

            controller.close();
            return;
          }

          const screenshotUrl = `${ENDPOINT}/storage/buckets/${SCREENSHOT_BUCKET_ID}/files/${
            uploadResult.data!.$id
          }/view?project=${PROJECT_ID}`;

          const problematicElementsContent = `{% problematic-elements screenshot="${screenshotUrl}" elements="${Buffer.from(
            JSON.stringify(problematicElements)
          ).toString("base64")}" /%}\n`;

          sendMessage({
            controller,
            type: MessageType.AI_CHUNK,
            content: problematicElementsContent,
          });

          totalMessage += problematicElementsContent;

          sendMessage({
            controller,
            type: MessageType.AI_CHUNK,
            content: `{% ai-result %}\n`,
          });

          totalMessage += `{% ai-result %}\n`;

          let aiResponseBuffer = "";

          for await (const chunk of analyzeWithAIStreaming(accessibilityData)) {
            aiResponseBuffer += chunk;
            sendMessage({
              controller,
              type: MessageType.AI_CHUNK,
              content: chunk,
            });
          }

          sendMessage({
            controller,
            type: MessageType.AI_CHUNK,
            content: `{% /ai-result %}\n`,
          });

          const analysisResult = await createAnalysis({
            data: {
              data: totalMessage + aiResponseBuffer,
              url: url,
              teamId: teamId,
              screenshot: screenshotUrl,
            },
          });

          if (!analysisResult.success) {
            sendMessage({
              controller,
              type: MessageType.ERROR,
              content: "Failed to create analysis record.",
            });
          }

          sendMessage({
            controller,
            type: MessageType.COUNT,
            content: (userData?.count || 0) + 1,
          });

          sendMessage({
            controller,
            type: MessageType.ANALYSIS_ID,
            content: analysisResult?.data?.$id,
          });

          controller.close();
        } catch (browserError) {
          console.error("Browser operation error:", browserError);

          throw browserError;
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

    return NextResponse.json(
      {
        error: "Failed to analyze website.",
      },
      { status: 500 }
    );
  }
}
