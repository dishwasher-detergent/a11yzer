import {
  Account,
  Client,
  Databases,
  ID,
  Models,
  Query,
  Storage,
} from 'node-appwrite';

import { AnalysisDb } from '../interfaces/analysis.interface.js';
import { Result } from '../interfaces/result.interface.js';
import { TeamData } from '../interfaces/team.interface.js';
import { AnalysisUserStats, UserData } from '../interfaces/user.interface.js';
import {
  ANALYSIS_COLLECTION_ID,
  ANALYSIS_USER_STATS_COLLECTION_ID,
  API_KEY,
  DATABASE_ID,
  ENDPOINT,
  MAX_ANALYSIS_LIMIT,
  PROJECT_ID,
  SCREENSHOT_BUCKET_ID,
  TEAM_COLLECTION_ID,
  USER_COLLECTION_ID,
} from './constants.js';

// Buckets
export const PROJECTS_BUCKET_ID = process.env.PROJECTS_BUCKET_ID as string;

export function createAdminClient() {
  const adminClient = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  return {
    client: adminClient,
    get database() {
      return new Databases(adminClient);
    },
    get storage() {
      return new Storage(adminClient);
    },
    get account() {
      return new Account(adminClient);
    },
  };
}

export function createSessionClient(jwt: string) {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setSession(jwt);

  return {
    client,
    get database() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get account() {
      return new Account(client);
    },
  };
}

export const database_service = {
  async createAnalysis({
    id = ID.unique(),
    data,
    permissions = [],
  }: {
    id?: string;
    data: {
      teamId: string;
      data: string;
      url: string;
    };
    permissions?: string[];
  }): Promise<Result<AnalysisDb<string>>> {
    // permissions = [
    //   ...permissions,
    //   Permission.read(Role.user(user.$id)),
    //   Permission.write(Role.user(user.$id)),
    //   Permission.read(Role.team(data.teamId)),
    // ];

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    try {
      const { database } = createAdminClient();
      const userStats = await database.listDocuments<AnalysisUserStats>(
        DATABASE_ID,
        ANALYSIS_USER_STATS_COLLECTION_ID,
        [
          Query.limit(1),
          Query.between(
            '$createdAt',
            startOfDay.toISOString(),
            endOfDay.toISOString()
          ),
        ]
      );

      if (userStats.documents[0]?.count >= MAX_ANALYSIS_LIMIT) {
        return {
          success: false,
          message: 'Daily analysis limit reached.',
        };
      }

      const analysis = await database.createDocument<AnalysisDb<string>>(
        DATABASE_ID,
        ANALYSIS_COLLECTION_ID,
        id,
        {
          ...data,
          url: data.url,
          userId: '1234', //user.$id,
        },
        permissions
      );

      if (userStats.documents.length === 0) {
        await database.createDocument<AnalysisUserStats>(
          DATABASE_ID,
          ANALYSIS_USER_STATS_COLLECTION_ID,
          id,
          {
            userId: '1234', //user.$id,
            count: 1,
          }
        );
      } else {
        await database.incrementDocumentAttribute(
          DATABASE_ID,
          ANALYSIS_USER_STATS_COLLECTION_ID,
          userStats.documents[0].$id,
          'count',
          1
        );
      }

      const userRes = await database.getDocument<UserData>(
        DATABASE_ID,
        USER_COLLECTION_ID,
        analysis.userId,
        [Query.select(['$id', 'name'])]
      );

      const teamRes = await database.getDocument<TeamData>(
        DATABASE_ID,
        TEAM_COLLECTION_ID,
        analysis.teamId,
        [Query.select(['$id', 'name'])]
      );

      return {
        success: true,
        message: 'Analysis successfully created.',
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
  },
  async getUserData(id: string) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    try {
      const { database } = createAdminClient();
      const data = await database.getDocument<UserData>(
        DATABASE_ID,
        USER_COLLECTION_ID,
        id
      );

      const userStats = await database.listDocuments<AnalysisUserStats>(
        DATABASE_ID,
        ANALYSIS_USER_STATS_COLLECTION_ID,
        [
          Query.equal('userId', id),
          Query.limit(1),
          Query.between(
            '$createdAt',
            startOfDay.toISOString(),
            endOfDay.toISOString()
          ),
        ]
      );

      return {
        success: true,
        message: 'Products successfully retrieved.',
        data: {
          ...data,
          count: userStats.documents[0]?.count || 0,
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
};

export const storage_service = {
  async uploadScreenshotImage({
    id = ID.unique(),
    data,
    permissions = [],
  }: {
    id?: string;
    data: File;
    permissions?: string[];
  }): Promise<Result<Models.File>> {
    permissions = [
      // ...permissions,
      // Permission.read(Role.user(user.$id)),
      // Permission.write(Role.user(user.$id)),
      // Permission.read(Role.any()),
    ];

    try {
      const { storage } = createAdminClient();
      const response = await storage.createFile(
        SCREENSHOT_BUCKET_ID,
        id,
        data,
        permissions
      );

      return {
        success: true,
        message: 'Screenshot image uploaded successfully.',
        data: response,
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
};
