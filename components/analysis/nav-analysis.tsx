"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useAnalysisList } from "@/hooks/useAnalysisList";

export function NavAnalysis() {
  const { analysisList, loading } = useAnalysisList({
    limit: 5,
  });

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
        {analysisList?.slice(0, 5).map((item, index) => (
          <SidebarMenuItem key={item.$id}>
            <SidebarMenuButton
              size="lg"
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
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {item.data.analysis.summary.slice(0, 25)}...
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {item.url}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        {analysisList?.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">No analysis found</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
