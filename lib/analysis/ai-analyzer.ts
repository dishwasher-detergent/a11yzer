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
  overallScore: number;
  issues: Array<{
    type: "accessibility" | "ux" | "ui";
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    recommendation: string;
    wcagCriterion?: string;
  }>;
  summary: string;
}

export async function analyzeWithAI(
  accessibilityData: AccessibilityData
): Promise<AIAnalysisResult> {
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
Analyze this webpage for accessibility issues and UI/UX improvements. Here's the data:

Title: ${accessibilityData.title}

${createDataSummary<Heading>(
  accessibilityData.headings,
  "Headings"
)}: ${JSON.stringify(accessibilityData.headings.items, null, 2)}

${createDataSummary<Image>(
  accessibilityData.images,
  "Images"
)}: ${JSON.stringify(accessibilityData.images.items, null, 2)}

${createDataSummary<Link>(accessibilityData.links, "Links")}: ${JSON.stringify(
    accessibilityData.links.items,
    null,
    2
  )}

${createDataSummary<Form>(accessibilityData.forms, "Forms")}: ${JSON.stringify(
    accessibilityData.forms.items,
    null,
    2
  )}

${createDataSummary<AriaElement>(
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

  try {
    return JSON.parse(aiResponse || "{}");
  } catch {
    return {
      overallScore: 50,
      issues: [],
      summary: "Failed to parse AI response",
    };
  }
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
Analyze this webpage for accessibility issues and UI/UX improvements, group these issues into these categories: accessibility, ui, ux. Here's the data:

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

Please respond with a JSON object containing:
- overallScore: number (0-100)
- issues: array of objects with type, priority (lowercase), title, description, recommendation, and optional wcagCriterion
- summary: string (brief overview of the analysis)

Focus on:
1. WCAG 2.1 AA compliance
2. User experience improvements
3. UI best practices
4. Semantic HTML usage
5. Keyboard navigation
6. Screen reader compatibility

Make your analysis thorough but concise.
`;

  const stream = await openai.chat.completions.create({
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

  try {
    return JSON.parse(fullResponse);
  } catch {
    return {
      overallScore: 50,
      issues: [],
      summary: "Failed to parse AI response",
    };
  }
}
