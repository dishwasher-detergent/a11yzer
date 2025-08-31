import { redirect } from "next/navigation";

import { AnalysisCreate } from "@/components/analysis/create";
import { getUserData } from "@/lib/auth";
import { getTeamById } from "@/lib/team";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const { data, success } = await getTeamById(teamId);
  const { data: user } = await getUserData();

  if (!success || !data || !user) {
    redirect("/app");
  }

  return <AnalysisCreate count={user.count!} teamId={teamId} />;
}
