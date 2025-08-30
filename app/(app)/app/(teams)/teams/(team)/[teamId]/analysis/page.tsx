import { redirect } from "next/navigation";

import { AnalysisCreate } from "@/components/analysis/analysis-create";
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

  return <AnalysisCreate teamId={teamId} />;
}
