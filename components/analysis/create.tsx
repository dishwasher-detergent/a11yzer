"use client";

import GettingStarted from "@/components/analysis/getting-started";
import { AnalysisIssues } from "@/components/analysis/issues";
import { AnalysisLoader } from "@/components/analysis/loader";
import { AnalysisOverview } from "@/components/analysis/overview";
import { AnalysisProblematicElements } from "@/components/analysis/problematic-elements";
import { TechnicalDetails } from "@/components/analysis/technical-details";
import { UrlInput } from "@/components/analysis/url-input";
import { useAnalysisStreaming } from "@/hooks/useAnalysisStreaming";

interface AnalysisCreateProps {
  teamId: string;
  count: number;
}

export function AnalysisCreate({ teamId, count }: AnalysisCreateProps) {
  const {
    url,
    setUrl,
    loading,
    analysis,
    error,
    status,
    analyzeWebsite,
    cancelAnalysis,
    cached,
  } = useAnalysisStreaming(teamId);

  const currentCount = analysis?.count ?? count;

  return (
    <div className="h-full flex-1 flex flex-col flex-nowrap">
      {loading && status && <AnalysisLoader status={status} url={url} />}
      {!analysis && !loading && <GettingStarted />}
      {analysis && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 md:px-4 py-6 gap-4 grid grid-cols-1 lg:grid-cols-2">
          <AnalysisOverview summary={analysis.analysis.summary} />
          <TechnicalDetails accessibilityData={analysis.accessibilityData} />
          <AnalysisProblematicElements
            screenshotUrl={analysis.screenshotUrl}
            problematicElements={analysis.problematicElements}
          />
          <AnalysisIssues
            issues={analysis.analysis.issues}
            overallScore={analysis.analysis.overallScore}
          />
        </div>
      )}
      <div className="relative before:absolute before:top-0 before:h-px before:w-[200vw] before:bg-border before:-left-[100vw]">
        <UrlInput
          url={url}
          onUrlChange={setUrl}
          onAnalyze={analyzeWebsite}
          onCancel={cancelAnalysis}
          loading={loading}
          error={error}
          count={currentCount}
          cached={cached}
        />
      </div>
    </div>
  );
}
