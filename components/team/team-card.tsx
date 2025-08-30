"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeamData } from "@/interfaces/team.interface";

export function TeamCard(team: TeamData) {
  return (
    <Card className="rounded-lg overflow-hidden py-0 gap-0">
      <CardContent className="p-0 relative">
        <CardHeader className="flex flex-col justify-end w-full p-4 h-full">
          <CardTitle>
            <Button className="truncate p-0! text-lg" variant="link" asChild>
              <Link href={`/app/teams/${team.$id}`}>{team.name}</Link>
            </Button>
          </CardTitle>
          <CardDescription className="line-clamp-3">
            {team?.description ?? "No description provided."}
          </CardDescription>
        </CardHeader>
      </CardContent>
    </Card>
  );
}
