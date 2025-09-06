"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  const progressPercentage = (status.step / status.totalSteps) * 100;

  return (
    <main className="h-full flex items-center justify-center p-6" role="main">
      <section
        className="max-w-2xl w-full space-y-8"
        aria-labelledby="analysis-title"
      >
        <header className="text-center space-y-4 animate-in fade-in duration-500">
          <div>
            <h1 id="analysis-title" className="text-2xl font-bold mb-2">
              Analyzing Your Website
            </h1>
            <p className="text-muted-foreground">
              We&apos;re examining{" "}
              <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {url}
              </code>
            </p>
          </div>
        </header>
        <section aria-labelledby="progress-title" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="progress-title" className="text-sm font-medium">
              Analysis Progress
            </h2>
            <Badge
              variant="secondary"
              aria-label={`Step ${status.step} of ${status.totalSteps}`}
            >
              Step {status.step} of {status.totalSteps}
            </Badge>
          </div>
          <Progress
            value={progressPercentage}
            aria-label={`Analysis progress: ${Math.round(
              progressPercentage
            )}% complete`}
          />
          <p
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {status.message}
          </p>
        </section>
        <section aria-labelledby="steps-title" className="space-y-0">
          <h2 id="steps-title" className="sr-only">
            Analysis Steps
          </h2>
          <ol
            className="rounded-lg overflow-hidden border divide-y"
            role="list"
          >
            {stepIcons.slice(0, status.totalSteps).map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <li
                  key={index}
                  className={`
                    relative p-4 transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-4
                    ${
                      isCompleted
                        ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                        : ""
                    }
                    ${
                      isCurrent
                        ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
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
        </section>
      </section>
    </main>
  );
}
