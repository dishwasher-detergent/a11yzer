import * as cheerio from "cheerio";
import { Page as LocalPage } from "puppeteer";
import { Page } from "puppeteer-core";

import {
  AccessibilityData,
  AriaElement,
  FormData,
  HeadingData,
  ImageData,
  KeyboardNavigation,
  LimitedData,
  LinkData,
  SemanticStructure,
} from "@/interfaces/analysis.interface";
import { ANALYSIS_LIMITS } from "@/lib/constants";

// Main function to extract all accessibility data
export async function extractAccessibilityData(
  page: Page | LocalPage
): Promise<AccessibilityData> {
  try {
    // Check if page is still connected
    if (page.isClosed()) {
      throw new Error("Page is closed or disconnected");
    }

    const html = await page.content();
    const $ = cheerio.load(html);

    const title = $("title").text() || "No title found";

    return {
      title,
      headings: extractHeadings($),
      images: extractImages($),
      links: extractLinks($),
      forms: extractForms($),
      ariaLabels: extractAriaLabels($),
      semanticStructure: analyzeSemanticStructure($),
      keyboardNavigation: analyzeKeyboardNavigation($),
    };
  } catch (error) {
    console.error("Error extracting accessibility data:", error);
    // Return minimal data structure in case of errors
    return {
      title: "Error: Could not extract page data",
      headings: { items: [], totalCount: 0, limited: false },
      images: { items: [], totalCount: 0, limited: false },
      links: { items: [], totalCount: 0, limited: false },
      forms: { items: [], totalCount: 0, limited: false },
      ariaLabels: { items: [], totalCount: 0, limited: false },
      semanticStructure: {
        hasMain: false,
        hasNav: false,
        hasHeader: false,
        hasFooter: false,
        hasAside: false,
        hasSection: false,
        hasArticle: false,
        skipLinks: 0,
      },
      keyboardNavigation: {
        focusableElements: 0,
        tabIndexElements: 0,
        negativeTabIndex: 0,
      },
    };
  }
}

export function extractHeadings(
  $: cheerio.CheerioAPI
): LimitedData<HeadingData> {
  const headings: HeadingData[] = [];
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

export function extractImages($: cheerio.CheerioAPI): LimitedData<ImageData> {
  const images: ImageData[] = [];
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

export function extractLinks($: cheerio.CheerioAPI): LimitedData<LinkData> {
  const links: LinkData[] = [];
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

export function extractForms($: cheerio.CheerioAPI): LimitedData<FormData> {
  const forms: FormData[] = [];
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
    totalCount: $("form input, form textarea, form select").length,
    limited: totalInputs >= ANALYSIS_LIMITS.MAX_FORM_INPUTS,
  };
}

export function extractAriaLabels(
  $: cheerio.CheerioAPI
): LimitedData<AriaElement> {
  const ariaElements: AriaElement[] = [];
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

export function analyzeSemanticStructure(
  $: cheerio.CheerioAPI
): SemanticStructure {
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

export function analyzeKeyboardNavigation(
  $: cheerio.CheerioAPI
): KeyboardNavigation {
  return {
    focusableElements: $("a, button, input, textarea, select, [tabindex]")
      .length,
    tabIndexElements: $("[tabindex]").length,
    negativeTabIndex: $('[tabindex="-1"]').length,
  };
}
