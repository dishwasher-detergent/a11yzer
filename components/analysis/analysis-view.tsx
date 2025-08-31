"use client";

import { AnalysisIssues } from "@/components/analysis/analysis-issues";
import { AnalysisScreenshot } from "@/components/analysis/analysis-screenshot";
import { TechnicalDetails } from "@/components/analysis/technical-details";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";
import { AnalysisOverview } from "./analysis-overview";

interface AnalysisViewProps {
  data?: AnalysisDb<AnalysisResult>;
}

export function AnalysisView({ data }: AnalysisViewProps) {
  return (
    <div className="relative">
      {data && (
        <>
          <AnalysisOverview summary={data.data.analysis.summary} />
          <AnalysisScreenshot
            screenshotUrl={data.data.screenshotUrl}
            problematicElements={data.data.problematicElements}
          />
          <AnalysisIssues
            issues={data.data.analysis.issues}
            overallScore={data.data.analysis.overallScore}
          />
          <TechnicalDetails accessibilityData={data.data.accessibilityData} />
        </>
      )}
    </div>
  );
}
