import { AccessibilityData } from "@/interfaces/analysis.interface";

interface TechnicalDetailsProps {
  accessibilityData: AccessibilityData;
}

export function TechnicalDetails({ accessibilityData }: TechnicalDetailsProps) {
  const getSemanticStatus = (hasElement: boolean, elementName: string) => ({
    status: hasElement ? "Present" : "Missing",
    className: hasElement ? "text-emerald-600" : "text-rose-600",
    icon: hasElement ? "✓" : "✗",
    ariaLabel: `${elementName}: ${hasElement ? "Present" : "Missing"}`,
  });

  return (
    <section className="not-prose p-4 rounded-lg bg-background border mb-4">
      <header className="pb-4">
        <h2 className="font-semibold text-lg">Technical Details</h2>
        <p className="text-muted-foreground text-sm">
          This includes an analysis of the semantic structure and key content
          elements like headings, images, and links.
        </p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-md">
        <section>
          <h3 className="font-semibold mb-2">Semantic Structure</h3>
          <dl className="text-sm space-y-1">
            {[
              { key: "hasMain" as const, label: "Main element" },
              { key: "hasNav" as const, label: "Navigation" },
              { key: "hasHeader" as const, label: "Header" },
              { key: "hasFooter" as const, label: "Footer" },
            ].map(({ key, label }) => {
              const hasElement = accessibilityData.semanticStructure[key];
              const status = getSemanticStatus(hasElement, label);

              return (
                <div key={key} className="flex justify-between items-center">
                  <dt className="font-medium">{label}:</dt>
                  <dd>
                    <span
                      className={status.className}
                      aria-label={status.ariaLabel}
                      role="img"
                    >
                      {status.icon}
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
        <section>
          <h3 className="font-semibold mb-2">Content Analysis</h3>
          <dl className="text-sm space-y-1">
            <div className="flex justify-between items-center">
              <dt className="font-medium">Headings:</dt>
              <dd>
                <span>{accessibilityData.headings.items.length}</span>
                {accessibilityData.headings.limited && (
                  <span
                    className="text-amber-600 ml-1 text-xs"
                    title="Results are limited"
                  >
                    (of {accessibilityData.headings.totalCount})
                  </span>
                )}
              </dd>
            </div>

            <div className="flex justify-between items-center">
              <dt className="font-medium">Images:</dt>
              <dd>
                <span>{accessibilityData.images.items.length}</span>
                {accessibilityData.images.limited && (
                  <span
                    className="text-amber-600 ml-1 text-xs"
                    title="Results are limited"
                  >
                    (of {accessibilityData.images.totalCount})
                  </span>
                )}
              </dd>
            </div>

            <div className="flex justify-between items-center">
              <dt className="font-medium">Images with alt text:</dt>
              <dd>
                <span>
                  {
                    accessibilityData.images.items.filter((img) => img.hasAlt)
                      .length
                  }
                </span>
              </dd>
            </div>

            <div className="flex justify-between items-center">
              <dt className="font-medium">Links:</dt>
              <dd>
                <span>{accessibilityData.links.items.length}</span>
                {accessibilityData.links.limited && (
                  <span
                    className="text-amber-600 ml-1 text-xs"
                    title="Results are limited"
                  >
                    (of {accessibilityData.links.totalCount})
                  </span>
                )}
              </dd>
            </div>
            {accessibilityData.forms && (
              <>
                <div className="flex justify-between items-center">
                  <dt className="font-medium">Forms:</dt>
                  <dd>
                    <span>{accessibilityData.forms.items.length}</span>
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="font-medium">Form inputs:</dt>
                  <dd>
                    <span>
                      {accessibilityData.forms.items.reduce(
                        (sum, form) => sum + form.inputs.length,
                        0
                      )}
                    </span>
                    {accessibilityData.forms.limited && (
                      <span
                        className="text-amber-600 ml-1 text-xs"
                        title="Results are limited"
                      >
                        (of {accessibilityData.forms.totalCount})
                      </span>
                    )}
                  </dd>
                </div>
              </>
            )}

            {accessibilityData.ariaLabels && (
              <div className="flex justify-between items-center">
                <dt className="font-medium">ARIA elements:</dt>
                <dd>
                  <span>{accessibilityData.ariaLabels.items.length}</span>
                  {accessibilityData.ariaLabels.limited && (
                    <span
                      className="text-amber-600 ml-1 text-xs"
                      title="Results are limited"
                    >
                      (of {accessibilityData.ariaLabels.totalCount})
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </section>
      </main>
    </section>
  );
}
