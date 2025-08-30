import {
  AccessibilityData,
  LimitedData,
} from "@/interfaces/analysis.interface";

export interface LimitsInfo {
  anyLimited: boolean;
  limitedCategories: string[];
  summary: string;
  details: Array<{
    category: string;
    showing: number;
    total: number;
    limited: boolean;
  }>;
}

export function createLimitsInfo(
  accessibilityData: AccessibilityData
): LimitsInfo {
  const limitedCategories: string[] = [];
  const details: Array<{
    category: string;
    showing: number;
    total: number;
    limited: boolean;
  }> = [];

  // Check each data category for limits
  const categories = [
    { name: "headings", data: accessibilityData.headings },
    { name: "images", data: accessibilityData.images },
    { name: "links", data: accessibilityData.links },
    { name: "forms", data: accessibilityData.forms },
    { name: "aria labels", data: accessibilityData.ariaLabels },
  ];

  categories.forEach(({ name, data }) => {
    const isLimited = data.limited;
    details.push({
      category: name,
      showing: data.items.length,
      total: data.totalCount,
      limited: isLimited,
    });

    if (isLimited) {
      limitedCategories.push(name);
    }
  });

  const anyLimited = limitedCategories.length > 0;

  const summary = anyLimited
    ? `Analysis was performed on a sample of data. Some categories (${limitedCategories.join(
        ", "
      )}) were limited to prevent overwhelming the analysis. Full analysis may require examining additional elements.`
    : "Complete analysis was performed on all page elements.";

  return {
    anyLimited,
    limitedCategories,
    summary,
    details,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDataLimited(dataset: LimitedData<any>): boolean {
  return dataset.limited;
}

export function getDataSummary(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataset: LimitedData<any>,
  categoryName: string
): string {
  if (dataset.limited) {
    return `${categoryName}: Showing ${dataset.items.length} of ${dataset.totalCount} (limited)`;
  }
  return `${categoryName}: ${dataset.items.length} items`;
}
