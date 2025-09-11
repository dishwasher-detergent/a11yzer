"use client";

import { UrlInput } from "@/components/analysis/url-input";
import { useAnalysisStreaming } from "@/hooks/useAnalysisStreaming";
import Markdoc from "@markdoc/markdoc";
import React from "react";
import GettingStarted from "./getting-started";
import { AnalysisProblematicElements } from "./problematic-elements";
import { TechnicalDetails } from "./technical-details";

interface AnalysisCreateProps {
  teamId: string;
  count: number;
}

export function AnalysisCreate({ teamId, count }: AnalysisCreateProps) {
  const {
    url,
    setUrl,
    loading,
    error,
    analyzeWebsite,
    cancelAnalysis,
    cached,

    count: newCount,
    aiResponse,
  } = useAnalysisStreaming(teamId);

  const currentCount = newCount ?? count;

  const config = {
    tags: {
      "technical-details": {
        render: "TechnicalDetails",
        attributes: {
          data: {
            type: Object,
            required: true,
          },
        },
      },
      "problematic-elements": {
        render: "ProblematicElements",
        attributes: {
          screenshot: {
            type: String,
            required: true,
          },
          elements: {
            type: Object,
            required: true,
          },
        },
      },
      "ai-result": {
        render: "AiResult",
        attributes: {},
      },
    },
  };

  // Define custom components
  const components = {
    TechnicalDetails: ({ data }: { data: string }) => {
      const decodedData = JSON.parse(atob(data));
      return <TechnicalDetails accessibilityData={decodedData} />;
    },
    ProblematicElements: ({
      screenshot,
      elements,
    }: {
      screenshot: string;
      elements: string;
    }) => {
      const decodedData = JSON.parse(atob(elements));

      return (
        <AnalysisProblematicElements
          screenshotUrl={screenshot}
          problematicElements={decodedData}
        />
      );
    },
    AiResult: ({ children }: { children: React.ReactNode }) => {
      return (
        <section className="prose prose-neutral dark:prose-invert max-w-none">
          {children}
        </section>
      );
    },
  };

  const renderMarkdoc = (content: string) => {
    if (!content) return null;

    const ast = Markdoc.parse(content);
    const renderable = Markdoc.transform(ast, config);
    return Markdoc.renderers.react(renderable, React, { components });
  };

  return (
    <div className="h-full flex-1 flex flex-col flex-nowrap overflow-hidden">
      <div className="h-full flex-1 overflow-y-auto overflow-x-hidden w-full p-4">
        {aiResponse.length === 0 && !loading && <GettingStarted />}
        {aiResponse && renderMarkdoc(aiResponse)}
        {loading && <p>Thinking...</p>}
      </div>
      <div className="relative before:absolute before:top-0 before:h-px before:w-[200vw] before:bg-border before:-left-[100vw]">
        <UrlInput
          url={url}
          onUrlChange={setUrl}
          onAnalyze={analyzeWebsite}
          onCancel={cancelAnalysis}
          loading={loading}
          error={error}
          count={currentCount}
          cached={cached}
        />
      </div>
    </div>
  );
}
