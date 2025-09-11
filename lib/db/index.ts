"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { ID, Models, Permission, Query, Role } from "node-appwrite";

import { AnalysisDb } from "@/interfaces/analysis.interface";
import { Result } from "@/interfaces/result.interface";
import { TeamData } from "@/interfaces/team.interface";
import { AnalysisUserStats, UserData } from "@/interfaces/user.interface";
import { withAuth } from "@/lib/auth";
import {
  ANALYSIS_COLLECTION_ID,
  ANALYSIS_USER_STATS_COLLECTION_ID,
  DATABASE_ID,
  MAX_ANALYSIS_LIMIT,
  TEAM_COLLECTION_ID,
  USER_COLLECTION_ID,
} from "@/lib/constants";
import { createAdminClient, createSessionClient } from "@/lib/server/appwrite";

/**
 * Get a list of analysis
 * @param {string[]} queries The queries to filter the analysis
 * @returns {Promise<Result<Models.RowList<AnalysisDb>>>} The list of analysis
 */
export async function listAnalysis(
  queries: string[] = []
): Promise<Result<Models.RowList<AnalysisDb>>> {
  return withAuth(async (user) => {
    const { table: database } = await createSessionClient();

    return unstable_cache(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (queries, userId) => {
        try {
          const analysis = await database.listRows<AnalysisDb>({
            databaseId: DATABASE_ID,
            tableId: ANALYSIS_COLLECTION_ID,
            queries,
          });

          if (analysis.rows.length === 0) {
            return {
              success: true,
              message: "No analysis found.",
              data: {
                ...analysis,
                rows: [],
              },
            };
          }

          const userIds = analysis.rows.map((a) => a.userId);
          const uniqueUserIds = Array.from(new Set(userIds));

          const teamIds = analysis.rows.map((a) => a.teamId);
          const uniqueTeamIds = Array.from(new Set(teamIds));

          const users = await database.listRows<UserData>({
            databaseId: DATABASE_ID,
            tableId: USER_COLLECTION_ID,
            queries: [
              Query.equal("$id", uniqueUserIds),
              Query.select(["$id", "name"]),
            ],
          });

          const teams = await database.listRows<TeamData>({
            databaseId: DATABASE_ID,
            tableId: TEAM_COLLECTION_ID,
            queries: [
              Query.equal("$id", uniqueTeamIds),
              Query.select(["$id", "name"]),
            ],
          });

          const userMap = users.rows.reduce<Record<string, UserData>>(
            (acc, user) => {
              if (user) {
                acc[user.$id] = user;
              }
              return acc;
            },
            {}
          );

          const teamMap = teams.rows.reduce<Record<string, TeamData>>(
            (acc, team) => {
              if (team) {
                acc[team.$id] = team;
              }
              return acc;
            },
            {}
          );

          const newAnalysis: AnalysisDb[] = analysis.rows.map((analysis) => ({
            ...analysis,
            data: analysis.data,
            user: userMap[analysis.userId],
            team: teamMap[analysis.teamId],
          }));

          const newRows = {
            ...analysis,
            rows: newAnalysis,
          };

          return {
            success: true,
            message: "Analysis successfully retrieved.",
            data: newRows,
          };
        } catch (err) {
          const error = err as Error;

          console.error(error);

          return {
            success: false,
            message: error.message,
          };
        }
      },
      [
        "analysis",
        `analysis:user-${user.$id}`,
        `analysis:${(() => {
          const queriesStr = queries.join("-");
          const encoded = Buffer.from(queriesStr).toString("base64");
          return encoded.length > 128 ? encoded.substring(0, 128) : encoded;
        })()}`,
      ],
      {
        tags: [
          "analysis",
          `analysis:user-${user.$id}`,
          `analysis:${(() => {
            const queriesStr = queries.join("-");
            const encoded = Buffer.from(queriesStr).toString("base64");
            return encoded.length > 128 ? encoded.substring(0, 128) : encoded;
          })()}`,
        ],
        revalidate: 600,
      }
    )(queries, user.$id);
  });
}

/**
 * Get a analysis by ID
 * @param {string} analysisId The ID of the analysis
 * @param {string[]} queries The queries to filter the analysis
 * @returns {Promise<Result<AnalysisDb>>} The analysis
 */
export async function getAnalysisById(
  analysisId: string,
  queries: string[] = []
): Promise<Result<AnalysisDb>> {
  return withAuth(async () => {
    const { table: database } = await createSessionClient();

    return unstable_cache(
      async () => {
        try {
          const analysis = await database.getRow<AnalysisDb>({
            databaseId: DATABASE_ID,
            tableId: ANALYSIS_COLLECTION_ID,
            rowId: analysisId,
            queries,
          });

          const userRes = await database.getRow<UserData>({
            databaseId: DATABASE_ID,
            tableId: USER_COLLECTION_ID,
            rowId: analysis.userId,
            queries: [Query.select(["$id", "name"])],
          });

          const teamRes = await database.getRow<TeamData>({
            databaseId: DATABASE_ID,
            tableId: TEAM_COLLECTION_ID,
            rowId: analysis.teamId,
            queries: [Query.select(["$id", "name"])],
          });

          return {
            success: true,
            message: "Analysis successfully retrieved.",
            data: {
              ...analysis,
              data: analysis.data,
              user: userRes,
              team: teamRes,
            },
          };
        } catch (err) {
          const error = err as Error;

          // This is where you would look to something like Splunk.
          console.error(error);

          return {
            success: false,
            message: error.message,
          };
        }
      },
      ["analysis", analysisId],
      {
        tags: ["analysis", `analysis:${analysisId}`],
        revalidate: 600,
      }
    )();
  });
}

/**
 * Create a analysis
 * @param {Object} params The parameters for creating a analysis
 * @param {string} [params.id] The ID of the analysis (optional)
 * @param {AddAnalysisFormData} params.data The analysis data
 * @param {string[]} [params.permissions] The permissions for the analysis (optional)
 * @returns {Promise<Result<Analysis>>} The created analysis
 */
export async function createAnalysis({
  id = ID.unique(),
  data,
  permissions = [],
}: {
  id?: string;
  data: {
    teamId: string;
    data: string;
    url: string;
    screenshot: string;
  };
  permissions?: string[];
}): Promise<Result<AnalysisDb>> {
  return withAuth(async (user) => {
    const { table: database } = await createSessionClient();
    const { table: adminDatabase } = await createAdminClient();

    permissions = [
      ...permissions,
      Permission.read(Role.user(user.$id)),
      Permission.write(Role.user(user.$id)),
      Permission.read(Role.team(data.teamId)),
    ];

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    try {
      const userStats = await database.listRows<AnalysisUserStats>({
        databaseId: DATABASE_ID,
        tableId: ANALYSIS_USER_STATS_COLLECTION_ID,
        queries: [
          Query.equal("userId", user.$id),
          Query.limit(1),
          Query.between(
            "$createdAt",
            startOfDay.toISOString(),
            endOfDay.toISOString()
          ),
        ],
      });

      if (userStats.rows[0]?.count >= MAX_ANALYSIS_LIMIT) {
        return {
          success: false,
          message: "Daily analysis limit reached.",
        };
      }

      const analysis = await database.createRow<AnalysisDb>({
        databaseId: DATABASE_ID,
        tableId: ANALYSIS_COLLECTION_ID,
        rowId: id,
        data: {
          ...data,
          url: data.url,
          userId: user.$id,
        },
        permissions,
      });

      if (userStats.rows.length === 0) {
        await adminDatabase.createRow<AnalysisUserStats>({
          databaseId: DATABASE_ID,
          tableId: ANALYSIS_USER_STATS_COLLECTION_ID,
          rowId: id,
          data: {
            userId: user.$id,
            count: 1,
          },
          permissions: [Permission.read(Role.user(user.$id))],
        });
      } else {
        await adminDatabase.incrementRowColumn({
          databaseId: DATABASE_ID,
          tableId: ANALYSIS_USER_STATS_COLLECTION_ID,
          rowId: userStats.rows[0].$id,
          column: "count",
          value: 1,
        });
      }

      const userRes = await database.getRow<UserData>({
        databaseId: DATABASE_ID,
        tableId: USER_COLLECTION_ID,
        rowId: analysis.userId,
        queries: [Query.select(["$id", "name"])],
      });

      const teamRes = await database.getRow<TeamData>({
        databaseId: DATABASE_ID,
        tableId: TEAM_COLLECTION_ID,
        rowId: analysis.teamId,
        queries: [Query.select(["$id", "name"])],
      });

      revalidateTag(`analysis:user-${user.$id}`);
      revalidateTag(`analysis:team-${analysis.teamId}`);
      revalidateTag(`user:${user.$id}`);

      return {
        success: true,
        message: "Analysis successfully created.",
        data: {
          ...analysis,
          user: userRes,
          team: teamRes,
        },
      };
    } catch (err) {
      const error = err as Error;

      console.error(error);

      return {
        success: false,
        message: error.message,
      };
    }
  });
}
