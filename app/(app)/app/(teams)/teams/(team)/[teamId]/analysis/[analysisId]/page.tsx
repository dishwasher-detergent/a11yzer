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

  return (
    <div className="w-full h-full col-span-2 max-w-5xl mx-auto border-x justify-center flex flex-row flex-nowrap">
      <div className="h-full border-r flex-none bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] w-8" />
      <AnalysisView data={analysisData} />
      <div className="h-full border-l flex-none bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] w-8" />
    </div>
  );
}
