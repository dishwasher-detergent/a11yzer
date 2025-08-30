import { AnalysisCard } from "@/components/analysis/analysis-card";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";

interface AnalysisHistoryProps {
  data?: AnalysisDb<AnalysisResult>[];
}

export function AnalysisHistory({ data }: AnalysisHistoryProps) {
  return (
    <div>
      <h3 className="font-semibold text-base mb-2">Analysis History</h3>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-cols-2 gap-4">
        {data?.map((item) => (
          <AnalysisCard key={item.$id} {...item} />
        ))}
        {(!data || data?.length === 0) && (
          <p className="font-semibold text-muted-foreground text-sm">
            You haven&apos;t created any analysis yet. Get started by creating
            one!
          </p>
        )}
      </div>
    </div>
  );
}
