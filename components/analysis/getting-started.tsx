import { LucideCheckCircle, LucideLightbulb, LucideZap } from "lucide-react";

import { Hue } from "@/components/hue";

export default function GettingStart() {
  return (
    <div className="lg:col-span-2 flex flex-col items-center md:justify-center space-y-6">
      <div className="space-y-4 max-w-2xl relative">
        <div className="rounded-md border relative z-10 bg-background">
          <header className="p-4 border-b">
            <h2 className="font-semibold text-lg pb-2">
              Accessibility Analysis
            </h2>
            <p className="text-muted-foreground text-sm">
              Get comprehensive accessibility insights for any website
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-y-0 divide-y">
            <div className="p-4 flex md:flex-col gap-4">
              <div className="size-8 flex-none rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center">
                <LucideCheckCircle className="h-3" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">WCAG Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  Check compliance with Web Content Accessibility Guidelines
                </p>
              </div>
            </div>
            <div className="p-4 flex md:flex-col gap-4">
              <div className="size-8 flex-none rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center">
                <LucideZap className="h-3" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-sm text-muted-foreground">
                  Get detailed analysis results in seconds
                </p>
              </div>
            </div>
            <div className="p-4 flex md:flex-col gap-4">
              <div className="size-8 flex-none rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 flex items-center justify-center">
                <LucideLightbulb className="h-3" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Actionable Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Get specific recommendations to improve accessibility
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-muted border-t">
            <p className="text-sm text-muted-foreground">
              <strong>How it works:</strong> Enter any website URL below and
              we&apos;ll analyze it for accessibility issues, provide a
              compliance score, and give you detailed recommendations for
              improvements.
            </p>
          </div>
        </div>
        <div className="hidden md:grid absolute top-1/2 translate-y-1/2 w-full place-items-center z-0">
          <Hue />
        </div>
      </div>
    </div>
  );
}
