"use client";

import { TeamData } from "@/interfaces/team.interface";
import { listTeams } from "@/lib/team";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useTeamData() {
  const [loading, setLoading] = useState<boolean>(true);
  const [teams, setTeams] = useState<TeamData[]>([]);

  async function fetchTeams() {
    setLoading(true);

    const data = await listTeams();

    if (!data.success) {
      toast.error(data.message);
    }

    if (data?.data) {
      setTeams(data.data);
    }
    setLoading(false);
  }

  const refetchTeams = () => {
    fetchTeams();
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    loading,
    refetchTeams,
  };
}
