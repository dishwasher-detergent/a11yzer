"use client";

import { AnalysisIssues } from "@/components/analysis/issues";
import { AnalysisProblematicElements } from "@/components/analysis/problematic-elements";
import { TechnicalDetails } from "@/components/analysis/technical-details";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";
import { Input } from "../ui/input";
import { AnalysisOverview } from "./overview";

interface AnalysisViewProps {
  data?: AnalysisDb<AnalysisResult>;
}

export function AnalysisView({ data }: AnalysisViewProps) {
  return (
    <div className="overflow-hidden flex flex-col flex-nowrap">
      {data && (
        <>
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-6 gap-4 grid grid-cols-1 lg:grid-cols-2">
            <AnalysisOverview summary={data.data.analysis.summary} />
            <TechnicalDetails accessibilityData={data.data.accessibilityData} />
            <AnalysisProblematicElements
              screenshotUrl={data.data.screenshotUrl}
              problematicElements={data.data.problematicElements}
            />
            <AnalysisIssues
              issues={data.data.analysis.issues}
              overallScore={data.data.analysis.overallScore}
            />
          </div>
          <section
            className="px-4 pb-4 md:px-8 md:pb-8 w-full bg-background"
            aria-labelledby="url-analysis-heading"
          >
            <div className="p-0.5 border bg-secondary rounded-md space-y-1">
              <div className="px-2 py-1">
                <div aria-live="polite" aria-atomic="true">
                  <p className="text-xs text-muted-foreground">
                    Analyzed on{" "}
                    {new Date(data.$createdAt).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex border rounded-md overflow-hidden h-12 bg-background">
                <div className="flex-1 h-full pr-2">
                  <Input
                    type="url"
                    disabled={true}
                    className="border-none rounded-none px-4 h-full"
                    value={data.data.url}
                  />
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
