"use client";

import { Query } from "appwrite";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useSession } from "@/hooks/userSession";
import { AnalysisDb } from "@/interfaces/analysis.interface";
import { getUserById } from "@/lib/auth";
import { ANALYSIS_COLLECTION_ID, DATABASE_ID } from "@/lib/constants";
import { listAnalysis } from "@/lib/db";
import { getTeamById } from "@/lib/team";
import { Models } from "node-appwrite";

interface Props {
  initialAnalysis?: Models.RowList<AnalysisDb>;
  teamId?: string;
  userId?: string;
  searchTerm?: string;
  limit?: number;
  cursor?: string;
}

export const useAnalysisList = ({
  initialAnalysis,
  teamId,
  userId,
  searchTerm,
  limit = 5,
  cursor,
}: Props) => {
  const [analysisList, setAnalysisList] = useState<AnalysisDb[]>(
    initialAnalysis?.rows ?? []
  );
  const [fetchLoading, setFetchLoading] = useState<boolean>(
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

  const loading = sessionLoading || fetchLoading;

  useEffect(() => {
    if (initialLoad) {
      if (initialAnalysis && initialAnalysis.rows.length > 0) {
        const lastDocument =
          initialAnalysis.rows[initialAnalysis.rows.length - 1];
        setNextCursor(lastDocument?.$id);
        setHasMore(initialAnalysis.rows.length === limit);

        return;
      }
    }

    const fetchAnalysis = async () => {
      setFetchLoading(true);

      try {
        const queries = [Query.orderDesc("$createdAt")];

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
            setAnalysisList((prev) => [...prev, ...(result.data?.rows || [])]);
          } else {
            setAnalysisList(result.data.rows);
          }

          const lastDocument = result.data.rows[result.data.rows.length - 1];

          setTotalAnalysis(result.data.total);
          setNextCursor(lastDocument?.$id);

          const updatedAnalysisList = cursor
            ? [...analysisList, ...(result.data?.rows || [])]
            : result.data.rows;

          setHasMore(
            updatedAnalysisList.length < result.data.total &&
              result.data.rows.length === limit
          );
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
        setFetchLoading(false);
      }
    };

    fetchAnalysis();
  }, [teamId, userId, searchTerm, limit, cursor, initialLoad]);

  useEffect(() => {
    if (searchTerm || cursor) {
      setInitialLoad(false);
    }
  }, [searchTerm, cursor]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (client) {
      unsubscribe = client.subscribe<AnalysisDb>(
        `databases.${DATABASE_ID}.collections.${ANALYSIS_COLLECTION_ID}.rows`,
        async (response) => {
          if (teamId && response.payload.teamId !== teamId) return;
          if (userId && response.payload.userId !== userId) return;

          if (searchTerm === undefined) {
            if (
              response.events.includes(
                "databases.*.collections.*.rows.*.create"
              )
            ) {
              const { data } = await getUserById(response.payload.userId);
              const { data: teamData } = await getTeamById(
                response.payload.teamId
              );

              setAnalysisList((prev) => [
                {
                  ...response.payload,
                  data: response.payload.data,
                  user: data,
                  team: teamData,
                },
                ...prev,
              ]);

              setTotalAnalysis((prev) => prev + 1);
            }

            if (
              response.events.includes(
                "databases.*.collections.*.rows.*.update"
              )
            ) {
              const { data } = await getUserById(response.payload.userId);
              const { data: teamData } = await getTeamById(
                response.payload.teamId
              );

              setAnalysisList((prev) =>
                prev.map((x) =>
                  x.$id === response.payload.$id
                    ? {
                        user: data,
                        ...response.payload,
                        team: teamData,
                        data: response.payload.data,
                      }
                    : x
                )
              );
            }

            if (
              response.events.includes(
                "databases.*.collections.*.rows.*.delete"
              )
            ) {
              setAnalysisList((prev) =>
                prev.filter((x) => x.$id !== response.payload.$id)
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

  return { analysisList, loading, hasMore, totalAnalysis, nextCursor };
};
