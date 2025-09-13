"use client";

import { LucideChevronDown, LucideLoader2 } from "lucide-react";
import { Models } from "node-appwrite";
import { useState } from "react";

import { AnalysisCard } from "@/components/analysis/card";
import { Button } from "@/components/ui/button";
import { useAnalysisList } from "@/hooks/useAnalysisList";
import { AnalysisDb } from "@/interfaces/analysis.interface";

interface AnalysisHistoryProps {
  initialData?: Models.RowList<AnalysisDb>;
  teamId?: string;
  userId?: string;
}

export function AnalysisHistory({
  initialData,
  userId,
  teamId,
}: AnalysisHistoryProps) {
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined
  );
  const { loading, analysisList, hasMore, totalAnalysis, nextCursor } =
    useAnalysisList({
      initialAnalysis: initialData,
      userId,
      teamId,
      cursor: currentCursor,
    });

  const handleLoadMore = () => {
    if (!nextCursor || loading) return;
    setCurrentCursor(nextCursor);
  };

  return (
    <section>
      <header>
        <h2 className="font-semibold text-base mb-2">Analysis History</h2>
      </header>
      <main className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid-cols-1 gap-4">
        {analysisList?.map((item) => (
          <AnalysisCard key={item.$id} {...item} />
        ))}
        {(!analysisList || analysisList?.length === 0) && (
          <p className="font-semibold text-muted-foreground text-sm">
            You haven&apos;t created any analysis yet. Get started by creating
            one!
          </p>
        )}
      </main>
      {analysisList.length > 0 && (
        <footer className="flex flex-col items-center space-y-2 py-8">
          <p className="text-muted-foreground text-sm">
            Showing {analysisList.length} of {totalAnalysis} analysis.
          </p>
          {hasMore && (
            <Button
              variant="secondary"
              onClick={handleLoadMore}
              disabled={loading || !nextCursor}
              size="sm"
              aria-label={`Load more analysis. Currently showing ${analysisList.length} of ${totalAnalysis}`}
            >
              Show More
              {loading ? (
                <LucideLoader2
                  className="ml-2 size-3.5 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <LucideChevronDown
                  className="ml-2 size-3.5"
                  aria-hidden="true"
                />
              )}
            </Button>
          )}
        </footer>
      )}
    </section>
  );
}
