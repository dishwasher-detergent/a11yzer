import { NextRequest, NextResponse } from "next/server";

import { UserData } from "@/interfaces/user.interface";
import { COOKIE_KEY, DATABASE_ID, USER_COLLECTION_ID } from "@/lib/constants";
import { createAdminClient } from "@/lib/server/appwrite";
import { Permission, Role } from "node-appwrite";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
    return NextResponse.redirect("/signin");
  }

  const { account, table: database, users } = await createAdminClient();
  const session = await account.createSession(userId, secret);
  const sessionUserId = session.userId;

  // Set the cookie in the response headers
  const response = NextResponse.redirect(`${request.nextUrl.origin}/app`);

  response.cookies.set(COOKIE_KEY, session.secret, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  });

  const user = await users.get(sessionUserId);

  try {
    await database.getRow<UserData>({
      databaseId: DATABASE_ID,
      tableId: USER_COLLECTION_ID,
      rowId: sessionUserId,
    });
  } catch {
    await database.createRow<UserData>({
      databaseId: DATABASE_ID,
      tableId: USER_COLLECTION_ID,
      rowId: sessionUserId,
      data: {
        name: user.name,
      },
      permissions: [
        Permission.read(Role.user(sessionUserId)),
        Permission.write(Role.user(sessionUserId)),
        Permission.read(Role.users()),
      ],
    });
  }

  return response;
}
