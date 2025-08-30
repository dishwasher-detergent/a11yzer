"use client";

import { Query } from "node-appwrite";

import { useAnalysisList } from "@/hooks/useAnalysis";

export function AnalysisHistory() {
  const { analysisList, loading } = useAnalysisList([
    Query.orderDesc("$createdAt"),
  ]);

  return (
    <div>
      <h2>Analysis History</h2>
      {loading && <p>Loading...</p>}
      {analysisList?.documents.map((item) => (
        <div key={item.$id}>
          <p>{item.$createdAt}</p>
          <h3>{item.data.analysis.summary.slice(0, 50)}...</h3>
        </div>
      ))}
    </div>
  );
}
