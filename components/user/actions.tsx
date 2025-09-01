import { EditProfile } from "@/components/user/edit-profile";
import { UserData } from "@/interfaces/user.interface";

interface UserActionsProps {
  user: UserData;
}

export function UserActions({ user }: UserActionsProps) {
  return (
    <div>
      <h3 className="font-semibold text-base mb-2">Actions</h3>
      <div className="flex flex-row gap-1">
        <EditProfile user={user} />
      </div>
    </div>
  );
}
