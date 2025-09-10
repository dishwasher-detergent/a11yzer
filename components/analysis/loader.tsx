"use client";

import { StreamingStatus } from "@/hooks/useAnalysisStreaming";
import { CheckCircle, Cog, Eye, FileText, Globe, Image } from "lucide-react";

interface AssemblyLoaderProps {
  status: StreamingStatus;
  url: string;
}

const stepIcons = [
  { icon: Globe, label: "Connecting", description: "Accessing website" },
  { icon: FileText, label: "Analyzing", description: "Reading page content" },
  { icon: Eye, label: "Scanning", description: "Checking accessibility" },
  { icon: Image, label: "Capturing", description: "Taking screenshot" },
  { icon: Cog, label: "Processing", description: "Running analysis" },
  { icon: CheckCircle, label: "Finalizing", description: "Generating report" },
];

export function AnalysisLoader({ status, url }: AssemblyLoaderProps) {
  const currentStepIndex = status.step - 1;

  return (
    <div className="flex flex-col justify-center h-full">
      <div className="w-full flex-none relative before:absolute before:top-0 before:h-px before:w-[200vw] before:bg-border before:-left-[100vw] after:absolute after:bottom-0 after:h-px after:w-[200vw] after:bg-border after:-left-[100vw]">
        <div className="p-2 bg-muted/30">
          <div className="rounded-lg p-4 bg-background border">
            <h1 className="font-bold text-lg mb-2">Analyzing Your Website</h1>
            <p className="text-muted-foreground">
              We&apos;re examining{" "}
              <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {url}
              </code>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex-none relative after:absolute after:bottom-0 after:h-px after:w-[200vw] after:bg-border after:-left-[100vw]">
        <div className="p-2 bg-muted/30">
          <div className="rounded-lg p-4 bg-background border">
            <h2 className="font-bold mb-2">Analysis Steps</h2>
            <ol className="space-y-2">
              {stepIcons.slice(0, status.totalSteps).map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;

                return (
                  <li
                    key={index}
                    className={`
                    rounded-lg p-3 border transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-4
                    ${
                      isCompleted
                        ? "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800/50"
                        : ""
                    }
                    ${
                      isCurrent
                        ? "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/50"
                        : ""
                    }
                    ${isPending ? "bg-background border-border" : ""}
                  `}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "backwards",
                    }}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={`${step.label}: ${step.description}${
                      isCompleted
                        ? " - completed"
                        : isCurrent
                        ? " - in progress"
                        : " - pending"
                    }`}
                  >
                    <div className="flex flex-row items-center gap-4">
                      <div
                        className={`
                      relative p-2 rounded-full transition-all duration-300
                      ${
                        isCompleted
                          ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                          : ""
                      }
                      ${
                        isCurrent
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                          : ""
                      }
                      ${isPending ? "bg-muted text-muted-foreground" : ""}
                    `}
                        role="img"
                        aria-hidden="true"
                      >
                        <step.icon className="w-5 h-5" />

                        {isCurrent && (
                          <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping" />
                        )}
                      </div>
                      <div>
                        <div
                          className={`
                        text-sm font-semibold transition-colors duration-300
                        ${
                          isCompleted
                            ? "text-green-600 dark:text-green-400"
                            : ""
                        }
                        ${isCurrent ? "text-blue-600 dark:text-blue-400" : ""}
                        ${isPending ? "text-muted-foreground" : ""}
                      `}
                        >
                          {step.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
