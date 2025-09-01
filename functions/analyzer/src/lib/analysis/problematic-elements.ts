import * as cheerio from 'cheerio';
import { Page } from 'puppeteer';

import {
  ElementInfo,
  LimitedData,
} from '../../interfaces/analysis.interface.js';
import { ANALYSIS_LIMITS } from '../constants.js';

export async function extractProblematicElements(
  page: Page,
  $: cheerio.CheerioAPI
): Promise<LimitedData<ElementInfo>> {
  const elements: ElementInfo[] = [];
  let count = 0;

  // Function to truncate text
  const truncateText = (
    text: string,
    maxLength: number = ANALYSIS_LIMITS.MAX_TEXT_LENGTH
  ): string => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  // Get bounding box for element
  const getBoundingBox = async (selector: string) => {
    try {
      const element = await page.$(selector);
      if (element) {
        const box = await element.boundingBox();
        if (box) {
          return {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
          };
        }
      }
    } catch {
      console.error('Error getting bounding box');
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  };

  // Check for images without alt text
  for (const img of $('img').toArray()) {
    if (count >= ANALYSIS_LIMITS.MAX_PROBLEMATIC_ELEMENTS) break;

    const $img = $(img);
    const alt = $img.attr('alt');
    const src = $img.attr('src') || '';

    if (!alt || alt.trim() === '') {
      const selector = `img[src*="${src.split('/').pop()}"]`;
      const boundingBox = await getBoundingBox(selector);

      elements.push({
        selector,
        text: truncateText(src),
        issue: 'Missing alt text for image',
        priority: 'high',
        boundingBox,
      });
      count++;
    }
  }

  // Check for links without descriptive text
  for (const link of $('a').toArray()) {
    if (count >= ANALYSIS_LIMITS.MAX_PROBLEMATIC_ELEMENTS) break;

    const $link = $(link);
    const text = $link.text().trim();
    const href = $link.attr('href') || '';

    if (
      text === '' ||
      text.toLowerCase() === 'click here' ||
      text.toLowerCase() === 'read more'
    ) {
      const selector = href ? `a[href="${href}"]` : `a:contains("${text}")`;
      const boundingBox = await getBoundingBox(selector);

      elements.push({
        selector,
        text: truncateText(text || href),
        issue: 'Link lacks descriptive text',
        priority: 'medium',
        boundingBox,
      });
      count++;
    }
  }

  // Check for form inputs without labels
  for (const input of $('input, textarea, select').toArray()) {
    if (count >= ANALYSIS_LIMITS.MAX_PROBLEMATIC_ELEMENTS) break;

    const $input = $(input);
    const id = $input.attr('id');
    const name = $input.attr('name');
    const type = $input.attr('type') || 'text';

    // Skip buttons and hidden inputs
    if (type === 'button' || type === 'submit' || type === 'hidden') continue;

    const hasLabel = id && $(`label[for="${id}"]`).length > 0;
    const hasAriaLabel = $input.attr('aria-label');
    const hasAriaLabelledBy = $input.attr('aria-labelledby');

    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      const selector = id
        ? `#${id}`
        : name
        ? `[name="${name}"]`
        : `${$input.prop('tagName')?.toLowerCase()}[type="${type}"]`;
      const boundingBox = await getBoundingBox(selector);

      elements.push({
        selector,
        text: truncateText(name || type),
        issue: 'Form input lacks proper labeling',
        priority: 'high',
        boundingBox,
      });
      count++;
    }
  }

  // Check for missing heading structure
  const headings = $('h1, h2, h3, h4, h5, h6').toArray();
  let lastLevel = 0;

  for (const heading of headings) {
    if (count >= ANALYSIS_LIMITS.MAX_PROBLEMATIC_ELEMENTS) break;

    const $heading = $(heading);
    const level = parseInt($heading.prop('tagName')?.charAt(1) || '1');

    if (level > lastLevel + 1) {
      const id = $heading.attr('id') || '';
      const text = $heading.text();
      const selector = id
        ? `#${id}`
        : `${$heading
            .prop('tagName')
            ?.toLowerCase()}:contains("${text.substring(0, 20)}")`;
      const boundingBox = await getBoundingBox(selector);

      elements.push({
        selector,
        text: truncateText(text),
        issue: `Heading level skipped (H${lastLevel} to H${level})`,
        priority: 'medium',
        boundingBox,
      });
      count++;
    }
    lastLevel = level;
  }

  const totalElements = $(
    'img, a, input, textarea, select, h1, h2, h3, h4, h5, h6'
  ).length;
  const limited = count >= ANALYSIS_LIMITS.MAX_PROBLEMATIC_ELEMENTS;

  return {
    items: elements,
    totalCount: totalElements,
    limited,
  };
}
