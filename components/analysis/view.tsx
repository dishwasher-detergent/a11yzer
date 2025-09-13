"use client";

import { AnalysisDb } from "@/interfaces/analysis.interface";
import { Markdown } from "../markdown";
import { Input } from "../ui/input";

interface AnalysisViewProps {
  data?: AnalysisDb;
}

export function AnalysisView({ data }: AnalysisViewProps) {
  return (
    data && (
      <article className="h-full flex-1 flex flex-col flex-nowrap overflow-hidden py-4">
        <main className="h-full flex-1 overflow-y-auto [scrollbar-gutter:stable_both-edges]">
          <Markdown content={data.data} />
        </main>
        <footer className="flex-none w-full px-4 pt-4">
          <section className="p-0.5 border bg-secondary rounded-md space-y-1 max-w-5xl mx-auto">
            <header className="px-2 py-1">
              <time
                className="text-xs text-muted-foreground"
                dateTime={data.$createdAt}
              >
                Analyzed on{" "}
                {new Date(data.$createdAt).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </header>
            <div className="flex border rounded-md overflow-hidden h-12 bg-background">
              <div className="flex-1 h-full pr-2">
                <Input
                  type="url"
                  disabled={true}
                  className="border-none rounded-none px-4 h-full"
                  value={data.url}
                  aria-label="Analyzed URL"
                />
              </div>
            </div>
          </section>
        </footer>
      </article>
    )
  );
}
