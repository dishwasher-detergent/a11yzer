import { redirect } from "next/navigation";
import { Query } from "node-appwrite";

import { AnalysisHistory } from "@/components/analysis/analysis-history";
import { UserActions } from "@/components/user/user-actions";
import { UserDescription } from "@/components/user/user-description";
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
  ]);

  return (
    <main className="p-4 space-y-6">
      <UserDescription user={data} />
      <UserActions user={data} />
      <AnalysisHistory data={analysisData?.documents} />
    </main>
  );
}
