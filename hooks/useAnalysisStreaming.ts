import { useCallback, useRef, useState } from "react";

import { useLimitNotifications } from "@/hooks/useLimitNotifications";
import { AnalysisResult } from "@/interfaces/analysis.interface";

export interface StreamingStatus {
  step: number;
  totalSteps: number;
  message: string;
}

export function useAnalysisStreaming(teamId: string) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<StreamingStatus | null>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cached, setCached] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { showLimitNotifications } = useLimitNotifications();

  const analyzeWebsite = useCallback(async () => {
    if (!url || loading || isCancelling) return;

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError("");
    setAnalysis(null);
    setStatus(null);
    setAiResponse("");
    setIsStreaming(false);
    setIsCancelling(false);

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
                case "status":
                  setStatus({
                    step: data.step,
                    totalSteps: data.totalSteps,
                    message: data.message,
                  });
                  break;

                case "ai_chunk":
                  if (!isStreaming) {
                    setIsStreaming(true);
                    setAiResponse("");
                  }
                  setAiResponse((prev) => prev + data.content);
                  break;

                case "complete":
                  setAnalysis(data.data);
                  setStatus(null);
                  setIsStreaming(false);
                  setCached(data.cached || false);

                  if (data.data.limits) {
                    showLimitNotifications(data.data.limits);
                  }
                  break;

                case "error":
                  setError(data.message || "Failed to analyze website");
                  setStatus(null);
                  setIsStreaming(false);
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
      setStatus(null);
      setIsStreaming(false);
    } finally {
      setLoading(false);
      setIsCancelling(false);
      abortControllerRef.current = null;
    }
  }, [url, teamId, showLimitNotifications, isStreaming, loading, isCancelling]);

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current && !isCancelling) {
      setIsCancelling(true);
      abortControllerRef.current.abort();

      // Immediately reset states
      setTimeout(() => {
        setLoading(false);
        setStatus(null);
        setIsStreaming(false);
        setError("Analysis was cancelled");
        setIsCancelling(false);
        abortControllerRef.current = null;
      }, 0);
    }
  }, [isCancelling]);

  const clearAnalysis = () => {
    setAnalysis(null);
    setError("");
    setStatus(null);
    setAiResponse("");
    setIsStreaming(false);
    setIsCancelling(false);
  };

  const clearError = () => {
    setError("");
  };

  return {
    url,
    setUrl,
    loading,
    analysis,
    error,
    status,
    aiResponse,
    isStreaming,
    isCancelling,
    analyzeWebsite,
    cancelAnalysis,
    clearAnalysis,
    clearError,
    cached,
  };
}
