import { Badge } from "@/components/ui/badge";
import { AnalysisIssue } from "@/interfaces/analysis.interface";
import {
  AlertTriangle,
  CheckCircle,
  LucideSparkles,
  XCircle,
} from "lucide-react";

interface AnalysisIssuesProps {
  issues: AnalysisIssue[];
  overallScore: number;
}

export function AnalysisIssues({ issues, overallScore }: AnalysisIssuesProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "accessibility":
        return <AlertTriangle className="w-4 h-4" />;
      case "ux":
        return <CheckCircle className="w-4 h-4" />;
      case "ui":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getBadgeVariant = (score: number) => {
    if (score >= 80) return "low";
    if (score >= 60) return "medium";
    return "high";
  };

  const sortedIssues = [...issues].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="col-span-2 col-start-1">
      <div className="flex justify-between items-center p-4">
        <div>
          <h2 className="font-semibold text-lg pb-2">
            Analysis Result
            <Badge variant="outline" className="ml-2">
              <LucideSparkles />
              AI Generated
            </Badge>
          </h2>
          <p className="text-muted-foreground text-sm">
            {issues.length} issues found across accessibility, UX, and UI
          </p>
        </div>
        <Badge className="text-xl" variant={getBadgeVariant(overallScore)}>
          {overallScore}/100
        </Badge>
      </div>
      <ul className="grid grid-cols-1 gap-4">
        {sortedIssues.map((issue, index) => (
          <li key={index} className="space-y-2 border rounded-md p-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={issue.priority}>
                {getTypeIcon(issue.type)}
                {issue.priority}
              </Badge>
              <Badge>{issue.type}</Badge>
              {issue.wcagCriterion && (
                <Badge variant="outline" className="text-xs">
                  {issue.wcagCriterion}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{issue.description}</p>
            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Recommendation:
              </h4>
              <p className="text-sm text-blue-800">{issue.recommendation}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
