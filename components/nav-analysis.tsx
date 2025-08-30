"use client";

import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";

export function NavAnalysis({
  analysis,
  loading,
}: {
  analysis?: AnalysisDb<AnalysisResult>[];
  loading: boolean;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent</SidebarGroupLabel>
      <SidebarMenu>
        {loading &&
          Array.from({ length: 5 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))}
        {analysis?.map((item) => (
          <SidebarMenuItem key={item.$id}>
            <SidebarMenuButton asChild>
              <Link href={`/app/teams/${item.teamId}/analysis/${item.$id}`}>
                <span>{item.data.analysis.summary.slice(0, 50)}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
