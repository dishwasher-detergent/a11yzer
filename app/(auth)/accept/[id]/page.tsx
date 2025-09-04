import { ShineBorder } from "@/components/shine-border";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AcceptForm } from "./form";

export default async function Invite({
  searchParams,
}: {
  searchParams: Promise<{
    teamId: string;
    membershipId: string;
    userId: string;
    secret: string;
  }>;
}) {
  const { teamId, membershipId, userId, secret } = await searchParams;

  return (
    <Card className="w-full max-w-sm relative z-10">
      <ShineBorder
        shineColor={[
          "var(--color-pink-300)",
          "var(--color-red-300)",
          "var(--color-yellow-300)",
          "var(--color-green-300)",
          "var(--color-blue-300)",
        ]}
      />
      <CardHeader>
        <CardTitle className="text-lg mt-2">Accept Team Invite</CardTitle>
      </CardHeader>
      <CardContent>
        <AcceptForm
          teamId={teamId}
          membershipId={membershipId}
          userId={userId}
          secret={secret}
        />
      </CardContent>
    </Card>
  );
}
