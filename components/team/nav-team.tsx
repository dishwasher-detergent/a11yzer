"use client";

import { LucideHistory, LucideSettings } from "lucide-react";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavTeamProps {
  teamId: string;
}

export function NavTeam({ teamId }: NavTeamProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Team</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem key="history">
          <SidebarMenuButton asChild tooltip="Team History">
            <Link href={`/app/teams/${teamId}`}>
              <LucideHistory />
              <span>History</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem key="settings">
          <SidebarMenuButton asChild tooltip="Team Settings">
            <Link href={`/app/teams/${teamId}/settings`}>
              <LucideSettings />
              <span>Settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
