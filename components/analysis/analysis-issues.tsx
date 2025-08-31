import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisIssue } from "@/interfaces/analysis.interface";
import { AlertTriangle, LucideSparkles, Tag } from "lucide-react";
import { useMemo } from "react";

interface AnalysisIssuesProps {
  issues: AnalysisIssue[];
  overallScore: number;
}

export function AnalysisIssues({ issues, overallScore }: AnalysisIssuesProps) {
  // Dynamically get unique issue types from the data
  const issueTypes = useMemo(() => {
    const types = [...new Set(issues.map((issue) => issue.type))];
    return types.map((type) => ({
      key: type,
      label: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
      count: issues.filter((issue) => issue.type === type).length,
    }));
  }, [issues]);

  // Generic icon for all types since we don't know what types will exist
  const getTypeIcon = () => {
    return <Tag className="w-4 h-4" />;
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

  // Group issues by type dynamically
  const issuesByType = useMemo(() => {
    const grouped: Record<string, AnalysisIssue[]> = {};
    sortedIssues.forEach((issue) => {
      if (!grouped[issue.type]) {
        grouped[issue.type] = [];
      }
      grouped[issue.type].push(issue);
    });
    return grouped;
  }, [sortedIssues]);

  const renderIssuesList = (filteredIssues: AnalysisIssue[]) => (
    <ul className="grid grid-cols-1 gap-4">
      {filteredIssues.map((issue, index) => (
        <li key={index} className="space-y-2 border rounded-md p-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={issue.priority}>
              <AlertTriangle className="w-4 h-4 mr-1" />
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

  // Generate category names dynamically for the description
  const categoryNames =
    issueTypes.length > 0
      ? issueTypes.map((type) => type.label).join(", ")
      : "various categories";

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
            {issues.length} issues found across {categoryNames}
          </p>
        </div>
        <Badge className="text-xl" variant={getBadgeVariant(overallScore)}>
          {overallScore}/100
        </Badge>
      </div>
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({issues.length})</TabsTrigger>
          {issueTypes.map((type) => (
            <TabsTrigger key={type.key} value={type.key}>
              {getTypeIcon()}
              <span className="ml-1">
                {type.label} ({type.count})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {renderIssuesList(sortedIssues)}
        </TabsContent>

        {issueTypes.map((type) => (
          <TabsContent key={type.key} value={type.key} className="mt-4">
            {issuesByType[type.key]?.length > 0 ? (
              renderIssuesList(issuesByType[type.key])
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No {type.label.toLowerCase()} issues found
              </p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
