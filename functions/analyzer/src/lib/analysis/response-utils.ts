import { AccessibilityData } from '../../interfaces/analysis.interface.js';
import { AIAnalysisResult } from './ai-analyzer.js';
import { LimitsInfo } from './limits-info.js';

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
