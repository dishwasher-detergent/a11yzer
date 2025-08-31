"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTeamData } from "@/hooks/useTeamData";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import { CreateTeam } from "./create-team";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { teamId } = useParams<{
    teamId: string;
  }>();

  const { teams, loading, refetchTeams } = useTeamData();

  useEffect(() => {
    if (teams.findIndex((team) => team.$id === teamId) === -1) {
      refetchTeams();
    }
  }, [teamId]);

  if (loading) {
    return <Skeleton className="h-12 w-full" />;
  }

  if (teams.length == 0) {
    return <CreateTeam className="w-full" />;
  }

  const activeTeam = teams.find((x) => x.$id === teamId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-muted border group-data-[state=collapsed]:border-none"
            >
              {activeTeam ? (
                <>
                  <div className="border flex aspect-square size-8 items-center justify-center rounded-lg bg-background">
                    <p className="font-semibold uppercase text-muted-foreground">
                      {activeTeam?.name[0]}
                    </p>
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {activeTeam.name}
                    </span>
                    <span className="truncate text-xs">{activeTeam.about}</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="px-2 text-sm font-semibold">Select A Team</p>
                </>
              )}
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {teams.map((teamItem) => (
              <DropdownMenuItem
                key={teamItem.$id}
                className="cursor-pointer text-sm flex justify-between items-center"
                asChild
              >
                <Link href={`/app/teams/${teamItem.$id}`}>
                  <div className="flex flex-row gap-2 items-center">
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <p className="font-semibold uppercase text-muted-foreground">
                        {teamItem?.name[0]}
                      </p>
                    </div>
                    <span className="truncate">{teamItem.name}</span>
                  </div>
                  <DropdownMenuShortcut>
                    <Check
                      className={cn(
                        "size-3",
                        teamId === teamItem.$id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <CreateTeam className="w-full" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
