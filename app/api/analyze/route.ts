import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import puppeteer from "puppeteer";

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

    // Launch puppeteer to capture page content and screenshot
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to the page
    await page.goto(url, { waitUntil: "networkidle2" });

    // Get page HTML
    const html = await page.content();

    // Take screenshot
    const screenshot = await page.screenshot({
      encoding: "base64",
      fullPage: false, // Only visible area for better AI analysis
    });

    await browser.close();

    // Parse HTML with cheerio for accessibility analysis
    const $ = cheerio.load(html);

    // Extract accessibility-related information
    const accessibilityData = {
      title: $("title").text() || "No title found",
      headings: extractHeadings($),
      images: extractImages($),
      links: extractLinks($),
      forms: extractForms($),
      ariaLabels: extractAriaLabels($),
      colorContrast: await analyzeColorContrast($),
      semanticStructure: analyzeSemanticStructure($),
      keyboardNavigation: analyzeKeyboardNavigation($),
    };

    // Prepare AI prompt
    const prompt = `
Analyze this webpage for accessibility issues and UI/UX improvements. Here's the data:

Title: ${accessibilityData.title}
Headings: ${JSON.stringify(accessibilityData.headings, null, 2)}
Images: ${JSON.stringify(accessibilityData.images, null, 2)}
Links: ${JSON.stringify(accessibilityData.links, null, 2)}
Forms: ${JSON.stringify(accessibilityData.forms, null, 2)}
ARIA Labels: ${JSON.stringify(accessibilityData.ariaLabels, null, 2)}
Semantic Structure: ${JSON.stringify(
      accessibilityData.semanticStructure,
      null,
      2
    )}

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

    // Get AI analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
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
      max_tokens: 2000,
      temperature: 0.3,
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

    return NextResponse.json({
      url,
      screenshot: `data:image/png;base64,${screenshot}`,
      analysis,
      rawData: accessibilityData,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze webpage" },
      { status: 500 }
    );
  }
}

// Helper functions for accessibility analysis
function extractHeadings($: cheerio.CheerioAPI) {
  const headings: Array<{ level: string; text: string; hasId: boolean }> = [];
  $("h1, h2, h3, h4, h5, h6").each((_, element) => {
    const $el = $(element);
    headings.push({
      level: element.tagName.toLowerCase(),
      text: $el.text().trim(),
      hasId: !!$el.attr("id"),
    });
  });
  return headings;
}

function extractImages($: cheerio.CheerioAPI) {
  const images: Array<{
    src: string;
    alt: string | undefined;
    hasAlt: boolean;
  }> = [];
  $("img").each((_, element) => {
    const $el = $(element);
    const alt = $el.attr("alt");
    images.push({
      src: $el.attr("src") || "",
      alt: alt || "",
      hasAlt: alt !== undefined,
    });
  });
  return images;
}

function extractLinks($: cheerio.CheerioAPI) {
  const links: Array<{ href: string; text: string; hasTitle: boolean }> = [];
  $("a").each((_, element) => {
    const $el = $(element);
    links.push({
      href: $el.attr("href") || "",
      text: $el.text().trim(),
      hasTitle: !!$el.attr("title"),
    });
  });
  return links;
}

function extractForms($: cheerio.CheerioAPI) {
  const forms: Array<{
    inputs: Array<{ type: string; hasLabel: boolean; hasId: boolean }>;
    hasFieldset: boolean;
  }> = [];

  $("form").each((_, formElement) => {
    const $form = $(formElement);
    const inputs: Array<{ type: string; hasLabel: boolean; hasId: boolean }> =
      [];

    $form.find("input, textarea, select").each((_, inputElement) => {
      const $input = $(inputElement);
      const id = $input.attr("id");
      const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;

      inputs.push({
        type: $input.attr("type") || inputElement.tagName.toLowerCase(),
        hasLabel,
        hasId: !!id,
      });
    });

    forms.push({
      inputs,
      hasFieldset: $form.find("fieldset").length > 0,
    });
  });

  return forms;
}

function extractAriaLabels($: cheerio.CheerioAPI) {
  const ariaElements: Array<{
    tag: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
    role?: string;
  }> = [];

  $("[aria-label], [aria-labelledby], [role]").each((_, element) => {
    const $el = $(element);
    ariaElements.push({
      tag: element.tagName.toLowerCase(),
      ariaLabel: $el.attr("aria-label"),
      ariaLabelledby: $el.attr("aria-labelledby"),
      role: $el.attr("role"),
    });
  });

  return ariaElements;
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

async function analyzeColorContrast($: cheerio.CheerioAPI) {
  // This is a simplified analysis - in a real implementation,
  // you'd need to extract computed styles and calculate actual contrast ratios
  return {
    note: "Color contrast analysis requires computed styles - recommend manual testing with tools like WebAIM Color Contrast Checker",
  };
}
