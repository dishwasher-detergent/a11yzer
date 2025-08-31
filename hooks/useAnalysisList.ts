"use client";

import { Models, Query } from "node-appwrite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useSession } from "@/hooks/userSession";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";
import { getUserById } from "@/lib/auth";
import { ANALYSIS_COLLECTION_ID, DATABASE_ID } from "@/lib/constants";
import { listAnalysis } from "@/lib/db";
import { getTeamById } from "@/lib/team";

interface UseAnalysisListProps {
  initialAnalysis?: Models.DocumentList<AnalysisDb<AnalysisResult>>;
  teamId?: string;
  userId?: string;
  searchTerm?: string;
  limit?: number;
  cursor?: string;
}

interface UseAnalysisListReturn {
  analysisList: AnalysisDb<AnalysisResult>[];
  loading: boolean;
  analysisLoading: boolean;
  sessionLoading: boolean;
  hasMore: boolean;
  totalAnalysis: number;
  nextCursor: string | undefined;
  refetchAnalysisList: () => void;
  error: string | null;
}

/**
 * Hook for fetching a list of analysis from the database with cursor pagination
 * @param initialAnalysis - Optional initial analysis data
 * @param teamId - Optional team ID to filter by and enable realtime updates
 * @param userId - Optional user ID to filter by and enable realtime updates
 * @param searchTerm - Optional search term to filter analysis
 * @param limit - Number of items per page (default: 5)
 * @param cursor - Cursor for pagination
 * @returns Object with analysisList, loading state, pagination info, and refetch function
 */
export function useAnalysisList({
  initialAnalysis,
  teamId,
  userId,
  searchTerm,
  limit = 5,
  cursor,
}: UseAnalysisListProps): UseAnalysisListReturn {
  const [analysisList, setAnalysisList] = useState<
    AnalysisDb<AnalysisResult>[]
  >(initialAnalysis?.documents ?? []);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(
    !initialAnalysis
  );
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalAnalysis, setTotalAnalysis] = useState<number>(
    initialAnalysis?.total ?? 0
  );
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup and optimization
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const { client, loading: sessionLoading } = useSession();

  // Memoized values
  const loading = useMemo(
    () => sessionLoading || analysisLoading,
    [sessionLoading, analysisLoading]
  );

  const shouldFetch = useMemo(
    () => !initialAnalysis || !!cursor || !!searchTerm,
    [initialAnalysis, cursor, searchTerm]
  );

  // Memoized queries builder
  const buildQueries = useCallback(() => {
    const queries = [Query.orderDesc("$createdAt")];

    if (teamId) queries.push(Query.equal("teamId", teamId));
    if (userId) queries.push(Query.equal("userId", userId));
    if (searchTerm?.trim()) queries.push(Query.search("url", searchTerm));

    queries.push(Query.limit(limit));
    if (cursor) queries.push(Query.cursorAfter(cursor));

    return queries;
  }, [teamId, userId, searchTerm, limit, cursor]);

  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`useAnalysisList ${context}:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    setError(errorMessage);
    toast.error(errorMessage);
  }, []);

  const fetchAnalysisList = useCallback(async () => {
    if (!shouldFetch || !mountedRef.current) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setAnalysisLoading(true);
    setError(null);

    try {
      const queries = buildQueries();
      const result = await listAnalysis(queries);

      if (!mountedRef.current) return;

      if (result.success && result.data) {
        const documents = result.data.documents || [];

        if (cursor) {
          setAnalysisList((prev) => [...prev, ...documents]);
        } else {
          setAnalysisList(documents);
        }

        setTotalAnalysis(result.data.total);
        setHasMore(documents.length === limit);

        const lastDocument = documents[documents.length - 1];
        setNextCursor(lastDocument?.$id);
      } else {
        handleError(new Error(result.message), "fetch");
        if (!cursor) {
          setAnalysisList([]);
        }
        setHasMore(false);
        setNextCursor(undefined);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      if (err instanceof Error && err.name === "AbortError") return;

      handleError(err, "fetch");
      if (!cursor) {
        setAnalysisList([]);
      }
      setHasMore(false);
      setNextCursor(undefined);
    } finally {
      if (mountedRef.current) {
        setAnalysisLoading(false);
      }
    }
  }, [shouldFetch, buildQueries, cursor, limit, handleError]);

  useEffect(() => {
    if (initialAnalysis && !cursor && !searchTerm) {
      const lastDocument =
        initialAnalysis.documents[initialAnalysis.documents.length - 1];
      setNextCursor(lastDocument?.$id);
      setHasMore(initialAnalysis.documents.length === limit);
    }
  }, [initialAnalysis, cursor, searchTerm, limit]);

  useEffect(() => {
    fetchAnalysisList();
  }, [fetchAnalysisList]);

  const refetchAnalysisList = useCallback(() => {
    setNextCursor(undefined);
    fetchAnalysisList();
  }, [fetchAnalysisList]);

  useEffect(() => {
    if (!client || searchTerm !== undefined) return;

    let unsubscribe: (() => void) | undefined;

    const userCache = new Map<string, any>();
    const teamCache = new Map<string, any>();

    const getCachedUserData = async (userId: string) => {
      if (userCache.has(userId)) {
        return userCache.get(userId);
      }
      const { data } = await getUserById(userId);
      userCache.set(userId, data);
      return data;
    };

    const getCachedTeamData = async (teamId: string) => {
      if (teamCache.has(teamId)) {
        return teamCache.get(teamId);
      }
      const { data } = await getTeamById(teamId);
      teamCache.set(teamId, data);
      return data;
    };

    const handleRealtimeUpdate = async (response: any) => {
      if (!mountedRef.current) return;

      if (teamId && response.payload.teamId !== teamId) return;
      if (userId && response.payload.userId !== userId) return;

      try {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          const [userData, teamData] = await Promise.all([
            getCachedUserData(response.payload.userId),
            getCachedTeamData(response.payload.teamId),
          ]);

          const newAnalysis = {
            ...response.payload,
            data: JSON.parse(response.payload.data) as AnalysisResult,
            user: userData,
            team: teamData,
          };

          setAnalysisList((prev) => [newAnalysis, ...prev]);
          setTotalAnalysis((prev) => prev + 1);
        }

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.update"
          )
        ) {
          const [userData, teamData] = await Promise.all([
            getCachedUserData(response.payload.userId),
            getCachedTeamData(response.payload.teamId),
          ]);

          const updatedAnalysis = {
            ...response.payload,
            data: JSON.parse(response.payload.data) as AnalysisResult,
            user: userData,
            team: teamData,
          };

          setAnalysisList((prev) =>
            prev.map((analysis) =>
              analysis.$id === response.payload.$id ? updatedAnalysis : analysis
            )
          );
        }

        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.delete"
          )
        ) {
          setAnalysisList((prev) =>
            prev.filter((analysis) => analysis.$id !== response.payload.$id)
          );
          setTotalAnalysis((prev) => prev - 1);
        }
      } catch (err) {
        handleError(err, "realtime update");
      }
    };

    unsubscribe = client.subscribe<AnalysisDb<string>>(
      `databases.${DATABASE_ID}.collections.${ANALYSIS_COLLECTION_ID}.documents`,
      handleRealtimeUpdate
    );

    return () => {
      if (unsubscribe) unsubscribe();
      userCache.clear();
      teamCache.clear();
    };
  }, [client, teamId, userId, searchTerm, handleError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    analysisList,
    loading,
    analysisLoading,
    sessionLoading,
    hasMore,
    totalAnalysis,
    nextCursor,
    refetchAnalysisList,
    error,
  };
}
