import { LucideCheckCircle, LucideLightbulb, LucideZap } from "lucide-react";

export default function GettingStart() {
  return (
    <div className="lg:col-span-2 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">
          Accessibility Analysis
        </h1>
        <p className="text-xl text-muted-foreground">
          Get comprehensive accessibility insights for any website
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 mt-8 rounded-md border divide-x">
          <div className="p-4">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 flex items-center justify-center mb-3">
              <LucideCheckCircle className="h-3" />
            </div>
            <h3 className="font-semibold mb-2">WCAG Compliance</h3>
            <p className="text-sm text-muted-foreground">
              Check compliance with Web Content Accessibility Guidelines
            </p>
          </div>
          <div className="p-4">
            <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 dark:bg-green-900 flex items-center justify-center mb-3">
              <LucideZap className="h-3" />
            </div>
            <h3 className="font-semibold mb-2">Instant Results</h3>
            <p className="text-sm text-muted-foreground">
              Get detailed analysis results in seconds
            </p>
          </div>
          <div className="p-4">
            <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 flex items-center justify-center mb-3">
              <LucideLightbulb className="h-3" />
            </div>
            <h3 className="font-semibold mb-2">Actionable Insights</h3>
            <p className="text-sm text-muted-foreground">
              Get specific recommendations to improve accessibility
            </p>
          </div>
        </div>
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm text-muted-foreground">
            <strong>How it works:</strong> Enter any website URL below and
            we&apos;ll analyze it for accessibility issues, provide a compliance
            score, and give you detailed recommendations for improvements.
          </p>
        </div>
      </div>
    </div>
  );
}
