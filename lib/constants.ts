export const HOSTNAME = process.env.NEXT_PUBLIC_ROOT_DOMAIN as string;

export const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
export const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string;
export const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID as string;
export const API_KEY = process.env.APPWRITE_API_KEY as string;

// Collections
export const USER_COLLECTION_ID = process.env
  .NEXT_PUBLIC_USER_COLLECTION_ID as string;
export const TEAM_COLLECTION_ID = process.env
  .NEXT_PUBLIC_TEAM_COLLECTION_ID as string;
export const ANALYSIS_COLLECTION_ID = process.env
  .NEXT_PUBLIC_ANALYSIS_COLLECTION_ID as string;
export const ANALYSIS_USER_STATS_COLLECTION_ID = process.env
  .NEXT_PUBLIC_ANALYSIS_USER_STATS_COLLECTION_ID as string;

// Buckets
export const SCREENSHOT_BUCKET_ID = process.env
  .NEXT_PUBLIC_SCREENSHOT_BUCKET_ID as string;

// Cookie
export const COOKIE_KEY = `a_session_${PROJECT_ID}`;

// Additional
export const MAX_TEAM_LIMIT =
  Number(process.env.NEXT_PUBLIC_MAX_TEAM_LIMIT) || 3;
export const MAX_ANALYSIS_LIMIT =
  Number(process.env.NEXT_PUBLIC_MAX_ANALYSIS_LIMIT) || 5;

export const ANALYSIS_LIMITS = {
  MAX_HEADINGS: 20,
  MAX_IMAGES: 30,
  MAX_LINKS: 25,
  MAX_FORM_INPUTS: 15,
  MAX_ARIA_ELEMENTS: 20,
  MAX_PROBLEMATIC_ELEMENTS: 30,
  MAX_TEXT_LENGTH: 200,
} as const;
