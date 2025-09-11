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
import { AnalysisDb } from "@/interfaces/analysis.interface";

interface NavAnalysisProps {
  data: AnalysisDb[];
  loading: boolean;
}

export function NavAnalysis({ data, loading }: NavAnalysisProps) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent</SidebarGroupLabel>
      <Content data={data} loading={loading} />
    </SidebarGroup>
  );
}

function Content({ data, loading }: NavAnalysisProps) {
  if (loading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 5 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No analysis found</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      {data?.slice(0, 5).map((item, index) => (
        <SidebarMenuItem key={item.$id}>
          <SidebarMenuButton
            size="lg"
            asChild
            tooltip={item.data.slice(0, 25)}
            className="truncate"
          >
            <Link href={`/app/teams/${item.teamId}/analysis/${item.$id}`}>
              <Badge variant="secondary">{index + 1}</Badge>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {item.data.slice(0, 25)}...
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {item.url}
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
