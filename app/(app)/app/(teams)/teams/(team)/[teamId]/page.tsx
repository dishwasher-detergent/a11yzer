import { redirect } from "next/navigation";

import { TeamDescription } from "@/components/team/team-description";
import { TeamHeader } from "@/components/team/team-header";
import { TeamMembers } from "@/components/team/team-members";
import {
  ADMIN_ROLE,
  MEMBER_ROLE,
  OWNER_ROLE,
} from "@/constants/team.constants";
import { getCurrentUserRoles, getTeamById } from "@/lib/team";

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

  const { data: roles } = await getCurrentUserRoles(teamId);

  const isOwner = roles!.includes(OWNER_ROLE);
  const isAdmin = roles!.includes(ADMIN_ROLE);
  const isMember = roles!.includes(MEMBER_ROLE);

  return (
    <article className="space-y-6">
      <TeamHeader
        team={data}
        isOwner={isOwner}
        isAdmin={isAdmin}
        isMember={isMember}
      />
      <main className="px-4 space-y-6">
        <TeamDescription team={data} />
        <TeamMembers
          members={data.members ?? []}
          teamId={data.$id}
          isOwner={isOwner}
          isAdmin={isAdmin}
        />
      </main>
    </article>
  );
}
