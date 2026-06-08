export const STATIONS = [
  'Inbox',
  'Clarification Station',
  'Scope Market',
  'Construction',
  'Judgement Hall',
  'Revision Alley',
  'Feedback Booth',
  'Departure Gate',
  'Trade Ledger',
  'Storage',
] as const;

export type Station = (typeof STATIONS)[number];

export const TASK_TYPES = [
  'Post',
  'Visual',
  'Video',
  'Document',
  'Product',
  'Application',
  'Strategy',
  'Admin',
  'Experiment',
  'Other',
] as const;

export const OUTPUT_FORMATS = [
  'Text post',
  'Carousel',
  'Short video',
  'Image',
  'PDF',
  'Email',
  'Landing page',
  'Prototype',
  'Internal note',
  'External asset',
  'Other',
] as const;

export const DESTINATIONS = [
  'Personal',
  'Social media',
  'Newsletter',
  'Website visitors',
  'Website / resource hub',
  'Client',
  'Enterprise buyer',
  'Recruiter or hiring manager',
  'Internal team',
  'Specific person',
  'Community',
  'Public audience',
  'Other',
] as const;

export const REVIEW_ROUTES = [
  'No review needed',
  'Self-review only',
  'Specific person',
  'Team review',
  'Client approval',
  'Founder approval',
] as const;

export const RISK_LEVELS = ['Low', 'Medium', 'High'] as const;

export const RELEASE_DECISIONS = [
  'Undecided',
  'Ship',
  'Revise Once',
  'Ask for Feedback',
  'Park',
] as const;

export const BLOCKERS = [
  'None',
  'Missing context',
  'Unclear goal',
  'Task type unclear',
  'Destination unclear',
  'No ship date detected',
  'Output type unclear',
  'Reviewer unclear',
  'Scope too broad',
  'Too many ideas',
  'Visual uncertainty',
  'Low confidence',
  'Waiting for feedback',
  'Factual check needed',
  'Perfectionism',
  'Boredom',
  'Other',
] as const;

export type TaskType = (typeof TASK_TYPES)[number];
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];
export type Destination = (typeof DESTINATIONS)[number];
export type Audience = Destination;
export type ReviewRoute = (typeof REVIEW_ROUTES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type ReleaseDecision = (typeof RELEASE_DECISIONS)[number];
export type CurrentBlocker = (typeof BLOCKERS)[number];
export type AiFieldKey =
  | 'title'
  | 'description'
  | 'taskType'
  | 'outputFormat'
  | 'audience'
  | 'riskLevel'
  | 'minimumShippableVersion'
  | 'shipDate'
  | 'shipGoal'
  | 'estimatedTime'
  | 'reviewRoute'
  | 'reviewerName';

export type AiDetectedBlocker = {
  id: string;
  label: CurrentBlocker;
  field: AiFieldKey | 'scopeItems' | 'minimumShippableItems';
  resolved: boolean;
  source: 'AI' | 'Manual';
};

export const INBOX_INPUT_TYPES = ['Text', 'Voice', 'File', 'Image', 'Link'] as const;

export type InboxInputType = (typeof INBOX_INPUT_TYPES)[number];

export type RawInboxItem = {
  id: string;
  rawTitle: string;
  rawText: string;
  inputType: InboxInputType;
  uploadedFileName: string;
  uploadedFileType: string;
  uploadedFilePreview: string;
  sourceLink: string;
  linkNotes: string;
  createdAt: string;
  processed: boolean;
};

export type ClarificationDraft = {
  title: string;
  description: string;
  taskType: TaskType;
  outputFormat: OutputFormat;
  audience: Audience;
  reviewRoute: ReviewRoute;
  reviewerName: string;
  riskLevel: RiskLevel;
  minimumShippableVersion: string;
  minimumShippableItems: ScopeItem[];
  currentBlocker: CurrentBlocker;
  aiDetectedBlockers: AiDetectedBlocker[];
  aiTouchedFields: AiFieldKey[];
  dueDate: string;
  dueTime: string;
  dueDateFlag: string;
  shipGoal: string;
  estimatedTime: string;
  shipTimingNote: string;
  suggestedNextStation: 'Clarification Station';
  clarifyingQuestions: string[];
  summary: {
    whatThisIs: string;
    whatThisIsNot: string;
    missingContext: string;
    suggestedNextMove: string;
  };
};

export type ScopeItem = {
  id: string;
  text: string;
  done: boolean;
  source: 'AI' | 'Manual';
};

export type Task = {
  id: string;
  title: string;
  description: string;
  station: Station;
  taskType: TaskType;
  outputFormat: OutputFormat;
  audience: Audience;
  reviewRoute: ReviewRoute;
  reviewerName: string;
  riskLevel: RiskLevel;
  minimumShippableVersion: string;
  minimumShippableItems: ScopeItem[];
  confidenceScore: number;
  releaseDecision: ReleaseDecision;
  currentBlocker: CurrentBlocker;
  aiDetectedBlockers: AiDetectedBlocker[];
  aiTouchedFields: AiFieldKey[];
  shipDate: string;
  dueTime: string;
  dueDateFlag: string;
  shipGoal: string;
  estimatedTime: string;
  shipTimingNote: string;
  outputLink: string;
  createdAt: string;
  updatedAt: string;
  shippedAt: string;
  evidenceNotes: string;
  scopeItems: ScopeItem[];
  scopeLocked: boolean;
  originalStock?: RawInboxItem;
  azalaiClarification?: ClarificationDraft;
};

export type AiMode =
  | 'Clarify Goal'
  | 'Define Minimum Shippable Version'
  | 'Check Scope Creep'
  | 'Run Release Check'
  | 'Generate Feedback Questions'
  | 'Summarise Shipped Evidence';

export type DecisionResult = {
  decision: ReleaseDecision;
  explanation: string;
};
