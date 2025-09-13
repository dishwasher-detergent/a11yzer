import { redirect } from "next/navigation";
import { Query } from "node-appwrite";

import { AnalysisHistory } from "@/components/analysis/history";
import { UserActions } from "@/components/user/actions";
import { UserDescription } from "@/components/user/description";
import { getLoggedInUser, getUserById } from "@/lib/auth";
import { listAnalysis } from "@/lib/db";

export default async function ProfilePage() {
  const user = await getLoggedInUser();

  if (!user) {
    redirect("/app");
  }

  const { data } = await getUserById(user.$id);

  if (!data) {
    redirect("/app");
  }

  const { data: analysisData } = await listAnalysis([
    Query.equal("userId", user.$id),
    Query.orderDesc("$createdAt"),
    Query.limit(5),
  ]);

  return (
    <main className="p-4 space-y-6 overflow-y-auto">
      <UserDescription user={data} />
      <UserActions user={data} />
      <section>
        <AnalysisHistory initialData={analysisData} userId={user.$id} />
      </section>
    </main>
  );
}
