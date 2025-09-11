"use client";

import { AnalysisDb } from "@/interfaces/analysis.interface";
import ReactMarkdown from "react-markdown";
import { Input } from "../ui/input";

interface AnalysisViewProps {
  data?: AnalysisDb;
}

export function AnalysisView({ data }: AnalysisViewProps) {
  return (
    <main className="flex flex-col flex-nowrap">
      {data && (
        <>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* <TechnicalDetails accessibilityData={accessibilityData} />
            <AnalysisProblematicElements
              screenshotUrl={screenshotUrl}
              problematicElements={problematicElements}
            /> */}
            <div className="prose prose-neutral dark:prose-invert max-w-none p-4">
              <ReactMarkdown>{data.data}</ReactMarkdown>
            </div>
          </div>
          <section className="p-2 md:p-4 w-full bg-background relative before:absolute before:top-0 before:h-px before:w-[200vw] before:bg-border before:-left-[100vw]">
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
                    value={data.url}
                  />
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
