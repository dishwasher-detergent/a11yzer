import { LucideSparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface AnalysisOverviewProps {
  summary: string;
}

export function AnalysisOverview({ summary }: AnalysisOverviewProps) {
  return (
    <div className="border-b p-4 border rounded-md">
      <h2 className="font-semibold text-lg pb-2">
        Detailed Analysis Overview
        <Badge variant="outline" className="ml-2">
          <LucideSparkles />
          AI Generated
        </Badge>
      </h2>
      <p className="text-muted-foreground text-sm">{summary}</p>
    </div>
  );
}
