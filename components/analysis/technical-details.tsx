import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RawData } from "@/interfaces/analysis.interface";

interface TechnicalDetailsProps {
  rawData: RawData;
}

export function TechnicalDetails({ rawData }: TechnicalDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Semantic Structure</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Main element:</span>
                <span
                  className={
                    rawData.semanticStructure.hasMain
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {rawData.semanticStructure.hasMain ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Navigation:</span>
                <span
                  className={
                    rawData.semanticStructure.hasNav
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {rawData.semanticStructure.hasNav ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Header:</span>
                <span
                  className={
                    rawData.semanticStructure.hasHeader
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {rawData.semanticStructure.hasHeader ? "✓" : "✗"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Footer:</span>
                <span
                  className={
                    rawData.semanticStructure.hasFooter
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {rawData.semanticStructure.hasFooter ? "✓" : "✗"}
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
                  {rawData.headings.items.length}
                  {rawData.headings.limited && (
                    <span className="text-orange-600 ml-1 text-xs">
                      (of {rawData.headings.totalCount})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Images:</span>
                <span>
                  {rawData.images.items.length}
                  {rawData.images.limited && (
                    <span className="text-orange-600 ml-1 text-xs">
                      (of {rawData.images.totalCount})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Images with alt text:</span>
                <span>
                  {rawData.images.items.filter((img) => img.hasAlt).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Links:</span>
                <span>
                  {rawData.links.items.length}
                  {rawData.links.limited && (
                    <span className="text-orange-600 ml-1 text-xs">
                      (of {rawData.links.totalCount})
                    </span>
                  )}
                </span>
              </div>
              {rawData.forms && (
                <>
                  <div className="flex justify-between">
                    <span>Forms:</span>
                    <span>{rawData.forms.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Form inputs:</span>
                    <span>
                      {rawData.forms.items.reduce(
                        (sum, form) => sum + form.inputs.length,
                        0
                      )}
                      {rawData.forms.limited && (
                        <span className="text-orange-600 ml-1 text-xs">
                          (of {rawData.forms.totalCount})
                        </span>
                      )}
                    </span>
                  </div>
                </>
              )}
              {rawData.ariaLabels && (
                <div className="flex justify-between">
                  <span>ARIA elements:</span>
                  <span>
                    {rawData.ariaLabels.items.length}
                    {rawData.ariaLabels.limited && (
                      <span className="text-orange-600 ml-1 text-xs">
                        (of {rawData.ariaLabels.totalCount})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
