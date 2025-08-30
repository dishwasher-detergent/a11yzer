import { AnalysisIssues } from "@/components/analysis/analysis-issues";
import { AnalysisScreenshot } from "@/components/analysis/analysis-screenshot";
import { TechnicalDetails } from "@/components/analysis/technical-details";
import { UrlInput } from "@/components/analysis/url-input";
import { useAnalysis } from "@/hooks/useAnalysis";
import { AnalysisOverview } from "./analysis-overview";

export function AnalysisDashboard() {
  const { url, setUrl, loading, analysis, error, analyzeWebsite } =
    useAnalysis();

  return (
    <div>
      <UrlInput
        url={url}
        onUrlChange={setUrl}
        onAnalyze={analyzeWebsite}
        loading={loading}
        error={error}
      />

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
  );
}
