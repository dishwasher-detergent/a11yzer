export default function GettingStarted() {
  return (
    <section className="grid h-full place-items-center mx-auto max-w-5xl w-full">
      <div className="grid grid-cols-3 p-4 gap-2">
        <header className="p-4 col-span-3">
          <h1 className="font-bold text-2xl">Accessibility Analysis</h1>
          <p className="text-muted-foreground">
            Get comprehensive accessibility insights for any website.
          </p>
        </header>
        <article className="rounded-lg p-4 bg-background border">
          <h2 className="font-bold mb-2">WCAG Compliance</h2>
          <p className="text-muted-foreground text-sm">
            Check compliance with Web Content Accessibility Guidelines.
          </p>
        </article>
        <article className="rounded-lg p-4 bg-background border">
          <h2 className="font-bold mb-2">Instant Result</h2>
          <p className="text-muted-foreground text-sm">
            Receive accessibility insights immediately after analysis.
          </p>
        </article>
        <article className="rounded-lg p-4 bg-background border">
          <h2 className="font-bold mb-2">Actionable Insights</h2>
          <p className="text-muted-foreground text-sm">
            Receive clear recommendations to improve website accessibility.
          </p>
        </article>
        <aside className="col-span-3 p-4 border bg-secondary rounded-lg">
          <p className="text-muted-foreground text-xs">
            <strong>How it works</strong>: Enter a website URL, and our tool
            scans the site for accessibility issues, providing a detailed report
            with findings and recommendations.
          </p>
        </aside>
      </div>
    </section>
  );
}
