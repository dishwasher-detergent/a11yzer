"use client";

import { AnalysisDashboard } from "@/components/analysis/analysis-dashboard";
import { OnboardingCard } from "@/components/onboarding/onboarding-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTeams } from "@/hooks/useTeams";

export default function AppPage() {
  const { teams, loading } = useTeams();

  if (loading) {
    return (
      <LoadingSpinner size="lg" text="Loading teams..." className="h-32" />
    );
  }

  return teams && teams.length > 0 ? <AnalysisDashboard /> : <OnboardingCard />;
}
