import { Badge } from "@/components/ui/badge";
import {
  LimitedData,
  ProblematicElement,
} from "@/interfaces/analysis.interface";

interface AnalysisProblematicElementsProps {
  screenshotUrl: string;
  problematicElements?: LimitedData<ProblematicElement>;
}

export function AnalysisProblematicElements({
  screenshotUrl,
  problematicElements,
}: AnalysisProblematicElementsProps) {
  return (
    <div className="col-span-2 col-start-1">
      <div className="p-4">
        <h2 className="font-semibold text-lg pb-2">Problematic Elements</h2>
        <p className="text-muted-foreground text-sm">
          {problematicElements?.items.length} elements found with issues.
        </p>
      </div>
      <div className="flex flex-col lg:flex-row  gap-2 border rounded-md overflow-hidden">
        <div className="max-h-96 overflow-y-auto w-full lg:w-3/5 flex-none border-b lg:border-b-none lg:border-r">
          <img
            src={screenshotUrl}
            alt="Website screenshot with accessibility highlights"
            className="w-full"
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
