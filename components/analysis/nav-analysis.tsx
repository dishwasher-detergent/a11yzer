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
    <SidebarGroup>
      <SidebarGroupLabel>Recent</SidebarGroupLabel>
      <SidebarMenu>
        {loading &&
          Array.from({ length: 5 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))}
        {analysis?.map((item, index) => (
          <SidebarMenuItem key={item.$id}>
            <SidebarMenuButton
              asChild
              tooltip={item.data.analysis.summary.slice(0, 25)}
              className="truncate"
            >
              <Link href={`/app/teams/${item.teamId}/analysis/${item.$id}`}>
                <div className="grid place-items-center border rounded-md bg-background size-6 flex-none group-data-[state=collapsed]:border-none group-data-[state=collapsed]:size-4 group-data-[state=collapsed]:bg-transparent">
                  <p className="text-xs font-semibold">{index + 1}</p>
                </div>
                <span>{item.data.analysis.summary.slice(0, 25)}...</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
