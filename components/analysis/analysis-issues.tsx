import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisIssue } from "@/interfaces/analysis.interface";
import { AlertTriangle, Eye, LucideSparkles, Palette } from "lucide-react";

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
        return <Eye className="w-4 h-4" />;
      case "ui":
        return <Palette className="w-4 h-4" />;
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

  const accessibilityIssues = sortedIssues.filter(
    (issue) => issue.type === "accessibility"
  );
  const uxIssues = sortedIssues.filter((issue) => issue.type === "ux");
  const uiIssues = sortedIssues.filter((issue) => issue.type === "ui");

  const renderIssuesList = (filteredIssues: AnalysisIssue[]) => (
    <ul className="grid grid-cols-1 gap-4">
      {filteredIssues.map((issue, index) => (
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
          <p>{issue.title}</p>
          <p className="text-sm text-muted-foreground">{issue.description}</p>
          <div className="bg-muted p-3 rounded-md border">
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">
              Recommendation:
            </h4>
            <p className="text-sm text-muted-foreground">
              {issue.recommendation}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );

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
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({issues.length})</TabsTrigger>
          <TabsTrigger value="accessibility">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Accessibility ({accessibilityIssues.length})
          </TabsTrigger>
          <TabsTrigger value="ux">
            <Eye className="w-4 h-4 mr-1" />
            UX ({uxIssues.length})
          </TabsTrigger>
          <TabsTrigger value="ui">
            <Palette className="w-4 h-4 mr-1" />
            UI ({uiIssues.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {renderIssuesList(sortedIssues)}
        </TabsContent>

        <TabsContent value="accessibility" className="mt-4">
          {accessibilityIssues.length > 0 ? (
            renderIssuesList(accessibilityIssues)
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No accessibility issues found
            </p>
          )}
        </TabsContent>
        <TabsContent value="ux" className="mt-4">
          {uxIssues.length > 0 ? (
            renderIssuesList(uxIssues)
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No UX issues found
            </p>
          )}
        </TabsContent>
        <TabsContent value="ui" className="mt-4">
          {uiIssues.length > 0 ? (
            renderIssuesList(uiIssues)
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No UI issues found
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
