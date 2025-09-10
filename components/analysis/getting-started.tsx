export default function GettingStarted() {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="w-full flex-none relative before:absolute before:top-0 before:h-px before:w-[200vw] before:bg-border before:-left-[100vw] after:absolute after:bottom-0 after:h-px after:w-[200vw] after:bg-border after:-left-[100vw]">
        <div className="p-2 bg-muted/30">
          <div className="rounded-lg p-4 bg-background border">
            <h2 className="font-bold text-lg">Accessibility Analysis</h2>
            <p className="text-muted-foreground">
              Get comprehensive accessibility insights for any website.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex-none">
        <div className="bg-muted/30 divide-y md:divide-x md:divide-y-0 grid grid-cols-1 md:grid-cols-3">
          <div className="p-2">
            <div className="rounded-lg p-4 bg-background border">
              <h2 className="font-bold mb-2">WCAG Compliance</h2>
              <p className="text-muted-foreground text-sm">
                Check compliance with Web Content Accessibility Guidelines.
              </p>
            </div>
          </div>
          <div className="p-2">
            <div className="rounded-lg p-4 bg-background border">
              <h2 className="font-bold mb-2">Instant Result</h2>
              <p className="text-muted-foreground text-sm">
                Receive accessibility insights immediately after analysis.
              </p>
            </div>
          </div>
          <div className="p-2">
            <div className="rounded-lg p-4 bg-background border">
              <h2 className="font-bold mb-2">Actionable Insights</h2>
              <p className="text-muted-foreground text-sm">
                Receive clear recommendations to improve website accessibility.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex-none relative before:absolute before:top-0 before:h-px before:w-[200vw] before:bg-border before:-left-[100vw] after:absolute after:bottom-0 after:h-px after:w-[200vw] after:bg-border after:-left-[100vw]">
        <div className="p-2 bg-muted/30">
          <div className="rounded-lg p-4 bg-background border">
            <p className="text-muted-foreground text-sm">
              <span className="font-bold">How it works</span>: Enter a website
              URL, and our tool scans the site for accessibility issues,
              providing a detailed report with findings and recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
