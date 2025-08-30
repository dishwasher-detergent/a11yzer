"use client";

import * as React from "react";

import { NavAnalysis } from "@/components/nav-analysis";
import { NavMain } from "@/components/nav-main";
import { TeamSwitcher } from "@/components/team/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/user/nav-user";
import { useAnalysisList } from "@/hooks/useAnalysis";
import { Query } from "node-appwrite";

const data = [
  {
    title: "Analysis",
    url: "analysis",
  },
  {
    title: "History",
    url: "",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        {/* <NavSettings /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
