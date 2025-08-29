// Analysis interfaces for the accessibility checker

export interface SemanticStructure {
  hasMain: boolean;
  hasNav: boolean;
  hasHeader: boolean;
  hasFooter: boolean;
}

export interface Heading {
  level: string;
  text: string;
  hasId: boolean;
}

export interface Image {
  src: string;
  alt: string;
  hasAlt: boolean;
}

export interface Link {
  href: string;
  text: string;
  hasTitle: boolean;
}

export interface FormInput {
  type: string;
  hasLabel: boolean;
  hasId: boolean;
}

export interface Form {
  inputs: FormInput[];
  hasFieldset: boolean;
}

export interface AriaElement {
  tag: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  role?: string;
}

export interface ProblematicElement {
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

export interface RawData {
  semanticStructure: SemanticStructure;
  headings: LimitedData<Heading>;
  images: LimitedData<Image>;
  links: LimitedData<Link>;
  forms?: LimitedData<Form>;
  ariaLabels?: LimitedData<AriaElement>;
}

export interface AnalysisResult {
  url: string;
  screenshot: string;
  originalScreenshot?: string;
  analysis: Analysis;
  rawData: RawData;
  problematicElements?: LimitedData<ProblematicElement>;
  limits?: AnalysisLimits;
}
