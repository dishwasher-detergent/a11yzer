import * as cheerio from 'cheerio';
import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';

import { analyzeWithAIStreaming } from '../lib/analysis/ai-analyzer.js';
import { extractAccessibilityData } from '../lib/analysis/extractors.js';
import { createLimitsInfo } from '../lib/analysis/limits-info.js';
import { extractProblematicElements } from '../lib/analysis/problematic-elements.js';
import { addHighlightsToScreenshot } from '../lib/analysis/screenshot-highlights.js';
import {
  createSessionClient,
  database_service,
  storage_service,
} from '../lib/appwrite.js';
import { spawnBrowser } from '../lib/browser.js';
import { MAX_ANALYSIS_LIMIT } from '../lib/constants.js';

//{"url":"https://kennethbass.com","teamId":"1234"}
export function Analyze(app: Hono) {
  app.post('/analyze', async (c) => {
    try {
      const authHeader = c.req.header('authorization') || '';
      const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);

      if (!bearerMatch) {
        return c.json(
          {
            success: false,
            error: 'Authentication token missing or malformed.',
          },
          401
        );
      }

      const token = bearerMatch[1];
      const { account } = createSessionClient(token);

      let user;
      try {
        user = await account.get();
      } catch (err) {
        console.error('Invalid session token', err);

        return c.json(
          { success: false, error: 'Invalid authentication token.' },
          401
        );
      }

      const { url, teamId } = await c.req.json();

      if (!url) {
        return c.json({ success: false, error: 'URL is required.' }, 500);
      }

      if (!teamId) {
        return c.json({ success: false, error: 'Team ID is required.' }, 500);
      }

      const userId = user.$id as string;

      const { data: userData } = await database_service.getUserData(userId);

      if (!userData) {
        return c.json({ success: false, error: 'User data not found.' }, 401);
      }

      if ((userData?.count || 0) >= MAX_ANALYSIS_LIMIT) {
        return c.json(
          { success: false, error: 'Daily analysis limit reached.' },
          500
        );
      }

      // Set CORS headers for streaming
      c.header('Access-Control-Allow-Origin', '*');
      c.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      c.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With, Accept'
      );
      c.header(
        'Access-Control-Expose-Headers',
        'Authorization, Content-Type, Cache-Control'
      );

      return streamSSE(
        c,
        async (stream) => {
          let browser;
          let page;

          try {
            await stream.writeSSE({
              data: JSON.stringify({
                type: 'status',
                message: 'Starting analysis...',
                step: 1,
                totalSteps: 6,
              }),
            });

            await stream.writeSSE({
              data: JSON.stringify({
                type: 'status',
                message: 'Launching browser and navigating to URL...',
                step: 2,
                totalSteps: 6,
              }),
            });

            browser = await spawnBrowser();
            page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });
            await page.goto(url, { waitUntil: 'networkidle2' });

            await stream.writeSSE({
              data: JSON.stringify({
                type: 'status',
                message: 'Extracting accessibility data...',
                step: 3,
                totalSteps: 6,
              }),
            });

            const html = await page.content();
            const $ = cheerio.load(html);

            const accessibilityData = await extractAccessibilityData(page);
            const problematicElements = await extractProblematicElements(
              page,
              $
            );

            await stream.writeSSE({
              data: JSON.stringify({
                type: 'status',
                message: 'Taking screenshot and processing...',
                step: 4,
                totalSteps: 6,
              }),
            });

            const screenshot = await page.screenshot({
              encoding: 'base64',
              fullPage: true,
            });

            // Keep browser open — addHighlightsToScreenshot will open a page on the same
            // browser instance and close it when done.
            const highlightedScreenshot = await addHighlightsToScreenshot(
              browser,
              screenshot as string,
              problematicElements.items
            );

            const screenshotBuffer = Buffer.from(
              highlightedScreenshot,
              'base64'
            );

            const uploadResult = await storage_service.uploadScreenshotImage({
              data: screenshotBuffer as unknown as File,
            });

            if (!uploadResult.success) {
              throw new Error('Failed to upload screenshot');
            }

            await stream.writeSSE({
              data: JSON.stringify({
                type: 'status',
                message: 'Starting AI analysis...',
                step: 5,
                totalSteps: 6,
              }),
            });

            let analysis = null;
            let aiResponseBuffer = '';

            for await (const chunk of analyzeWithAIStreaming(
              accessibilityData
            )) {
              aiResponseBuffer += chunk;
              await stream.writeSSE({
                data: JSON.stringify({
                  type: 'ai_chunk',
                  content: chunk,
                }),
              });
            }

            try {
              analysis = JSON.parse(aiResponseBuffer);
            } catch {
              analysis = {
                overallScore: 50,
                issues: [],
                summary: 'Failed to parse AI response',
              };
            }

            await stream.writeSSE({
              data: JSON.stringify({
                type: 'status',
                message: 'Saving results...',
                step: 6,
                totalSteps: 6,
              }),
            });

            const limitsInfo = createLimitsInfo(accessibilityData);

            const data = {
              url: url,
              accessibilityData: accessibilityData,
              problematicElements: problematicElements,
              analysis: analysis,
              screenshotId: uploadResult.data!.$id,
              limitsInfo: limitsInfo,
              count: (userData?.count || 0) + 1,
            };

            const analysisResult = await database_service.createAnalysis({
              data: {
                data: JSON.stringify(data),
                url: url,
                teamId: teamId,
              },
            });

            if (!analysisResult.success) {
              throw new Error('Failed to create analysis');
            }

            await stream.writeSSE({
              data: JSON.stringify({
                type: 'complete',
                data: data,
                analysisId: analysisResult.data?.$id,
              }),
            });
          } catch (error) {
            console.error('Analysis error:', error);
            await stream.writeSSE({
              data: JSON.stringify({
                type: 'error',
                message: 'Failed to analyze webpage',
                error: error instanceof Error ? error.message : 'Unknown error',
              }),
            });
          } finally {
            // Always close the browser
            try {
              if (page) await page.close();
              if (browser) await browser.close();
            } catch (error) {
              console.error('Error closing browser:', error);
            }
          }
        },
        async (err, stream) => {
          console.error('Streaming error:', err);
          await stream.writeSSE({
            data: JSON.stringify({
              type: 'error',
              message: 'Streaming failed',
              error:
                err instanceof Error ? err.message : 'Unknown streaming error',
            }),
          });
        }
      );
    } catch (error) {
      console.error('Analysis error:', error);

      return c.json({ error: 'Failed to analyze webpage.' }, 500);
    }
  });
}
