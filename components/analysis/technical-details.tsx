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
    <section className="p-4" aria-labelledby="technical-details-heading">
      <h2 id="technical-details-heading" className="font-semibold text-lg pb-2">
        Technical Details
      </h2>
      <p className="text-muted-foreground text-sm pb-4">
        This includes an analysis of the semantic structure and key content
        elements like headings, images, and links.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-md">
        <section aria-labelledby="semantic-structure-heading">
          <h3 id="semantic-structure-heading" className="font-semibold mb-2">
            Semantic Structure
          </h3>
          <dl className="text-sm space-y-2">
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
                    <span className="sr-only">{status.status}</span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>

        <section aria-labelledby="content-analysis-heading">
          <h3 id="content-analysis-heading" className="font-semibold mb-2">
            Content Analysis
          </h3>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between items-center">
              <dt className="font-medium">Headings:</dt>
              <dd>
                <span
                  aria-label={`${accessibilityData.headings.items.length} headings found`}
                >
                  {accessibilityData.headings.items.length}
                </span>
                {accessibilityData.headings.limited && (
                  <span
                    className="text-amber-600 ml-1 text-xs"
                    aria-label={`Limited to ${accessibilityData.headings.items.length} of ${accessibilityData.headings.totalCount} total`}
                  >
                    (of {accessibilityData.headings.totalCount})
                  </span>
                )}
              </dd>
            </div>

            <div className="flex justify-between items-center">
              <dt className="font-medium">Images:</dt>
              <dd>
                <span
                  aria-label={`${accessibilityData.images.items.length} images found`}
                >
                  {accessibilityData.images.items.length}
                </span>
                {accessibilityData.images.limited && (
                  <span
                    className="text-amber-600 ml-1 text-xs"
                    aria-label={`Limited to ${accessibilityData.images.items.length} of ${accessibilityData.images.totalCount} total`}
                  >
                    (of {accessibilityData.images.totalCount})
                  </span>
                )}
              </dd>
            </div>

            <div className="flex justify-between items-center">
              <dt className="font-medium">Images with alt text:</dt>
              <dd>
                <span
                  aria-label={`${
                    accessibilityData.images.items.filter((img) => img.hasAlt)
                      .length
                  } images have alt text`}
                >
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
                <span
                  aria-label={`${accessibilityData.links.items.length} links found`}
                >
                  {accessibilityData.links.items.length}
                </span>
                {accessibilityData.links.limited && (
                  <span
                    className="text-amber-600 ml-1 text-xs"
                    aria-label={`Limited to ${accessibilityData.links.items.length} of ${accessibilityData.links.totalCount} total`}
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
                    <span
                      aria-label={`${accessibilityData.forms.items.length} forms found`}
                    >
                      {accessibilityData.forms.items.length}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="font-medium">Form inputs:</dt>
                  <dd>
                    <span
                      aria-label={`${accessibilityData.forms.items.reduce(
                        (sum, form) => sum + form.inputs.length,
                        0
                      )} form inputs found`}
                    >
                      {accessibilityData.forms.items.reduce(
                        (sum, form) => sum + form.inputs.length,
                        0
                      )}
                    </span>
                    {accessibilityData.forms.limited && (
                      <span
                        className="text-amber-600 ml-1 text-xs"
                        aria-label={`Limited results shown of ${accessibilityData.forms.totalCount} total`}
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
                  <span
                    aria-label={`${accessibilityData.ariaLabels.items.length} ARIA elements found`}
                  >
                    {accessibilityData.ariaLabels.items.length}
                  </span>
                  {accessibilityData.ariaLabels.limited && (
                    <span
                      className="text-amber-600 ml-1 text-xs"
                      aria-label={`Limited to ${accessibilityData.ariaLabels.items.length} of ${accessibilityData.ariaLabels.totalCount} total`}
                    >
                      (of {accessibilityData.ariaLabels.totalCount})
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </section>
  );
}
