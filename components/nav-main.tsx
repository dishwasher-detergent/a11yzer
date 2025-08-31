"use client";

import { LucideSparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain() {
  const { teamId } = useParams<{
    teamId: string;
  }>();

  if (!teamId) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem key="analysis">
          <SidebarMenuButton asChild tooltip="Analysis">
            <Link href={`/app/teams/${teamId}/analysis`}>
              <LucideSparkles />
              <span>Analysis</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
