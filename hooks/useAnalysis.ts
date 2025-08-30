import { Models } from "node-appwrite";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useLimitNotifications } from "@/hooks/useLimitNotifications";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";
import { getAnalysisById, listAnalysis } from "@/lib/db";

export function useAnalysis(teamId: string) {
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
        body: JSON.stringify({ url, teamId }),
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

/**
 * Hook for fetching a list of analysis from the database
 * @param queries - Optional queries to filter the analysis
 * @returns Object with analysisList, loading state, and refetch function
 */
export function useAnalysisList(queries: string[] = []) {
  const [loading, setLoading] = useState<boolean>(true);
  const [analysisList, setAnalysisList] = useState<Models.DocumentList<
    AnalysisDb<AnalysisResult>
  > | null>(null);

  async function fetchAnalysisList() {
    setLoading(true);

    const data = await listAnalysis(queries);

    if (!data.success) {
      toast.error(data.message);
    }

    if (data?.data) {
      setAnalysisList(data.data);
    }
    setLoading(false);
  }

  const refetchAnalysisList = () => {
    fetchAnalysisList();
  };

  useEffect(() => {
    fetchAnalysisList();
  }, [JSON.stringify(queries)]);

  return {
    analysisList,
    loading,
    refetchAnalysisList,
  };
}

/**
 * Hook for fetching a single analysis by ID from the database
 * @param analysisId - The ID of the analysis to fetch
 * @param queries - Optional queries to modify the fetch
 * @returns Object with analysis, loading state, and refetch function
 */
export function useAnalysisById(analysisId: string, queries: string[] = []) {
  const [loading, setLoading] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<AnalysisDb<AnalysisResult> | null>(
    null
  );

  async function fetchAnalysis() {
    if (!analysisId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const data = await getAnalysisById(analysisId, queries);

    if (!data.success) {
      toast.error(data.message);
    }

    if (data?.data) {
      setAnalysis(data.data);
    }
    setLoading(false);
  }

  const refetchAnalysis = () => {
    fetchAnalysis();
  };

  useEffect(() => {
    fetchAnalysis();
  }, [analysisId, JSON.stringify(queries)]);

  return {
    analysis,
    loading,
    refetchAnalysis,
  };
}
