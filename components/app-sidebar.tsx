"use client";

import { LucideHistory, LucideSparkles } from "lucide-react";
import { Query } from "node-appwrite";
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
import { useAnalysisList } from "@/hooks/useAnalysis";
import { useParams } from "next/navigation";

const data = [
  {
    title: "Analysis",
    url: "analysis",
    icon: LucideSparkles,
  },
  {
    title: "History",
    url: "",
    icon: LucideHistory,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { teamId } = useParams<{
    teamId: string;
  }>();
  const { analysisList, loading } = useAnalysisList([
    Query.orderDesc("$createdAt"),
    Query.limit(5),
  ]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data} />
        <NavAnalysis analysis={analysisList?.documents} loading={loading} />
        {teamId && <NavTeam teamId={teamId} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
