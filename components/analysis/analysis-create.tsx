"use client";

import { AnalysisIssues } from "@/components/analysis/analysis-issues";
import { AnalysisScreenshot } from "@/components/analysis/analysis-screenshot";
import { TechnicalDetails } from "@/components/analysis/technical-details";
import { UrlInput } from "@/components/analysis/url-input";
import { useAnalysis } from "@/hooks/useAnalysis";
import { AnalysisOverview } from "./analysis-overview";

interface AnalysisCreateProps {
  teamId: string;
  count: number;
}

export function AnalysisCreate({ teamId, count }: AnalysisCreateProps) {
  const { url, setUrl, loading, analysis, error, analyzeWebsite } =
    useAnalysis(teamId);

  const currentCount = analysis?.count ?? count;

  return (
    <div className="h-dvh overflow-hidden flex flex-col flex-nowrap">
      <div className="flex-1 overflow-y-auto px-8">
        {analysis && (
          <>
            <AnalysisOverview summary={analysis.analysis.summary} />
            <AnalysisScreenshot
              screenshotUrl={analysis.screenshotUrl}
              problematicElements={analysis.problematicElements}
            />
            <AnalysisIssues
              issues={analysis.analysis.issues}
              overallScore={analysis.analysis.overallScore}
            />
            <TechnicalDetails accessibilityData={analysis.accessibilityData} />
          </>
        )}
      </div>
      <UrlInput
        url={url}
        onUrlChange={setUrl}
        onAnalyze={analyzeWebsite}
        loading={loading}
        error={error}
        count={currentCount}
      />
    </div>
  );
}
