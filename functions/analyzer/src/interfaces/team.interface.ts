import { Models } from 'node-appwrite';

import { UserMemberData } from './user.interface.js';

export interface TeamData extends Models.Document {
  about: string;
  name: string;
  members?: UserMemberData[];
  description?: string;
}
