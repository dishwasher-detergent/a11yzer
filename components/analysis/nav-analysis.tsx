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
import { Models } from "node-appwrite";
import { Badge } from "../ui/badge";

export function NavAnalysis({
  analysis,
  loading,
}: {
  analysis: Models.DocumentList<AnalysisDb<AnalysisResult>> | null;
  loading: boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        Recent
        {!loading && (
          <Badge className="ml-2" variant="outline">
            {analysis?.total}
          </Badge>
        )}
      </SidebarGroupLabel>
      <SidebarMenu>
        {loading &&
          Array.from({ length: 5 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))}
        {analysis?.documents.map((item, index) => (
          <SidebarMenuItem key={item.$id}>
            <SidebarMenuButton
              asChild
              tooltip={item.data.analysis.summary.slice(0, 25)}
              className="truncate"
            >
              <Link href={`/app/teams/${item.teamId}/analysis/${item.$id}`}>
                <Badge
                  className="group-data-[state=collapsed]:border-none group-data-[state=collapsed]:size-4 group-data-[state=collapsed]:bg-transparent"
                  variant="secondary"
                >
                  {index + 1}
                </Badge>
                <span>{item.data.analysis.summary.slice(0, 25)}...</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
