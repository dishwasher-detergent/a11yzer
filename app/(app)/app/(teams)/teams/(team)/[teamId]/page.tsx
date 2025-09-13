import { redirect } from "next/navigation";
import { Query } from "node-appwrite";

import { AnalysisHistory } from "@/components/analysis/history";
import { setLastVisitedTeam } from "@/lib/auth";
import { listAnalysis } from "@/lib/db";
import { getTeamById } from "@/lib/team";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { data, success } = await getTeamById(teamId);

  if (!success || !data) {
    redirect("/app");
  }

  await setLastVisitedTeam(teamId);

  const { data: analysisData } = await listAnalysis([
    Query.equal("teamId", teamId),
    Query.orderDesc("$createdAt"),
    Query.limit(5),
  ]);

  return (
    <main className="p-4 overflow-y-auto max-w-5xl mx-auto w-full">
      <AnalysisHistory initialData={analysisData} teamId={teamId} />
    </main>
  );
}
