import { AnalysisIssues } from "@/components/analysis/analysis-issues";
import { AnalysisScreenshot } from "@/components/analysis/analysis-screenshot";
import { TechnicalDetails } from "@/components/analysis/technical-details";
import { UrlInput } from "@/components/analysis/url-input";
import { CreateTeam } from "@/components/team/create-team";
import { useAnalysis } from "@/hooks/useAnalysis";
import { AnalysisOverview } from "./analysis-overview";

export function AnalysisDashboard() {
  const { url, setUrl, loading, analysis, error, analyzeWebsite } =
    useAnalysis();

  return (
    <div className="space-y-6">
      <header className="flex flex-row justify-between items-center pb-4 w-full">
        <div>
          <h2 className="font-bold text-2xl">AI Accessibility Checker</h2>
          <p className="text-muted-foreground">
            Analyze websites for accessibility issues and UI/UX improvements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateTeam />
        </div>
      </header>

      <UrlInput
        url={url}
        onUrlChange={setUrl}
        onAnalyze={analyzeWebsite}
        loading={loading}
        error={error}
      />

      {analysis && (
        <div className="space-y-6">
          <AnalysisScreenshot
            screenshot={analysis.screenshot}
            problematicElements={analysis.problematicElements}
          />
          <AnalysisOverview summary={analysis.analysis.summary} />
          <AnalysisIssues
            issues={analysis.analysis.issues}
            overallScore={analysis.analysis.overallScore}
          />
          <TechnicalDetails rawData={analysis.rawData} />
        </div>
      )}
    </div>
  );
}
