import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalysisIssue } from "@/interfaces/analysis.interface";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              {issues.length} issues found across accessibility, UX, and UI
            </CardDescription>
          </div>
          <div
            className={`text-2xl font-bold ${getScoreColor(
              overallScore
            )} ${getScoreBgColor(overallScore)} px-3 py-1 rounded-lg`}
          >
            {overallScore}/100
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {issues.map((issue, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(issue.type)}
                <Badge variant={issue.priority}>{issue.priority}</Badge>
                <span className="font-semibold">{issue.title}</span>
                {issue.wcagCriterion && (
                  <Badge variant="outline" className="text-xs">
                    {issue.wcagCriterion}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {issue.description}
              </p>
              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  Recommendation:
                </h4>
                <p className="text-sm text-blue-800">{issue.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
