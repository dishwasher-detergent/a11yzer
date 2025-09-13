import Markdoc from "@markdoc/markdoc";
import React from "react";

import { AnalysisProblematicElements } from "@/components/analysis/problematic-elements";
import { TechnicalDetails } from "@/components/analysis/technical-details";
import { Badge } from "@/components/ui/badge";

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
    badge: {
      render: "Badge",
      attributes: {
        variant: {
          type: String,
          required: true,
        },
      },
    },
    recommendation: {
      render: "Recommendation",
      attributes: {},
    },
    description: {
      render: "Description",
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
      <section className="prose prose-neutral dark:prose-invert max-w-none overflow-x-hidden rounded-lg border bg-background p-4">
        {children}
      </section>
    );
  },
  Badge: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant:
      | "critical"
      | "high"
      | "medium"
      | "low"
      | "accessibility"
      | "ui"
      | "ux";
  }) => {
    return <Badge variant={variant}>{children}</Badge>;
  },
  Recommendation: ({ children }: { children: React.ReactNode }) => {
    return (
      <>
        <p className="font-bold mb-2">Recommendation</p>
        <div className="border bg-muted text-muted-foreground text-sm rounded-lg px-2">
          {children}
        </div>
      </>
    );
  },
  Description: ({ children }: { children: React.ReactNode }) => {
    return (
      <>
        <p className="font-bold mb-0">Description</p>
        <div className="text-sm rounded-lg">{children}</div>
      </>
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
    <div className="p-2 bg-secondary border rounded-lg max-w-5xl w-full mx-auto">
      {renderMarkdoc(content)}
    </div>
  );
}
