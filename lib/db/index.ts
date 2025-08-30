"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { ID, Models, Permission, Query, Role } from "node-appwrite";

import { AnalysisDb } from "@/interfaces/analysis.interface";
import { Result } from "@/interfaces/result.interface";
import { TeamData } from "@/interfaces/team.interface";
import { UserData } from "@/interfaces/user.interface";
import { withAuth } from "@/lib/auth";
import {
  ANALYSIS_COLLECTION_ID,
  DATABASE_ID,
  TEAM_COLLECTION_ID,
  USER_COLLECTION_ID,
} from "@/lib/constants";
import { createSessionClient } from "@/lib/server/appwrite";

/**
 * Get a list of analysis
 * @param {string[]} queries The queries to filter the analysis
 * @returns {Promise<Result<Models.DocumentList<AnalysisDb>>>} The list of analysis
 */
export async function listAnalysis(
  queries: string[] = []
): Promise<Result<Models.DocumentList<AnalysisDb>>> {
  return withAuth(async (user) => {
    const { database } = await createSessionClient();

    return unstable_cache(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (queries, userId) => {
        try {
          const analysis = await database.listDocuments<AnalysisDb>(
            DATABASE_ID,
            ANALYSIS_COLLECTION_ID,
            queries
          );

          const userIds = analysis.documents.map((a) => a.userId);
          const uniqueUserIds = Array.from(new Set(userIds));

          const teamIds = analysis.documents.map((a) => a.teamId);
          const uniqueTeamIds = Array.from(new Set(teamIds));

          const users = await database.listDocuments<UserData>(
            DATABASE_ID,
            USER_COLLECTION_ID,
            [
              Query.equal("$id", uniqueUserIds),
              Query.select(["$id", "name", "avatar"]),
            ]
          );

          const teams = await database.listDocuments<TeamData>(
            DATABASE_ID,
            TEAM_COLLECTION_ID,
            [
              Query.equal("$id", uniqueTeamIds),
              Query.select(["$id", "name", "avatar"]),
            ]
          );

          const userMap = users.documents.reduce<Record<string, UserData>>(
            (acc, user) => {
              if (user) {
                acc[user.$id] = user;
              }
              return acc;
            },
            {}
          );

          const teamMap = teams.documents.reduce<Record<string, TeamData>>(
            (acc, team) => {
              if (team) {
                acc[team.$id] = team;
              }
              return acc;
            },
            {}
          );

          const newAnalysis = analysis.documents.map((analysis) => ({
            ...analysis,
            data: JSON.parse(analysis.data),
            user: userMap[analysis.userId],
            team: teamMap[analysis.teamId],
          }));

          analysis.documents = newAnalysis;

          return {
            success: true,
            message: "Analysis successfully retrieved.",
            data: analysis,
          };
        } catch (err) {
          const error = err as Error;

          return {
            success: false,
            message: error.message,
          };
        }
      },
      ["analysis"],
      {
        tags: [
          "analysis",
          `analysis:${queries.join("-")}`,
          `analysis:user-${user.$id}`,
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
    const { database } = await createSessionClient();

    return unstable_cache(
      async () => {
        try {
          const analysis = await database.getDocument<AnalysisDb>(
            DATABASE_ID,
            ANALYSIS_COLLECTION_ID,
            analysisId,
            queries
          );

          const userRes = await database.getDocument<UserData>(
            DATABASE_ID,
            USER_COLLECTION_ID,
            analysis.userId,
            [Query.select(["$id", "name"])]
          );

          const teamRes = await database.getDocument<TeamData>(
            DATABASE_ID,
            TEAM_COLLECTION_ID,
            analysis.teamId,
            [Query.select(["$id", "name"])]
          );

          return {
            success: true,
            message: "Analysis successfully retrieved.",
            data: {
              ...analysis,
              data: JSON.parse(analysis.data),
              user: userRes,
              team: teamRes,
            },
          };
        } catch (err) {
          const error = err as Error;

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
  };
  permissions?: string[];
}): Promise<Result<AnalysisDb>> {
  return withAuth(async (user) => {
    const { database } = await createSessionClient();

    permissions = [
      ...permissions,
      Permission.read(Role.user(user.$id)),
      Permission.write(Role.user(user.$id)),
      Permission.read(Role.team(data.teamId)),
    ];

    try {
      const analysis = await database.createDocument<AnalysisDb>(
        DATABASE_ID,
        ANALYSIS_COLLECTION_ID,
        id,
        {
          ...data,
          userId: user.$id,
        },
        permissions
      );

      const userRes = await database.getDocument<UserData>(
        DATABASE_ID,
        USER_COLLECTION_ID,
        analysis.userId,
        [Query.select(["$id", "name", "avatar"])]
      );

      const teamRes = await database.getDocument<TeamData>(
        DATABASE_ID,
        TEAM_COLLECTION_ID,
        analysis.teamId,
        [Query.select(["$id", "name", "avatar"])]
      );

      revalidateTag("analysis");

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
