"use client";

import { Query } from "node-appwrite";

import { useAnalysisList } from "@/hooks/useAnalysis";
import { AnalysisCard } from "./analysis-card";

export function AnalysisHistory() {
  const { analysisList, loading } = useAnalysisList([
    Query.orderDesc("$createdAt"),
  ]);

  return (
    <div className="p-4">
      <h2 className="font-semibold text-lg pb-2">Analysis History</h2>
      {loading && <p>Loading...</p>}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 grid-cols-2 gap-4">
        {analysisList?.documents.map((item) => (
          <AnalysisCard key={item.$id} {...item} />
        ))}
      </div>
    </div>
  );
}
