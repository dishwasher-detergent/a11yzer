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
    <div>
      <div className="p-4">
        <h2 className="font-semibold text-lg pb-2">Problematic Elements</h2>
        <p className="text-muted-foreground text-sm">
          {problematicElements?.items.length} elements found with issues.
        </p>
      </div>
      <div className="flex flex-row gap-2 border-b">
        <div className="max-h-96 overflow-y-auto">
          <img
            src={screenshotUrl}
            alt="Website screenshot with accessibility highlights"
            className="w-full max-w-2xl mx-auto"
          />
        </div>
        {problematicElements && problematicElements.items.length > 0 && (
          <ul className="p-2 max-h-96 overflow-y-auto space-y-1">
            {problematicElements.items.map((element, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Badge variant={element.priority}>{element.issue}</Badge>
                <span className="text-muted-foreground truncate">
                  {element.text || element.selector}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
