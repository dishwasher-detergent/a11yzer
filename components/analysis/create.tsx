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

  console.log(aiResponse);

  const currentCount = newCount ?? count;

  return (
    <article className="h-full flex-1 flex flex-col flex-nowrap overflow-hidden py-4">
      <main className="h-full flex-1 overflow-y-auto [scrollbar-gutter:stable_both-edges]">
        {aiResponse.length === 0 && !loading && <GettingStarted />}
        {aiResponse && <Markdown content={aiResponse} />}
        {loading && <p aria-live="polite">Thinking...</p>}
      </main>
      <footer className="flex-none w-full px-4 pt-4">
        <UrlInput
          onAnalyze={analyzeWebsite}
          onCancel={cancelAnalysis}
          loading={loading}
          error={error}
          count={currentCount}
          cached={cached}
        />
      </footer>
    </article>
  );
}
