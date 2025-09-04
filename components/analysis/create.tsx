"use client";

import GettingStart from "@/components/analysis/getting-started";
import { AnalysisIssues } from "@/components/analysis/issues";
import { AnalysisOverview } from "@/components/analysis/overview";
import { AnalysisProblematicElements } from "@/components/analysis/problematic-elements";
import { TechnicalDetails } from "@/components/analysis/technical-details";
import { UrlInput } from "@/components/analysis/url-input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
    <div className="h-full overflow-hidden flex flex-col flex-nowrap">
      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-6 gap-4 grid grid-cols-1 lg:grid-cols-2 overflow-x-hidden">
        {analysis ? (
          <>
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
          </>
        ) : (
          <GettingStart />
        )}
      </div>
      {loading && status && (
        <div className="mx-12 p-2 border border-b-0 rounded-t-md bg-secondary z-10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Analysis Progress</p>
            <Badge variant="secondary">
              Step {status.step} of {status.totalSteps}
            </Badge>
          </div>
          <div className="space-y-2">
            <Progress value={(status.step / status.totalSteps) * 100} />
            <p className="text-xs text-muted-foreground">{status.message}</p>
          </div>
        </div>
      )}
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
  );
}
