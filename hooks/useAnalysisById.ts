import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";
import { getAnalysisById } from "@/lib/db";

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
