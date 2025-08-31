"use client";

import { Models, Query } from "node-appwrite";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useSession } from "@/hooks/userSession";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";
import { getUserById } from "@/lib/auth";
import { ANALYSIS_COLLECTION_ID, DATABASE_ID } from "@/lib/constants";
import { listAnalysis } from "@/lib/db";
import { getTeamById } from "@/lib/team";

interface Props {
  initialAnalysis?: Models.DocumentList<AnalysisDb<AnalysisResult>>;
  teamId?: string;
  userId?: string;
  searchTerm?: string;
  limit?: number;
  cursor?: string;
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
}: Props) {
  const [analysisList, setAnalysisList] = useState<
    AnalysisDb<AnalysisResult>[]
  >(initialAnalysis?.documents ?? []);
  const [loading, setLoading] = useState<boolean>(
    initialAnalysis ? false : true
  );
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalAnalysis, setTotalAnalysis] = useState<number>(
    initialAnalysis?.total ?? 0
  );
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [initialLoad, setInitialLoad] = useState<boolean>(
    !!initialAnalysis && !cursor && !searchTerm
  );

  const { client, loading: sessionLoading } = useSession();

  useEffect(() => {
    setLoading(sessionLoading);
  }, [sessionLoading]);

  useEffect(() => {
    if (initialLoad) {
      if (initialAnalysis && initialAnalysis.documents.length > 0) {
        const lastDocument =
          initialAnalysis.documents[initialAnalysis.documents.length - 1];
        setNextCursor(lastDocument?.$id);
        setHasMore(initialAnalysis.documents.length === limit);
      }
      return;
    }

    const fetchAnalysisList = async () => {
      setLoading(true);

      try {
        const queries = [Query.orderDesc("$createdAt")];

        // Add team or user filter
        if (teamId) {
          queries.push(Query.equal("teamId", teamId));
        }
        if (userId) {
          queries.push(Query.equal("userId", userId));
        }

        if (searchTerm && searchTerm.trim() !== "") {
          queries.push(Query.search("url", searchTerm));
        }

        queries.push(Query.limit(limit));

        if (cursor) {
          queries.push(Query.cursorAfter(cursor));
        }

        const result = await listAnalysis(queries);

        if (result.success && result.data) {
          if (cursor) {
            setAnalysisList((prev) => [
              ...prev,
              ...(result.data?.documents || []),
            ]);
          } else {
            setAnalysisList(result.data.documents);
          }

          setTotalAnalysis(result.data.total);

          const lastDocument =
            result.data.documents[result.data.documents.length - 1];
          setNextCursor(lastDocument?.$id);

          setHasMore(result.data.documents.length === limit);
        } else {
          toast.error(result.message);
          if (!cursor) {
            setAnalysisList([]);
          }
          setHasMore(false);
          setNextCursor(undefined);
        }
      } catch (error) {
        if (!cursor) {
          setAnalysisList([]);
        }
        setHasMore(false);
        setNextCursor(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisList();
  }, [teamId, userId, searchTerm, limit, cursor, initialLoad]);

  useEffect(() => {
    if (searchTerm || cursor) {
      setInitialLoad(false);
    }
  }, [searchTerm, cursor]);

  const refetchAnalysisList = () => {
    setInitialLoad(false);
    setNextCursor(undefined);
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (client) {
      unsubscribe = client.subscribe<AnalysisDb<string>>(
        `databases.${DATABASE_ID}.collections.${ANALYSIS_COLLECTION_ID}.documents`,
        async (response) => {
          if (teamId && response.payload.teamId !== teamId) return;
          if (userId && response.payload.userId !== userId) return;

          if (searchTerm === undefined) {
            if (
              response.events.includes(
                "databases.*.collections.*.documents.*.create"
              )
            ) {
              const { data: userData } = await getUserById(
                response.payload.userId
              );
              const { data: teamData } = await getTeamById(
                response.payload.teamId
              );

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
              const { data: userData } = await getUserById(
                response.payload.userId
              );
              const { data: teamData } = await getTeamById(
                response.payload.teamId
              );

              const updatedAnalysis = {
                ...response.payload,
                data: JSON.parse(response.payload.data) as AnalysisResult,
                user: userData,
                team: teamData,
              };

              setAnalysisList((prev) =>
                prev.map((analysis) =>
                  analysis.$id === response.payload.$id
                    ? updatedAnalysis
                    : analysis
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
          }
        }
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [client, teamId, userId, searchTerm]);

  return {
    analysisList,
    loading,
    hasMore,
    totalAnalysis,
    nextCursor,
    refetchAnalysisList,
  };
}

/**
 * Backward compatibility hook for the old API
 * @param queries - Optional queries to filter the analysis
 * @param teamId - Optional team ID to filter by and enable realtime updates
 * @param userId - Optional user ID to filter by and enable realtime updates
 * @returns Object with analysisList (in old format), loading state, and refetch function
 */
export function useAnalysisListOld(
  queries: string[] = [],
  teamId?: string,
  userId?: string
) {
  const { analysisList, loading, refetchAnalysisList } = useAnalysisList({
    teamId,
    userId,
    limit: 5,
  });

  const analysisListOldFormat = {
    documents: analysisList,
    total: analysisList.length,
  };

  return {
    analysisList: analysisListOldFormat,
    loading,
    refetchAnalysisList,
  };
}
