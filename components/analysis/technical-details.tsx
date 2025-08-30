import { AccessibilityData } from "@/interfaces/analysis.interface";

interface TechnicalDetailsProps {
  accessibilityData: AccessibilityData;
}

export function TechnicalDetails({ accessibilityData }: TechnicalDetailsProps) {
  return (
    <div className="p-4">
      <h2 className="font-semibold text-lg pb-2">Technical Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-2">Semantic Structure</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Main element:</span>
              <span
                className={
                  accessibilityData.semanticStructure.hasMain
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
              >
                {accessibilityData.semanticStructure.hasMain ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Navigation:</span>
              <span
                className={
                  accessibilityData.semanticStructure.hasNav
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
              >
                {accessibilityData.semanticStructure.hasNav ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Header:</span>
              <span
                className={
                  accessibilityData.semanticStructure.hasHeader
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
              >
                {accessibilityData.semanticStructure.hasHeader ? "✓" : "✗"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Footer:</span>
              <span
                className={
                  accessibilityData.semanticStructure.hasFooter
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
              >
                {accessibilityData.semanticStructure.hasFooter ? "✓" : "✗"}
              </span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Content Analysis</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Headings:</span>
              <span>
                {accessibilityData.headings.items.length}
                {accessibilityData.headings.limited && (
                  <span className="text-amber-600 ml-1 text-xs">
                    (of {accessibilityData.headings.totalCount})
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Images:</span>
              <span>
                {accessibilityData.images.items.length}
                {accessibilityData.images.limited && (
                  <span className="text-amber-600 ml-1 text-xs">
                    (of {accessibilityData.images.totalCount})
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Images with alt text:</span>
              <span>
                {
                  accessibilityData.images.items.filter((img) => img.hasAlt)
                    .length
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span>Links:</span>
              <span>
                {accessibilityData.links.items.length}
                {accessibilityData.links.limited && (
                  <span className="text-amber-600 ml-1 text-xs">
                    (of {accessibilityData.links.totalCount})
                  </span>
                )}
              </span>
            </div>
            {accessibilityData.forms && (
              <>
                <div className="flex justify-between">
                  <span>Forms:</span>
                  <span>{accessibilityData.forms.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Form inputs:</span>
                  <span>
                    {accessibilityData.forms.items.reduce(
                      (sum, form) => sum + form.inputs.length,
                      0
                    )}
                    {accessibilityData.forms.limited && (
                      <span className="text-amber-600 ml-1 text-xs">
                        (of {accessibilityData.forms.totalCount})
                      </span>
                    )}
                  </span>
                </div>
              </>
            )}
            {accessibilityData.ariaLabels && (
              <div className="flex justify-between">
                <span>ARIA elements:</span>
                <span>
                  {accessibilityData.ariaLabels.items.length}
                  {accessibilityData.ariaLabels.limited && (
                    <span className="text-amber-600 ml-1 text-xs">
                      (of {accessibilityData.ariaLabels.totalCount})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
