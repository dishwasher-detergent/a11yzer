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
import { LucideSparkles } from "lucide-react";

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
        {analysis?.map((item) => (
          <SidebarMenuItem key={item.$id}>
            <SidebarMenuButton
              asChild
              tooltip={item.data.analysis.summary.slice(0, 25)}
            >
              <Link href={`/app/teams/${item.teamId}/analysis/${item.$id}`}>
                <LucideSparkles />
                <span>{item.data.analysis.summary.slice(0, 25)}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
