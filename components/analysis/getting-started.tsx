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
            <div className="p-4">
              <h3 className="font-semibold mb-2">WCAG Compliance</h3>
              <p className="text-sm text-muted-foreground">
                Check compliance with Web Content Accessibility Guidelines
              </p>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">Instant Results</h3>
              <p className="text-sm text-muted-foreground">
                Get detailed analysis results in seconds
              </p>
            </div>
            <div className="p-4">
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
        <div className="hidden md:grid absolute top-1/2 translate-y-1/2 w-full place-items-center z-0">
          <Hue />
        </div>
      </div>
    </div>
  );
}
