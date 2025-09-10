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

  return (
    <div className="w-full h-full col-span-2 max-w-5xl mx-auto border-x justify-center flex flex-row flex-nowrap">
      <div className="h-full border-r flex-none bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] w-8" />
      <AnalysisCreate count={user.count!} teamId={teamId} />
      <div className="h-full border-l flex-none bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] w-8" />
    </div>
  );
}
