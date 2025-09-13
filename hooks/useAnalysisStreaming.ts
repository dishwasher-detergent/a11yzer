import { useCallback, useRef, useState } from "react";

import { useLimitNotifications } from "@/hooks/useLimitNotifications";
import { MessageType } from "@/lib/analysis/response-utils";

export function useAnalysisStreaming(teamId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [cached, setCached] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const { showLimitNotifications } = useLimitNotifications();

  const analyzeWebsite = useCallback(
    async (url: string) => {
      if (!url || loading || isCancelling) return;

      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError("");
      setAiResponse("");
      setIsCancelling(false);
      setAnalysisId(null);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, teamId }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to analyze website");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("Failed to get response reader");
        }

        let buffer = "";

        while (true) {
          if (abortControllerRef.current?.signal.aborted) {
            reader.cancel();
            throw new Error("Analysis was cancelled");
          }

          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                switch (data.type) {
                  case MessageType.AI_CHUNK:
                    setAiResponse((prev) => prev + data.content);
                    break;

                  case MessageType.COUNT:
                    setCount(data.data);
                    break;

                  case MessageType.ANALYSIS_ID:
                    setAnalysisId(data.data);
                    break;

                  case MessageType.ERROR:
                    setError(data.message || "Failed to analyze website");
                    break;
                  case MessageType.CACHE:
                    setAiResponse(data.content);
                    setCached(true);
                    break;
                }
              } catch (parseError) {
                console.error("Failed to parse SSE data:", parseError);
              }
            }
          }
        }
      } catch (err) {
        if (abortControllerRef.current?.signal.aborted || isCancelling) {
          setError("Analysis was cancelled");
        } else if (err instanceof Error && err.name === "AbortError") {
          setError("Analysis was cancelled");
        } else {
          setError(
            "Failed to analyze website. Please check the URL and try again."
          );
        }
      } finally {
        setLoading(false);
        setIsCancelling(false);
        abortControllerRef.current = null;
      }
    },
    [teamId, showLimitNotifications]
  );

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current && !isCancelling) {
      setIsCancelling(true);
      abortControllerRef.current.abort();

      setTimeout(() => {
        setLoading(false);
        setError("Analysis was cancelled");
        setIsCancelling(false);
        setAnalysisId(null);
        abortControllerRef.current = null;
      }, 0);
    }
  }, [isCancelling]);

  const clearAnalysis = useCallback(() => {
    setError("");
    setAiResponse("");
    setIsCancelling(false);
    setAnalysisId(null);
  }, []);

  return {
    loading,
    error,
    aiResponse,
    isCancelling,
    analyzeWebsite,
    cancelAnalysis,
    clearAnalysis,
    cached,
    analysisId,
    count,
  };
}
