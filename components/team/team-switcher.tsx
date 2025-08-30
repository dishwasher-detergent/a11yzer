"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { CreateTeam } from "./create-team";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { teamId } = useParams<{
    teamId: string;
  }>();

  const [_, setOpen] = useState(false);
  const { teams, loading } = useTeamData();

  if (loading) {
    return <Skeleton className="h-6 w-32" />;
  }

  if (teams.length == 0) {
    return (
      <div className="flex w-32">
        <CreateTeam />
      </div>
    );
  }

  const activeTeam = teams.find((x) => x.$id === teamId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {activeTeam ? (
                <>
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <p>{activeTeam?.name[0]}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {activeTeam?.name}
                    </span>
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
                onSelect={() => {
                  setOpen(false);
                }}
                className="cursor-pointer text-sm flex justify-between items-center"
                asChild
              >
                <Link href={`/app/teams/${teamItem.$id}`}>
                  <div className="flex flex-row gap-2 items-center">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-6 items-center justify-center rounded-lg">
                      <p>{teamItem?.name[0]}</p>
                    </div>
                    <span className="truncate font-semibold">
                      {teamItem.name}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 flex-none",
                      teamId === teamItem.$id ? "opacity-100" : "opacity-0"
                    )}
                  />
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
