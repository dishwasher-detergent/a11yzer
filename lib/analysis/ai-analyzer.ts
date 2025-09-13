import OpenAI from "openai";

import {
  AccessibilityData,
  AriaElement,
  Form,
  Heading,
  Image,
  LimitedData,
  Link,
} from "@/interfaces/analysis.interface";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export interface AIAnalysisResult {
  markdown: string;
}

export async function* analyzeWithAIStreaming(
  accessibilityData: AccessibilityData
): AsyncGenerator<string, AIAnalysisResult, unknown> {
  const createDataSummary = <T>(
    data: LimitedData<T>,
    label: string
  ): string => {
    if (data.limited) {
      return `${label} (showing first ${data.items.length} of ${data.totalCount} total - data limited to prevent prompt overflow)`;
    }
    return label;
  };

  const prompt = `
You are an experienced accessibility specialist and product designer. Evaluate the provided page data for WCAG 2.1 AA compliance and high-leverage UI/UX improvements.

---
# Inputs (page snapshot)
Use ONLY the data below—do not invent details that aren't present. If something is missing, treat it as "Unknown" and proceed.

Title: ${accessibilityData.title}

${createDataSummary<Heading>(accessibilityData.headings, "Headings")}:
${accessibilityData.headings.items
  .map((h) => `${h.level}: ${h.text}`)
  .join("\n")}

${createDataSummary<Image>(accessibilityData.images, "Images")}:
${accessibilityData.images.items
  .map((img) => `Alt: "${img.alt}", Src: ${img.src}`)
  .join("\n")}

${createDataSummary<Link>(accessibilityData.links, "Links")}:
${accessibilityData.links.items
  .map((link) => `Text: "${link.text}", Href: ${link.href}`)
  .join("\n")}

${createDataSummary<Form>(accessibilityData.forms, "Forms")}:
${accessibilityData.forms.items
  .map(
    (form) =>
      `Inputs: ${form.inputs
        .map((input) => `${input.type} (hasLabel: ${input.hasLabel})`)
        .join(", ")}, HasFieldset: ${form.hasFieldset}`
  )
  .join("\n")}

${createDataSummary<AriaElement>(
  accessibilityData.ariaLabels,
  "ARIA Elements"
)}:
${accessibilityData.ariaLabels.items
  .map(
    (aria) =>
      `Tag: ${aria.tag}, Role: ${aria.role || "none"}, Label: ${
        aria.ariaLabel || "none"
      }`
  )
  .join("\n")}

Semantic Structure:
- Main: ${accessibilityData.semanticStructure.hasMain ? "Yes" : "No"}
- Nav: ${accessibilityData.semanticStructure.hasNav ? "Yes" : "No"}
- Header: ${accessibilityData.semanticStructure.hasHeader ? "Yes" : "No"}
- Footer: ${accessibilityData.semanticStructure.hasFooter ? "Yes" : "No"}

Keyboard Navigation:
- Focusable Elements: ${accessibilityData.keyboardNavigation.focusableElements}
- Tab Index Elements: ${accessibilityData.keyboardNavigation.tabIndexElements}
- Negative Tab Index: ${accessibilityData.keyboardNavigation.negativeTabIndex}

---
# Output format (Markdown only)
Return a well-structured markdown document with the following sections:

## Overall Score: [0-100]

## Summary
[One paragraph summary, ≤ 300 characters]

## Issues Found

For each issue, use this format:
### [Issue Title]
**Type:** {% badge variant="accessibility" %} accessibility {% /badge %} {% badge variant="ui" %} ui {% /badge %} {% badge variant="ux" %} ux {% /badge %}  
**Priority:** {% badge variant="critical" %} critical {% /badge %} {% badge variant="high" %} high {% /badge %} {% badge variant="medium" %} medium {% /badge %} | {% badge variant="low" %} low {% /badge %}  
**WCAG Criterion:** [Name](url)

{% description %}
[Detailed explanation of the issue]
{% /description %}

{% recommendation %}
[Actionable steps to fix]
{% /recommendation %}

IMPORTANT: Ensure ALL markdoc components are properly closed with their closing tags ({% /description %}, {% /recommendation %}, {% /badge %}).

---

Output only the markdown — no JSON, no code blocks.

---
# Scoring rubric
Start at 100, subtract:
- Critical: -12
- High: -7
- Medium: -3
- Low: -1
Bound score to [0, 100].

---
# High-signal checks to prioritize
Accessibility: landmarks, heading hierarchy, labels, link purpose, keyboard order, forms, images, live regions.
UI: hit target sizes, spacing rhythm, affordances, visual hierarchy.
UX: navigation clarity, form UX, task clarity, reducing cognitive load.`;

  const stream = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an experienced accessibility specialist and product designer. Evaluate the provided page data for WCAG 2.1 AA compliance and high-leverage UI/UX improvements. Return your analysis in markdown format. CRITICAL: Always ensure ALL markdoc components are properly closed with their corresponding closing tags (e.g., {% badge %} must be closed with {% /badge %}, {% description %} with {% /description %}, {% recommendation %} with {% /recommendation %}).",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
  });

  let fullResponse = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      fullResponse += content;
      yield content;
    }
  }

  return {
    markdown:
      fullResponse ||
      "# Analysis Failed\n\nFailed to generate analysis report.",
  };
}
