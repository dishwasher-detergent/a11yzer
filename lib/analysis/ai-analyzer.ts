import OpenAI from "openai";

import { AccessibilityData } from "@/interfaces/analysis.interface";

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

  try {
    return JSON.parse(aiResponse || "{}");
  } catch (e) {
    return {
      overallScore: 50,
      issues: [],
      summary: "Failed to parse AI response",
    };
  }
}
