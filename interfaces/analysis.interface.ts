// Analysis interfaces for the accessibility checker

export interface ElementInfo {
  selector: string;
  text: string;
  issue: string;
  priority: "high" | "medium" | "low";
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface LimitedData<T> {
  items: T[];
  totalCount: number;
  limited: boolean;
}

export interface SemanticStructure {
  hasMain: boolean;
  hasNav: boolean;
  hasHeader: boolean;
  hasFooter: boolean;
  hasAside: boolean;
  hasSection: boolean;
  hasArticle: boolean;
  skipLinks: number;
}

export interface KeyboardNavigation {
  focusableElements: number;
  tabIndexElements: number;
  negativeTabIndex: number;
}

export interface Heading {
  level: string;
  text: string;
  hasId: boolean;
}

// Alias for compatibility
export interface HeadingData extends Heading {}

export interface Image {
  src: string;
  alt: string | undefined;
  hasAlt: boolean;
}

// Alias for compatibility
export interface ImageData extends Image {}

export interface Link {
  href: string;
  text: string;
  hasTitle: boolean;
}

// Alias for compatibility
export interface LinkData extends Link {}

export interface FormInput {
  type: string;
  hasLabel: boolean;
  hasId: boolean;
}

export interface Form {
  inputs: FormInput[];
  hasFieldset: boolean;
}

// Alias for compatibility
export interface FormData extends Form {}

export interface AriaElement {
  tag: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  role?: string;
}

export interface ProblematicElement extends ElementInfo {}

export interface LimitInfo {
  limited: boolean;
  showing: number;
  total: number;
}

export interface AnalysisLimits {
  headings: LimitInfo;
  images: LimitInfo;
  links: LimitInfo;
  forms: LimitInfo;
  ariaLabels: LimitInfo;
  problematicElements: LimitInfo;
}

export interface AnalysisIssue {
  type: "accessibility" | "ux" | "ui";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  recommendation: string;
  wcagCriterion?: string;
}

export interface Analysis {
  overallScore: number;
  issues: AnalysisIssue[];
  summary: string;
}

export interface AccessibilityData {
  title: string;
  headings: LimitedData<Heading>;
  images: LimitedData<Image>;
  links: LimitedData<Link>;
  forms: LimitedData<Form>;
  ariaLabels: LimitedData<AriaElement>;
  semanticStructure: SemanticStructure;
  keyboardNavigation: KeyboardNavigation;
}

export interface AnalysisResult {
  url: string;
  screenshotUrl: string;
  originalScreenshot?: string;
  analysis: Analysis;
  accessibilityData: AccessibilityData;
  problematicElements?: LimitedData<ProblematicElement>;
  limits?: AnalysisLimits;
}
