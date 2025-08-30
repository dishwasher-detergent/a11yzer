import { Badge } from "@/components/ui/badge";
import {
  LimitedData,
  ProblematicElement,
} from "@/interfaces/analysis.interface";

interface AnalysisScreenshotProps {
  screenshotUrl: string;
  problematicElements?: LimitedData<ProblematicElement>;
}

export function AnalysisScreenshot({
  screenshotUrl,
  problematicElements,
}: AnalysisScreenshotProps) {
  return (
    <div className="flex flex-row gap-2">
      <div className="max-h-96 overflow-y-auto">
        <img
          src={screenshotUrl}
          alt="Website screenshot with accessibility highlights"
          className="w-full max-w-2xl mx-auto"
        />
      </div>
      {problematicElements && problematicElements.items.length > 0 && (
        <div className="p-2 max-h-96 overflow-y-auto">
          <h4 className="font-semibold mb-2">
            {problematicElements.items.length} issues highlighted
            {problematicElements.limited && (
              <span className="text-orange-600 ml-1">
                (showing {problematicElements.items.length} of{" "}
                {problematicElements.totalCount})
              </span>
            )}
          </h4>
          <div className="space-y-2">
            {problematicElements.items.map((element, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Badge variant={element.priority}>{element.issue}</Badge>
                <span className="text-muted-foreground truncate">
                  {element.text || element.selector}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
