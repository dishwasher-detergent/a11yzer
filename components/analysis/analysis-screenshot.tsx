import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LimitedData,
  ProblematicElement,
} from "@/interfaces/analysis.interface";

interface AnalysisScreenshotProps {
  screenshot: string;
  problematicElements?: LimitedData<ProblematicElement>;
}

export function AnalysisScreenshot({
  screenshot,
  problematicElements,
}: AnalysisScreenshotProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Analysis</CardTitle>
        <CardDescription>
          Accessibility issues are highlighted on the page screenshot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1 p-3 bg-muted rounded-lg">
          <Badge variant="high">High</Badge>
          <Badge variant="medium">Medium</Badge>
          <Badge variant="low">Low</Badge>
          {problematicElements && (
            <span className="text-sm text-muted-foreground ml-4">
              {problematicElements.items.length} issues highlighted
              {problematicElements.limited && (
                <span className="text-orange-600 ml-1">
                  (showing {problematicElements.items.length} of{" "}
                  {problematicElements.totalCount})
                </span>
              )}
            </span>
          )}
        </div>
        <img
          src={screenshot}
          alt="Website screenshot with accessibility highlights"
          className="w-full max-w-2xl mx-auto rounded-lg border"
        />
        {problematicElements && problematicElements.items.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Highlighted Issues:</h4>
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
      </CardContent>
    </Card>
  );
}
