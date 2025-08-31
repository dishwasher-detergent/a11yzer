"use client";

import { AnalysisIssues } from "@/components/analysis/analysis-issues";
import { AnalysisProblematicElements } from "@/components/analysis/analysis-problematic-elements";
import { TechnicalDetails } from "@/components/analysis/technical-details";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";
import { AnalysisOverview } from "./analysis-overview";

interface AnalysisViewProps {
  data?: AnalysisDb<AnalysisResult>;
}

export function AnalysisView({ data }: AnalysisViewProps) {
  return (
    <div className="relative p-4 grid grid-cols-1 lg:grid-cols-2">
      {data && (
        <>
          <AnalysisOverview summary={data.data.analysis.summary} />
          <AnalysisProblematicElements
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
