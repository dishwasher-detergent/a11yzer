import { LucideCheckCircle, LucideLightbulb, LucideZap } from "lucide-react";
import { ShineBorder } from "../shine-border";

export default function GettingStart() {
  return (
    <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="space-y-4 max-w-2xl">
        <div className="rounded-md border mt-8 relative">
          <ShineBorder
            shineColor={[
              "var(--color-pink-300)",
              "var(--color-red-300)",
              "var(--color-yellow-300)",
              "var(--color-green-300)",
              "var(--color-blue-300)",
            ]}
          />
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold tracking-tight">
              Accessibility Analysis
            </h1>
            <p className="text-lg text-muted-foreground">
              Get comprehensive accessibility insights for any website
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-x">
            <div className="p-4 flex flex-col">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center mb-3">
                <LucideCheckCircle className="h-3" />
              </div>
              <h3 className="font-semibold mb-2">WCAG Compliance</h3>
              <p className="text-sm text-muted-foreground">
                Check compliance with Web Content Accessibility Guidelines
              </p>
            </div>
            <div className="p-4 flex flex-col">
              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center mb-3">
                <LucideZap className="h-3" />
              </div>
              <h3 className="font-semibold mb-2">Instant Results</h3>
              <p className="text-sm text-muted-foreground">
                Get detailed analysis results in seconds
              </p>
            </div>
            <div className="p-4 flex flex-col">
              <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300 flex items-center justify-center mb-3">
                <LucideLightbulb className="h-3" />
              </div>
              <h3 className="font-semibold mb-2">Actionable Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get specific recommendations to improve accessibility
              </p>
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
      </div>
    </div>
  );
}
