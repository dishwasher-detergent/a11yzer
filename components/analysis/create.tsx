"use client";

import { UrlInput } from "@/components/analysis/url-input";
import { useAnalysisStreaming } from "@/hooks/useAnalysisStreaming";
import { LucideLoader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "../markdown";
import { Badge } from "../ui/badge";
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
  const mainRef = useRef<HTMLElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const lastScrollHeightRef = useRef(0);

  useEffect(() => {
    if (shouldAutoScroll && mainRef.current && aiResponse) {
      const scrollElement = mainRef.current;
      const newScrollHeight = scrollElement.scrollHeight;

      if (newScrollHeight > lastScrollHeightRef.current) {
        scrollElement.scrollTop = newScrollHeight;
        lastScrollHeightRef.current = newScrollHeight;
      }
    }
  }, [aiResponse, shouldAutoScroll]);

  const handleScroll = () => {
    if (!mainRef.current) return;

    const scrollElement = mainRef.current;
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10; // 10px tolerance

    if (!isAtBottom && shouldAutoScroll) {
      setShouldAutoScroll(false);
    } else if (isAtBottom && !shouldAutoScroll) {
      setShouldAutoScroll(true);
    }
  };

  useEffect(() => {
    if (loading) {
      setShouldAutoScroll(true);
      lastScrollHeightRef.current = 0;
    }
  }, [loading]);

  return (
    <article className="h-full flex-1 flex flex-col flex-nowrap overflow-hidden py-4">
      <main
        ref={mainRef}
        className="h-full flex-1 overflow-y-auto [scrollbar-gutter:stable_both-edges]"
        onScroll={handleScroll}
      >
        {aiResponse.length === 0 && !loading && <GettingStarted />}
        {aiResponse && <Markdown content={aiResponse} />}
        {loading && (
          <div className="max-w-5xl mx-auto pt-4">
            <Badge variant="secondary">
              <LucideLoader2 className="animate-spin mr-2" />
              Analyzing
            </Badge>
          </div>
        )}
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
