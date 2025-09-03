import {
  LucideAlertCircle,
  LucideAlertTriangle,
  LucideInfo,
} from "lucide-react";
import { useCallback, useRef } from "react";

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
  const elementCount = problematicElements?.items.length || 0;
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const getPriorityIcon = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return LucideAlertTriangle;
      case "medium":
        return LucideAlertCircle;
      case "low":
        return LucideInfo;
      default:
        return LucideInfo;
    }
  };

  const scrollToElement = useCallback((element: ProblematicElement) => {
    if (
      !imageContainerRef.current ||
      !imageRef.current ||
      !element.boundingBox
    ) {
      return;
    }

    const container = imageContainerRef.current;
    const image = imageRef.current;
    const bbox = element.boundingBox;

    const containerRect = container.getBoundingClientRect();
    const scaleX = image.offsetWidth / image.naturalWidth;
    const scaleY = image.offsetHeight / image.naturalHeight;
    const elementCenterX = (bbox.x + bbox.width / 2) * scaleX;
    const elementCenterY = (bbox.y + bbox.height / 2) * scaleY;
    const scrollLeft = elementCenterX - containerRect.width / 2;
    const scrollTop = elementCenterY - containerRect.height / 2;

    container.scrollTo({
      left: Math.max(0, scrollLeft),
      top: Math.max(0, scrollTop),
      behavior: "smooth",
    });
  }, []);

  const handleElementClick = useCallback(
    (element: ProblematicElement) => {
      scrollToElement(element);
    },
    [scrollToElement]
  );

  return (
    <section
      className="col-span-2 col-start-1"
      aria-labelledby="problematic-elements-heading"
      role="region"
    >
      <header className="p-4">
        <h2
          id="problematic-elements-heading"
          className="font-semibold text-lg pb-2"
        >
          Problematic Elements
        </h2>
        <p
          className="text-muted-foreground text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {elementCount} {elementCount === 1 ? "element" : "elements"} found
          with issues.
        </p>
      </header>
      <div
        className="flex flex-col lg:flex-row border rounded-md overflow-hidden"
        role="group"
        aria-labelledby="screenshot-and-elements"
      >
        <h3 id="screenshot-and-elements" className="sr-only">
          Website screenshot and problematic elements list
        </h3>

        <div
          ref={imageContainerRef}
          className="max-h-96 overflow-y-auto w-full border-b lg:border-b-0 lg:border-r"
          role="img"
          aria-labelledby="screenshot-description"
        >
          <img
            ref={imageRef}
            src={screenshotUrl}
            alt="Website screenshot showing accessibility problem areas highlighted for analysis"
            className="w-full"
            loading="lazy"
            aria-describedby="screenshot-description"
          />
          <div id="screenshot-description" className="sr-only">
            Screenshot of the analyzed website with highlighted areas indicating
            accessibility issues. The highlighted elements correspond to the
            issues listed in the adjacent panel.
          </div>
        </div>

        {problematicElements && problematicElements.items.length > 0 && (
          <div
            className="max-h-96 overflow-y-auto w-full lg:w-2/5 flex-none"
            role="complementary"
            aria-labelledby="elements-list-heading"
          >
            <h4 id="elements-list-heading" className="sr-only">
              List of problematic elements
            </h4>
            <ul
              className="space-y-1 divide-y"
              role="list"
              aria-label={`${elementCount} problematic elements found`}
            >
              {problematicElements.items.map((element, index) => (
                <li
                  key={index}
                  className="border-dashed flex items-start gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded p-2 transition-colors focus-within:bg-muted/50"
                  role="listitem"
                  aria-describedby={`element-description-${index}`}
                  onClick={() => handleElementClick(element)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleElementClick(element);
                    }
                  }}
                  tabIndex={0}
                  title="Click to scroll to this element in the screenshot"
                  aria-label={`Click to view ${
                    element.issue
                  } issue on element: ${element.text || element.selector}`}
                >
                  <Badge
                    variant={element.priority}
                    aria-label={`Priority ${element.priority}: ${element.issue}`}
                    title={`Issue: ${element.issue} (Priority: ${element.priority})`}
                  >
                    {(() => {
                      const IconComponent = getPriorityIcon(element.priority);
                      return (
                        <IconComponent className="w-3 h-3" aria-hidden="true" />
                      );
                    })()}
                    <span className="capitalize">{element.priority}</span>
                  </Badge>
                  <div>
                    <p>{element.issue}</p>
                    <p className="text-muted-foreground break-all">
                      {element.text || element.selector}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
