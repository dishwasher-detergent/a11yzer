import { AnalysisCard } from "@/components/analysis/analysis-card";
import { AnalysisDb, AnalysisResult } from "@/interfaces/analysis.interface";

interface AnalysisHistoryProps {
  data?: AnalysisDb<AnalysisResult>[];
}

export function AnalysisHistory({ data }: AnalysisHistoryProps) {
  return (
    <div className="p-4">
      <h2 className="font-semibold text-lg pb-2">Analysis History</h2>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-cols-2 gap-4">
        {data?.map((item) => (
          <AnalysisCard key={item.$id} {...item} />
        ))}
      </div>
    </div>
  );
}
