import { Models } from "node-appwrite";

import { UserMemberData } from "@/interfaces/user.interface";

export interface TeamData extends Models.Row {
  about: string;
  name: string;
  members?: UserMemberData[];
  description?: string;
}
