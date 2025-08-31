"use client";

import * as React from "react";

import { NavAnalysis } from "@/components/analysis/nav-analysis";
import { NavMain } from "@/components/nav-main";
import { NavTeam } from "@/components/team/nav-team";
import { TeamSwitcher } from "@/components/team/nav-team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/user/nav-user";
import { useParams } from "next/navigation";
import { ModeToggle } from "./theme-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { teamId } = useParams<{
    teamId: string;
  }>();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        {teamId && <NavTeam teamId={teamId} />}
        <NavAnalysis />
        <div className="mt-auto p-2">
          <ModeToggle />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
