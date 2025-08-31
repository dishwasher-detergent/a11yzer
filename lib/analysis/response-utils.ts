import { NextResponse } from "next/server";

import {
  AccessibilityData,
  ElementInfo,
  LimitedData,
} from "@/interfaces/analysis.interface";
import { AIAnalysisResult } from "./ai-analyzer";
import { LimitsInfo } from "./limits-info";

export interface AnalysisResponse {
  success: boolean;
  data?: {
    url: string;
    accessibilityData: AccessibilityData;
    analysis: AIAnalysisResult;
    screenshotUrl: string;
    limitsInfo: LimitsInfo;
    count: number;
  };
  error?: string;
}

export function createSuccessResponse(data: {
  url: string;
  accessibilityData: AccessibilityData;
  problematicElements: LimitedData<ElementInfo>;
  analysis: AIAnalysisResult;
  screenshotUrl: string;
  limitsInfo: LimitsInfo;
  count: number;
}): NextResponse<AnalysisResponse> {
  const {
    url,
    accessibilityData,
    problematicElements,
    analysis,
    screenshotUrl,
    limitsInfo,
    count,
  } = data;

  return NextResponse.json({
    success: true,
    data: {
      url,
      accessibilityData,
      problematicElements,
      analysis,
      screenshotUrl,
      limitsInfo,
      count,
    },
  });
}

export function createErrorResponse(
  error: string,
  status: number = 500
): NextResponse<AnalysisResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function createValidationErrorResponse(
  message: string
): NextResponse<AnalysisResponse> {
  return createErrorResponse(message, 400);
}

export function handleAnalysisError(
  error: unknown
): NextResponse<AnalysisResponse> {
  console.error("Analysis error:", error);

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes("timeout")) {
      return createErrorResponse(
        "Request timeout - the page took too long to load",
        408
      );
    }

    if (error.message.includes("navigation")) {
      return createErrorResponse("Unable to navigate to the provided URL", 400);
    }

    if (error.message.includes("OpenAI")) {
      return createErrorResponse(
        "AI analysis service is temporarily unavailable",
        503
      );
    }

    return createErrorResponse(error.message);
  }

  return createErrorResponse("An unexpected error occurred during analysis");
}
