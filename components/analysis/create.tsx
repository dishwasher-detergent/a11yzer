"use client";

import { UrlInput } from "@/components/analysis/url-input";
import { useAnalysisStreaming } from "@/hooks/useAnalysisStreaming";
import { Markdown } from "../markdown";
import GettingStarted from "./getting-started";

interface AnalysisCreateProps {
  teamId: string;
  count: number;
}

export function AnalysisCreate({ teamId, count }: AnalysisCreateProps) {
  const {
    loading,
    error,
    analyzeWebsite,
    cancelAnalysis,
    cached,
    count: newCount,
    aiResponse,
  } = useAnalysisStreaming(teamId);

  const currentCount = newCount ?? count;

  return (
    <section className="h-full flex-1 flex flex-col flex-nowrap overflow-hidden">
      <main className="h-full flex-1 w-full overflow-y-auto p-4">
        {aiResponse.length === 0 && !loading && <GettingStarted />}
        {aiResponse && <Markdown content={aiResponse} />}
        {loading && <p aria-live="polite">Thinking...</p>}
      </main>
      <footer className="flex-none w-full p-4">
        <UrlInput
          onAnalyze={analyzeWebsite}
          onCancel={cancelAnalysis}
          loading={loading}
          error={error}
          count={currentCount}
          cached={cached}
        />
      </footer>
    </section>
  );
}
