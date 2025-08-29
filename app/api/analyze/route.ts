import { createCanvas, loadImage } from "canvas";
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer, { Page } from "puppeteer";

// Limits to prevent prompt from becoming too large
const ANALYSIS_LIMITS = {
  MAX_HEADINGS: 20,
  MAX_IMAGES: 30,
  MAX_LINKS: 25,
  MAX_FORM_INPUTS: 15,
  MAX_ARIA_ELEMENTS: 20,
  MAX_PROBLEMATIC_ELEMENTS: 30,
  MAX_TEXT_LENGTH: 200, // Maximum text length for individual items
} as const;

interface ElementInfo {
  selector: string;
  text: string;
  issue: string;
  priority: "high" | "medium" | "low";
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
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

    const accessibilityData = {
      title: $("title").text() || "No title found",
      headings: extractHeadings($),
      images: extractImages($),
      links: extractLinks($),
      forms: extractForms($),
      ariaLabels: extractAriaLabels($),
      semanticStructure: analyzeSemanticStructure($),
      keyboardNavigation: analyzeKeyboardNavigation($),
    };

    // Create summary for limited data
    const createDataSummary = (data: any, label: string) => {
      if (data.limited) {
        return `${label} (showing first ${data.items.length} of ${data.totalCount} total - data limited to prevent prompt overflow)`;
      }
      return label;
    };

    const prompt = `
Analyze this webpage for accessibility issues and UI/UX improvements. Here's the data:

Title: ${accessibilityData.title}

${createDataSummary(accessibilityData.headings, "Headings")}: ${JSON.stringify(
      accessibilityData.headings.items,
      null,
      2
    )}

${createDataSummary(accessibilityData.images, "Images")}: ${JSON.stringify(
      accessibilityData.images.items,
      null,
      2
    )}

${createDataSummary(accessibilityData.links, "Links")}: ${JSON.stringify(
      accessibilityData.links.items,
      null,
      2
    )}

${createDataSummary(accessibilityData.forms, "Forms")}: ${JSON.stringify(
      accessibilityData.forms.items,
      null,
      2
    )}

${createDataSummary(
  accessibilityData.ariaLabels,
  "ARIA Labels"
)}: ${JSON.stringify(accessibilityData.ariaLabels.items, null, 2)}

Semantic Structure: ${JSON.stringify(
      accessibilityData.semanticStructure,
      null,
      2
    )}

Keyboard Navigation: ${JSON.stringify(
      accessibilityData.keyboardNavigation,
      null,
      2
    )}

Note: Some data may be limited to prevent prompt overflow. Focus on the most critical accessibility issues from the provided sample.

Please provide:
1. Critical accessibility issues (WCAG violations)
2. UI/UX improvement suggestions
3. Priority level (High/Medium/Low) for each issue
4. Specific recommendations for fixes

Format your response as JSON with the following structure:
{
  "overallScore": number (0-100),
  "issues": [
    {
      "type": "accessibility" | "ux" | "ui",
      "priority": "high" | "medium" | "low",
      "title": "Issue title",
      "description": "Detailed description",
      "recommendation": "How to fix this",
      "wcagCriterion": "WCAG criterion if applicable"
    }
  ],
  "summary": "Overall assessment summary"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert accessibility auditor and UX consultant. Analyze webpages for WCAG compliance and provide actionable improvement suggestions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const aiResponse = completion.choices[0]?.message?.content;
    let analysis;

    try {
      analysis = JSON.parse(aiResponse || "{}");
    } catch (e) {
      analysis = {
        overallScore: 50,
        issues: [],
        summary: "Failed to parse AI response",
      };
    }

    // Collect all limits information
    const limitsInfo = {
      headings: {
        limited: accessibilityData.headings.limited,
        showing: accessibilityData.headings.items.length,
        total: accessibilityData.headings.totalCount,
      },
      images: {
        limited: accessibilityData.images.limited,
        showing: accessibilityData.images.items.length,
        total: accessibilityData.images.totalCount,
      },
      links: {
        limited: accessibilityData.links.limited,
        showing: accessibilityData.links.items.length,
        total: accessibilityData.links.totalCount,
      },
      forms: {
        limited: accessibilityData.forms.limited,
        showing: accessibilityData.forms.items.reduce(
          (sum, form) => sum + form.inputs.length,
          0
        ),
        total: accessibilityData.forms.totalInputCount,
      },
      ariaLabels: {
        limited: accessibilityData.ariaLabels.limited,
        showing: accessibilityData.ariaLabels.items.length,
        total: accessibilityData.ariaLabels.totalCount,
      },
      problematicElements: {
        limited: problematicElements.limited,
        showing: problematicElements.items.length,
        total: problematicElements.totalCount,
      },
    };

    return NextResponse.json({
      url,
      screenshot: `data:image/png;base64,${highlightedScreenshot}`,
      originalScreenshot: `data:image/png;base64,${screenshot}`,
      analysis,
      rawData: accessibilityData,
      problematicElements,
      limits: limitsInfo,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze webpage" },
      { status: 500 }
    );
  }
}

function extractHeadings($: cheerio.CheerioAPI) {
  const headings: Array<{ level: string; text: string; hasId: boolean }> = [];
  let count = 0;

  $("h1, h2, h3, h4, h5, h6").each((_, element) => {
    if (count >= ANALYSIS_LIMITS.MAX_HEADINGS) return false; // Stop iteration

    const $el = $(element);
    const text = $el.text().trim();
    headings.push({
      level: element.tagName.toLowerCase(),
      text:
        text.length > ANALYSIS_LIMITS.MAX_TEXT_LENGTH
          ? text.substring(0, ANALYSIS_LIMITS.MAX_TEXT_LENGTH) + "..."
          : text,
      hasId: !!$el.attr("id"),
    });
    count++;
  });

  return {
    items: headings,
    totalCount: $("h1, h2, h3, h4, h5, h6").length,
    limited: count >= ANALYSIS_LIMITS.MAX_HEADINGS,
  };
}

function extractImages($: cheerio.CheerioAPI) {
  const images: Array<{
    src: string;
    alt: string | undefined;
    hasAlt: boolean;
  }> = [];
  let count = 0;

  $("img").each((_, element) => {
    if (count >= ANALYSIS_LIMITS.MAX_IMAGES) return false; // Stop iteration

    const $el = $(element);
    const alt = $el.attr("alt");
    const src = $el.attr("src") || "";

    images.push({
      src:
        src.length > ANALYSIS_LIMITS.MAX_TEXT_LENGTH
          ? src.substring(0, ANALYSIS_LIMITS.MAX_TEXT_LENGTH) + "..."
          : src,
      alt:
        alt && alt.length > ANALYSIS_LIMITS.MAX_TEXT_LENGTH
          ? alt.substring(0, ANALYSIS_LIMITS.MAX_TEXT_LENGTH) + "..."
          : alt || "",
      hasAlt: alt !== undefined,
    });
    count++;
  });

  return {
    items: images,
    totalCount: $("img").length,
    limited: count >= ANALYSIS_LIMITS.MAX_IMAGES,
  };
}

function extractLinks($: cheerio.CheerioAPI) {
  const links: Array<{ href: string; text: string; hasTitle: boolean }> = [];
  let count = 0;

  $("a").each((_, element) => {
    if (count >= ANALYSIS_LIMITS.MAX_LINKS) return false; // Stop iteration

    const $el = $(element);
    const href = $el.attr("href") || "";
    const text = $el.text().trim();

    links.push({
      href:
        href.length > ANALYSIS_LIMITS.MAX_TEXT_LENGTH
          ? href.substring(0, ANALYSIS_LIMITS.MAX_TEXT_LENGTH) + "..."
          : href,
      text:
        text.length > ANALYSIS_LIMITS.MAX_TEXT_LENGTH
          ? text.substring(0, ANALYSIS_LIMITS.MAX_TEXT_LENGTH) + "..."
          : text,
      hasTitle: !!$el.attr("title"),
    });
    count++;
  });

  return {
    items: links,
    totalCount: $("a").length,
    limited: count >= ANALYSIS_LIMITS.MAX_LINKS,
  };
}

function extractForms($: cheerio.CheerioAPI) {
  const forms: Array<{
    inputs: Array<{ type: string; hasLabel: boolean; hasId: boolean }>;
    hasFieldset: boolean;
  }> = [];
  let totalInputs = 0;

  $("form").each((_, formElement) => {
    const $form = $(formElement);
    const inputs: Array<{ type: string; hasLabel: boolean; hasId: boolean }> =
      [];

    $form.find("input, textarea, select").each((_, inputElement) => {
      if (totalInputs >= ANALYSIS_LIMITS.MAX_FORM_INPUTS) return false; // Stop iteration

      const $input = $(inputElement);
      const id = $input.attr("id");
      const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;

      inputs.push({
        type: $input.attr("type") || inputElement.tagName.toLowerCase(),
        hasLabel,
        hasId: !!id,
      });
      totalInputs++;
    });

    forms.push({
      inputs,
      hasFieldset: $form.find("fieldset").length > 0,
    });
  });

  return {
    items: forms,
    totalInputCount: $("form input, form textarea, form select").length,
    limited: totalInputs >= ANALYSIS_LIMITS.MAX_FORM_INPUTS,
  };
}

function extractAriaLabels($: cheerio.CheerioAPI) {
  const ariaElements: Array<{
    tag: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    role?: string;
  }> = [];
  let count = 0;

  $("[aria-label], [aria-labelledby], [role]").each((_, element) => {
    if (count >= ANALYSIS_LIMITS.MAX_ARIA_ELEMENTS) return false; // Stop iteration

    const $el = $(element);
    const ariaLabel = $el.attr("aria-label");

    ariaElements.push({
      tag: element.tagName.toLowerCase(),
      ariaLabel:
        ariaLabel && ariaLabel.length > ANALYSIS_LIMITS.MAX_TEXT_LENGTH
          ? ariaLabel.substring(0, ANALYSIS_LIMITS.MAX_TEXT_LENGTH) + "..."
          : ariaLabel,
      ariaLabelledby: $el.attr("aria-labelledby"),
      role: $el.attr("role"),
    });
    count++;
  });

  return {
    items: ariaElements,
    totalCount: $("[aria-label], [aria-labelledby], [role]").length,
    limited: count >= ANALYSIS_LIMITS.MAX_ARIA_ELEMENTS,
  };
}

function analyzeSemanticStructure($: cheerio.CheerioAPI) {
  return {
    hasMain: $("main").length > 0,
    hasNav: $("nav").length > 0,
    hasHeader: $("header").length > 0,
    hasFooter: $("footer").length > 0,
    hasAside: $("aside").length > 0,
    hasSection: $("section").length > 0,
    hasArticle: $("article").length > 0,
    skipLinks: $('a[href^="#"]').length,
  };
}

function analyzeKeyboardNavigation($: cheerio.CheerioAPI) {
  return {
    focusableElements: $("a, button, input, textarea, select, [tabindex]")
      .length,
    tabIndexElements: $("[tabindex]").length,
    negativeTabIndex: $('[tabindex="-1"]').length,
  };
}

async function extractProblematicElements(
  page: Page,
  $: cheerio.CheerioAPI
): Promise<{ items: ElementInfo[]; totalCount: number; limited: boolean }> {
  const elements: ElementInfo[] = [];

  try {
    // Check for images without alt text
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll("img"));
      return images
        .filter((img) => !img.hasAttribute("alt") || img.alt.trim() === "")
        .map((img, index) => {
          const rect = img.getBoundingClientRect();
          // Get absolute position for full page screenshot
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft;
          return {
            selector: `img:nth-of-type(${index + 1})`,
            text: img.src,
            issue: "Missing alt text",
            priority: "high" as const,
            boundingBox: {
              x: rect.x + scrollLeft,
              y: rect.y + scrollTop,
              width: rect.width,
              height: rect.height,
            },
          };
        })
        .filter(
          (item) => item.boundingBox.width > 0 && item.boundingBox.height > 0
        );
    });

    const inputsWithoutLabels = await page.evaluate(() => {
      const inputs = Array.from(
        document.querySelectorAll("input, textarea, select")
      );
      return inputs
        .filter((input) => {
          const hasLabel =
            input.id && document.querySelector(`label[for="${input.id}"]`);
          const hasAriaLabel = input.hasAttribute("aria-label");
          const hasAriaLabelledBy = input.hasAttribute("aria-labelledby");
          return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy;
        })
        .map((input, index) => {
          const rect = input.getBoundingClientRect();
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft;
          return {
            selector: `input:nth-of-type(${index + 1})`,
            text: (input as HTMLInputElement).placeholder || "Form input",
            issue: "Missing label",
            priority: "high" as const,
            boundingBox: {
              x: rect.x + scrollLeft,
              y: rect.y + scrollTop,
              width: rect.width,
              height: rect.height,
            },
          };
        })
        .filter(
          (item) => item.boundingBox.width > 0 && item.boundingBox.height > 0
        );
    });

    const linksWithoutText = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a"));
      return links
        .filter((link) => {
          const text = link.textContent?.trim() || "";
          const ariaLabel = link.getAttribute("aria-label") || "";
          const title = link.getAttribute("title") || "";
          return text === "" && ariaLabel === "" && title === "";
        })
        .map((link, index) => {
          const rect = link.getBoundingClientRect();
          // Get absolute position for full page screenshot
          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft;
          return {
            selector: `a:nth-of-type(${index + 1})`,
            text: link.href,
            issue: "Empty link text",
            priority: "medium" as const,
            boundingBox: {
              x: rect.x + scrollLeft,
              y: rect.y + scrollTop,
              width: rect.width,
              height: rect.height,
            },
          };
        })
        .filter(
          (item) => item.boundingBox.width > 0 && item.boundingBox.height > 0
        );
    });

    // Check for missing heading hierarchy
    const headingIssues = await page.evaluate(() => {
      const headings = Array.from(
        document.querySelectorAll("h1, h2, h3, h4, h5, h6")
      );
      const issues: any[] = [];

      let hasH1 = false;
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level === 1) hasH1 = true;

        const rect = heading.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Check if heading text is too generic
          const text = heading.textContent?.trim() || "";
          if (text.toLowerCase().match(/^(click here|read more|more|here)$/)) {
            // Get absolute position for full page screenshot
            const scrollTop =
              window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft =
              window.pageXOffset || document.documentElement.scrollLeft;
            issues.push({
              selector: `${heading.tagName.toLowerCase()}:nth-of-type(${
                index + 1
              })`,
              text: text,
              issue: "Non-descriptive heading",
              priority: "medium" as const,
              boundingBox: {
                x: rect.x + scrollLeft,
                y: rect.y + scrollTop,
                width: rect.width,
                height: rect.height,
              },
            });
          }
        }
      });

      return issues;
    });

    elements.push(...imagesWithoutAlt);
    elements.push(...inputsWithoutLabels);
    elements.push(...linksWithoutText);
    elements.push(...headingIssues);

    // Limit total problematic elements to prevent overwhelming the analysis
    const limitedElements = elements.slice(
      0,
      ANALYSIS_LIMITS.MAX_PROBLEMATIC_ELEMENTS
    );

    return {
      items: limitedElements,
      totalCount: elements.length,
      limited: elements.length > ANALYSIS_LIMITS.MAX_PROBLEMATIC_ELEMENTS,
    };
  } catch (error) {
    console.error("Error extracting problematic elements:", error);
    return { items: [], totalCount: 0, limited: false };
  }
}

async function addHighlightsToScreenshot(
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
