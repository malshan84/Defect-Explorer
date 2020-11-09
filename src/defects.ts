export interface Label {
  id: number;
  name: string;
  url: string;
}

export interface Severity {
  description: string;
  kind: number;
}

export interface Confidence {
  description: string;
  kind: number;
}

export interface Defect {
  id: number;
  rule: string;
  ruleSet: string;
  labels: Label[];
  message: string;
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
  path: string;
  sourceFileBodyHash: string;
  function: string;
  functionSignature: string;
  severity: Severity;
  confidence: Confidence;
  status: string;
  assignee: string;
  assigneeInfo?: any;
  templateNumber: number;
  newlyFound: boolean;
  suppressionHash: string;
}

export interface Defects {
  numberOfDefects: number;
  defects: Defect[];
}
