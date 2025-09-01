import { NextResponse } from "next/server";

import { AccessibilityData } from "@/interfaces/analysis.interface";
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
