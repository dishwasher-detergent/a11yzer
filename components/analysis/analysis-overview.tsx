import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AnalysisOverviewProps {
  summary: string;
}

export function AnalysisOverview({ summary }: AnalysisOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Overview</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
    </Card>
  );
}
