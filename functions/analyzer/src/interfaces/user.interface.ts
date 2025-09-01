import { Models } from "node-appwrite";

export interface UserData extends Models.Document {
  name: string;
  about?: string;
  count?: number;
}

export interface UserMemberData extends UserData {
  roles: string[];
  confirmed: boolean;
  joinedAt: string;
}

export interface User extends Models.User<Models.Preferences>, UserData {}

export interface AnalysisUserStats extends Models.Document {
  userId: string;
  count: number;
}
