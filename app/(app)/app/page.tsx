"use client";

import { CreateTeam } from "@/components/team/create-team";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listTeams } from "@/lib/team";
import {
  AlertTriangle,
  CheckCircle,
  Globe,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AnalysisResult {
  url: string;
  screenshot: string;
  analysis: {
    overallScore: number;
    issues: Array<{
      type: "accessibility" | "ux" | "ui";
      priority: "high" | "medium" | "low";
      title: string;
      description: string;
      recommendation: string;
      wcagCriterion?: string;
    }>;
    summary: string;
  };
  rawData: {
    semanticStructure: {
      hasMain: boolean;
      hasNav: boolean;
      hasHeader: boolean;
      hasFooter: boolean;
    };
    headings: Array<{ level: string; text: string; hasId: boolean }>;
    images: Array<{ src: string; alt: string; hasAlt: boolean }>;
    links: Array<{ href: string; text: string; hasTitle: boolean }>;
  };
}

export default function AppPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [teams, setTeams] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await listTeams();
        setTeams(data || []);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  const analyzeWebsite = async () => {
    if (!url) return;

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze website");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(
        "Failed to analyze website. Please check the URL and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

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

  if (loadingTeams) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return teams && teams?.length > 0 ? (
    <div className="space-y-6">
      <header className="flex flex-row justify-between items-center pb-4 w-full">
        <div>
          <h2 className="font-bold text-2xl">AI Accessibility Checker</h2>
          <p className="text-muted-foreground">
            Analyze websites for accessibility issues and UI/UX improvements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <span className="text-sm text-muted-foreground">
            Team: {teams[0]?.name}
          </span>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Website Analysis</CardTitle>
          <CardDescription>
            Enter a URL to analyze for accessibility issues and get AI-powered
            recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && analyzeWebsite()}
            />
            <Button onClick={analyzeWebsite} disabled={loading || !url}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Accessibility Score
                <Badge
                  variant={
                    analysis.analysis.overallScore >= 80
                      ? "default"
                      : analysis.analysis.overallScore >= 60
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {analysis.analysis.overallScore}/100
                </Badge>
              </CardTitle>
              <CardDescription>{analysis.analysis.summary}</CardDescription>
            </CardHeader>
          </Card>

          {/* Screenshot */}
          {analysis.screenshot && (
            <Card>
              <CardHeader>
                <CardTitle>Page Screenshot</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={analysis.screenshot}
                  alt="Website screenshot"
                  className="w-full max-w-2xl mx-auto rounded-lg border"
                />
              </CardContent>
            </Card>
          )}

          {/* Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Issues & Recommendations</CardTitle>
              <CardDescription>
                {analysis.analysis.issues.length} issues found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.analysis.issues.map((issue, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(issue.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{issue.title}</h4>
                          <Badge variant={getPriorityColor(issue.priority)}>
                            {issue.priority}
                          </Badge>
                          <Badge variant="outline">{issue.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {issue.description}
                        </p>
                        <div className="bg-muted p-3 rounded text-sm">
                          <strong>Recommendation:</strong>{" "}
                          {issue.recommendation}
                        </div>
                        {issue.wcagCriterion && (
                          <p className="text-xs text-muted-foreground mt-2">
                            WCAG: {issue.wcagCriterion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technical Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Analysis</CardTitle>
              <CardDescription>
                Raw accessibility data extracted from the page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Semantic Structure</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Main landmark:</span>
                      <span
                        className={
                          analysis.rawData.semanticStructure.hasMain
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {analysis.rawData.semanticStructure.hasMain ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Navigation:</span>
                      <span
                        className={
                          analysis.rawData.semanticStructure.hasNav
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {analysis.rawData.semanticStructure.hasNav ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Header:</span>
                      <span
                        className={
                          analysis.rawData.semanticStructure.hasHeader
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {analysis.rawData.semanticStructure.hasHeader
                          ? "✓"
                          : "✗"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Footer:</span>
                      <span
                        className={
                          analysis.rawData.semanticStructure.hasFooter
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {analysis.rawData.semanticStructure.hasFooter
                          ? "✓"
                          : "✗"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Content Analysis</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Headings:</span>
                      <span>{analysis.rawData.headings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Images:</span>
                      <span>{analysis.rawData.images.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Images with alt text:</span>
                      <span>
                        {
                          analysis.rawData.images.filter((img) => img.hasAlt)
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Links:</span>
                      <span>{analysis.rawData.links.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  ) : (
    <section className="grid place-items-center gap-4">
      <p className="text-lg font-semibold text-center">
        Looks like you&apos;re apart of no teams yet, <br />
        join one or create one to get started with accessibility analysis!
      </p>
      <CreateTeam />
    </section>
  );
}
