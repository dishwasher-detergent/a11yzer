import { redirect } from "next/navigation";

import { AnalysisView } from "@/components/analysis/analysis-view";
import { setLastVisitedTeam } from "@/lib/auth";
import { getTeamById } from "@/lib/team";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string; analysisId: string }>;
}) {
  const { teamId, analysisId } = await params;
  const { data, success } = await getTeamById(teamId);

  if (!success || !data) {
    redirect("/app");
  }

  await setLastVisitedTeam(teamId);

  return <AnalysisView analysisId={analysisId} />;
}
