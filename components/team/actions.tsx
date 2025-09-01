import { TeamData } from "@/interfaces/team.interface";
import { DeleteTeam } from "./delete";
import { EditTeam } from "./edit";
import { InviteTeam } from "./invite";
import { LeaveTeam } from "./leave";

interface TeamActionsProps {
  data: TeamData;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

export function TeamActions({
  data,
  isOwner,
  isAdmin,
  isMember,
}: TeamActionsProps) {
  return (
    <div>
      <h3 className="font-semibold text-base mb-2">Actions</h3>
      <div className="flex flex-row gap-1">
        {!isOwner && <LeaveTeam team={data} />}
        {isMember && <InviteTeam team={data} />}
        {(isOwner || isAdmin) && <EditTeam team={data} />}
        {isOwner && <DeleteTeam team={data} />}
      </div>
    </div>
  );
}
