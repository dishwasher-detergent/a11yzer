import Markdoc from "@markdoc/markdoc";
import React from "react";
import { AnalysisProblematicElements } from "./analysis/problematic-elements";
import { TechnicalDetails } from "./analysis/technical-details";

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
      <section className="prose prose-neutral dark:prose-invert max-w-none overflow-x-hidden">
        {children}
      </section>
    );
  },
};

export function Markdown({ content }: { content: string }) {
  const renderMarkdoc = (content: string) => {
    if (!content) return null;

    const ast = Markdoc.parse(content);
    const renderable = Markdoc.transform(ast, config);
    return Markdoc.renderers.react(renderable, React, { components });
  };

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none overflow-x-hidden">
      {renderMarkdoc(content)}
    </div>
  );
}
