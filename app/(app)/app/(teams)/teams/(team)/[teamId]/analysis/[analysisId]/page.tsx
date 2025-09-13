import { redirect } from "next/navigation";

import { AnalysisView } from "@/components/analysis/view";
import { getAnalysisById } from "@/lib/db";
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

  const { data: analysisData } = await getAnalysisById(analysisId);

  return <AnalysisView data={analysisData} />;
}
