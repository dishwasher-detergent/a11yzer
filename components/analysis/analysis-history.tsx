"use client";

import { LucideChevronDown, LucideLoader2 } from "lucide-react";
import { Models } from "node-appwrite";
import { useState } from "react";

import { AnalysisCard } from "@/components/analysis/analysis-card";
import { Button } from "@/components/ui/button";
import { useAnalysisList } from "@/hooks/useAnalysisList";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";

interface AnalysisHistoryProps {
  initialData?: Models.DocumentList<AnalysisDb<AnalysisResult>>;
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
    <div>
      <h3 className="font-semibold text-base mb-2">Analysis History</h3>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-cols-2 gap-4">
        {analysisList?.map((item) => (
          <AnalysisCard key={item.$id} {...item} />
        ))}
        {(!analysisList || analysisList?.length === 0) && (
          <p className="font-semibold text-muted-foreground text-sm">
            You haven&apos;t created any analysis yet. Get started by creating
            one!
          </p>
        )}
      </div>
      {analysisList.length > 0 && (
        <div className="flex flex-col items-center space-y-2 pt-2">
          <p className="text-muted-foreground text-sm">
            Showing {analysisList.length} of {totalAnalysis} analysis.
          </p>
          {hasMore && (
            <Button
              variant="secondary"
              onClick={handleLoadMore}
              disabled={loading || !nextCursor}
            >
              Show More
              {loading ? (
                <LucideLoader2 className="ml-2 size-3.5 animate-spin" />
              ) : (
                <LucideChevronDown className="ml-2 size-3.5" />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
