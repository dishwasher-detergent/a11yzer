import { listTeams } from "@/lib/team";
import { useEffect, useState } from "react";

interface Team {
  $id: string;
  name: string;
  about?: string;
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data } = await listTeams();
      setTeams(data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setError("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return { teams, loading, error, refetch: fetchTeams };
}
