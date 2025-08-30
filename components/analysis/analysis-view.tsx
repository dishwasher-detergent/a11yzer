"use client";

import { AnalysisIssues } from "@/components/analysis/analysis-issues";
import { AnalysisScreenshot } from "@/components/analysis/analysis-screenshot";
import { TechnicalDetails } from "@/components/analysis/technical-details";
import { useAnalysisById } from "@/hooks/useAnalysis";
import { AnalysisOverview } from "./analysis-overview";

interface AnalysisViewProps {
  analysisId: string;
}

export function AnalysisView({ analysisId }: AnalysisViewProps) {
  const { loading, analysis } = useAnalysisById(analysisId);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {analysis && (
        <>
          <AnalysisOverview summary={analysis.data.analysis.summary} />
          <AnalysisScreenshot
            screenshotUrl={analysis.data.screenshotUrl}
            problematicElements={analysis.data.problematicElements}
          />
          <AnalysisIssues
            issues={analysis.data.analysis.issues}
            overallScore={analysis.data.analysis.overallScore}
          />
          <TechnicalDetails
            accessibilityData={analysis.data.accessibilityData}
          />
        </>
      )}
    </div>
  );
}
