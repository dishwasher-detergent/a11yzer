import { AnalysisLimits } from "@/interfaces/analysis.interface";
import { toast } from "sonner";

export function useLimitNotifications() {
  const showLimitNotifications = (limits?: AnalysisLimits) => {
    if (!limits) return;

    const limitedItems: string[] = [];

    if (limits.headings.limited) {
      limitedItems.push(
        `Headings (${limits.headings.showing}/${limits.headings.total})`
      );
    }
    if (limits.images.limited) {
      limitedItems.push(
        `Images (${limits.images.showing}/${limits.images.total})`
      );
    }
    if (limits.links.limited) {
      limitedItems.push(
        `Links (${limits.links.showing}/${limits.links.total})`
      );
    }
    if (limits.forms.limited) {
      limitedItems.push(
        `Form inputs (${limits.forms.showing}/${limits.forms.total})`
      );
    }
    if (limits.ariaLabels.limited) {
      limitedItems.push(
        `ARIA elements (${limits.ariaLabels.showing}/${limits.ariaLabels.total})`
      );
    }
    if (limits.problematicElements.limited) {
      limitedItems.push(
        `Issues highlighted (${limits.problematicElements.showing}/${limits.problematicElements.total})`
      );
    }

    if (limitedItems.length > 0) {
      toast.info("Analysis Data Limited", {
        description: `Some data was limited to optimize analysis: ${limitedItems.join(
          ", "
        )}. The analysis focused on the most important elements.`,
        duration: 8000,
        action: {
          label: "Learn More",
          onClick: () => {
            toast.info("Data Limiting Explanation", {
              description:
                "To ensure optimal AI analysis performance, we limit the amount of data sent. The analysis focuses on the most critical accessibility issues first.",
              duration: 6000,
            });
          },
        },
      });
    }
  };

  return { showLimitNotifications };
}
