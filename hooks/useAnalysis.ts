import { useState } from "react";

import { useLimitNotifications } from "@/hooks/useLimitNotifications";
import { AnalysisResult } from "@/interfaces/analysis.interface";

export function useAnalysis() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const { showLimitNotifications } = useLimitNotifications();

  const analyzeWebsite = async () => {
    if (!url) return;

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze website");
      }

      const data = await response.json();

      setAnalysis(data.data);

      // Show limit notifications if any data was limited
      showLimitNotifications(data.limits);
    } catch (err) {
      setError(
        "Failed to analyze website. Please check the URL and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setError("");
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
    analyzeWebsite,
    clearAnalysis,
    clearError,
  };
}
