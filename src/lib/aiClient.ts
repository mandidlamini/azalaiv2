import type { AiMode, ClarificationDraft, RawInboxItem, ScopeItem, Task } from '../types';
import { recommendReleaseDecision } from './decisionEngine';

export const AZALAI_SYSTEM_INSTRUCTION =
  'You are AZALAI, an AI release assistant for creative work. You do not make final creative taste decisions. You clarify raw stock, define the route, prevent scope creep, check whether constructed work is ready, and produce an AI Release Recommendation: Ship, Revise Once, Ask for Feedback, or Park. Keep the task small. Preserve human judgement over taste, visual direction, emotional tone, cultural fit, and final creative call.';

export const AZALAI_INBOX_SYSTEM_INSTRUCTION =
  'You are AZALAI, an AI release assistant for creative work. You are receiving raw inbox stock. Your job is to clarify what the input could become as a task. Do not expand the project. Do not make final creative taste decisions. Extract the likely task, audience, job, minimum shippable version, missing context, and what should not be included. If the input is too vague, ask up to five clarification questions. Return structured fields that the user can accept or edit. Your goal is to move useful work from Inbox to Clarification Station without turning one idea into ten projects.';

export async function askAzalai(task: Task, mode: AiMode): Promise<string> {
  // Replace this mock with a call to your own backend or serverless route.
  // Do not call OpenAI directly from browser code because that would expose the API key.
  // A future route can receive { task, mode }, add AZALAI_SYSTEM_INSTRUCTION, call OpenAI,
  // and return the assistant's text response to this client function.
  const decision = recommendReleaseDecision(task);

  const msVersion =
    task.minimumShippableVersion || `A small ${task.outputFormat.toLowerCase()} that can prove the idea.`;

  const responses: Record<AiMode, string> = {
    'Clarify Goal': [
      'Stockroom questions:',
      '1. What are you making?',
      `2. Where does it need to go? Current destination: ${task.audience}.`,
      '3. What is the smallest useful version?',
    ].join('\n'),
    'Define Minimum Shippable Version': `Done enough: ${msVersion} It should be releasable without adding a larger campaign, extra format, or second concept.`,
    'Check Scope Creep': `Keep: anything that helps the minimum version reach ${task.audience}. Store: extra formats, visual systems, spin-off posts, or new destinations that do not support this release.`,
    'Run Release Check': `AI Release Recommendation: ${decision.decision}. ${decision.explanation} Human taste remains the final gate.`,
    'Generate Feedback Questions': [
      'Targeted feedback questions:',
      `1. Does this ${task.outputFormat.toLowerCase()} feel clear enough for ${task.audience}?`,
      `2. What is confusing or unsupported for that destination?`,
      '3. What one change would make it more shippable without growing the scope?',
      '4. Would you release this as proof now, or what specific risk blocks it?',
    ].join('\n'),
    'Summarise Shipped Evidence': [
      `Ledger entry for "${task.title}":`,
      `What shipped: ${task.outputFormat} for ${task.audience}.`,
      `Why it shipped: release decision ${task.releaseDecision}.`,
      `Intended signal: ${task.evidenceNotes || 'Capture proof, response, or learning after release.'}`,
      'Next learning: record what happened and whether the minimum version was enough.',
    ].join('\n'),
  };

  return Promise.resolve(responses[mode]);
}

export async function clarifyInboxItem(rawItem: RawInboxItem, existingTasks: Task[] = []): Promise<ClarificationDraft> {
  // Replace this mock with a call to your own backend or serverless route.
  // A future route should send rawText, file text, OCR text, transcript text, or link notes
  // with AZALAI_INBOX_SYSTEM_INSTRUCTION and request structured JSON matching ClarificationDraft.
  const source = [rawItem.rawText, rawItem.linkNotes, rawItem.sourceLink].filter(Boolean).join(' ').trim();
  const lowerSource = source.toLowerCase();
  const isVisual = rawItem.inputType === 'Image' || lowerSource.includes('visual') || lowerSource.includes('mock-up');
  const isLink = rawItem.inputType === 'Link';
  const isFile = rawItem.inputType === 'File';
  const outputFormat = inferOutputFormat(lowerSource, rawItem, isVisual, isLink, isFile);
  const audience = inferAudience(lowerSource);
  const title = generateTitle(source, rawItem, outputFormat, audience);
  const dueTiming = inferDueTiming(lowerSource);
  const estimatedTime = estimateTime(lowerSource, rawItem);
  const reviewRoute = inferReviewRoute(lowerSource);
  const reviewerName = inferReviewerName(source, reviewRoute);
  const riskLevel = lowerSource.includes('client') || lowerSource.includes('buyer') ? 'Medium' : 'Low';
  const dueDate = dueTiming.date;
  const dueTime = dueTiming.time;
  const shipGoal = dueDate || suggestDueDate(existingTasks, riskLevel);
  const dueDateFlag = buildDueDateFlag(dueTiming);
  const blockers = buildAiBlockers({
    source,
    taskType: isVisual ? 'Visual' : isLink ? 'Strategy' : isFile ? 'Document' : 'Post',
    audience,
    outputFormat,
    dueDate,
    reviewRoute,
    reviewerName,
  });
  const minimumShippableItems = buildMinimumShippableItems(title, outputFormat, audience);

  return Promise.resolve({
    title,
    description:
      source ||
      `${rawItem.inputType} stock captured in Inbox. ${rawItem.uploadedFilePreview || 'Needs human review before building.'}`,
    taskType: isVisual ? 'Visual' : isLink ? 'Strategy' : isFile ? 'Document' : 'Post',
    outputFormat,
    audience,
    reviewRoute,
    reviewerName,
    riskLevel,
    minimumShippableVersion: `A small, useful version of "${title}" that can be judged without adding extra formats or side quests.`,
    minimumShippableItems,
    currentBlocker: blockers.length ? blockers[0].label : 'None',
    aiDetectedBlockers: blockers,
    aiTouchedFields: [
      'title',
      'description',
      'taskType',
      'outputFormat',
      'audience',
      'riskLevel',
      'minimumShippableVersion',
      'shipDate',
      'shipGoal',
      'estimatedTime',
      'reviewRoute',
      'reviewerName',
    ],
    dueDate,
    dueTime,
    dueDateFlag,
    shipGoal,
    estimatedTime,
    shipTimingNote: `${dueDateFlag} Estimated effort is ${estimatedTime}. AZALAI recommends ship goal date ${shipGoal} from current workload and risk.`,
    suggestedNextStation: 'Clarification Station',
    clarifyingQuestions: [
      'What exact output should this become?',
      'Who needs to use, read, or judge it?',
      'What is the smallest version that would still count as proof?',
      'What would make this risky enough to need feedback?',
    ].slice(0, source.length < 80 ? 5 : 3),
    summary: {
      whatThisIs: `This card is asking you to turn raw stock into a ${outputFormat.toLowerCase()} routed toward ${audience}.`,
      whatThisIsNot: 'It is not the final content draft yet, and it should not become a bundle of every related idea.',
      missingContext:
        source.length < 80
          ? 'The input is still thin. Confirm the audience, job, and done-enough line.'
          : 'Confirm whether the inferred audience and output format are correct.',
      suggestedNextMove: 'Approve or edit this draft, then move it to Clarification Station for structured scoping.',
    },
  });
}

export function generateScopeItems(task: Task): ScopeItem[] {
  const base = [
    `Confirm the route: ${task.title}.`,
    `Build the ${task.outputFormat.toLowerCase()} for ${task.audience}.`,
    `Satisfy the minimum shippable version: ${task.minimumShippableVersion || 'define the smallest useful release.'}`,
    'Check that the work matches the clarified task and destination.',
    'Leave extra formats, spin-off ideas, and new destinations in Storage.',
  ];

  if (task.currentBlocker !== 'None') {
    base.unshift(`Resolve blocker: ${task.currentBlocker}.`);
  }

  return base.map((text) => ({
    id: crypto.randomUUID(),
    text,
    done: false,
    source: 'AI',
  }));
}

function buildMinimumShippableItems(title: string, outputFormat: ClarificationDraft['outputFormat'], audience: ClarificationDraft['audience']): ScopeItem[] {
  return [
    `The ${outputFormat.toLowerCase()} clearly answers what "${title}" is trying to do.`,
    `The work is usable for ${audience}.`,
    'The release does not require extra formats or a second concept to make sense.',
  ].map((text) => ({
    id: crypto.randomUUID(),
    text,
    done: false,
    source: 'AI',
  }));
}

function buildAiBlockers({
  source,
  taskType,
  audience,
  outputFormat,
  dueDate,
  reviewRoute,
  reviewerName,
}: {
  source: string;
  taskType: Task['taskType'];
  audience: Task['audience'];
  outputFormat: Task['outputFormat'];
  dueDate: string;
  reviewRoute: Task['reviewRoute'];
  reviewerName: string;
}) {
  const blockers = [];
  if (source.trim().length < 40) {
    blockers.push({ label: 'Missing context' as const, field: 'description' as const });
  }
  if (taskType === 'Other') {
    blockers.push({ label: 'Task type unclear' as const, field: 'taskType' as const });
  }
  if (audience === 'Other') {
    blockers.push({ label: 'Destination unclear' as const, field: 'audience' as const });
  }
  if (outputFormat === 'Other') {
    blockers.push({ label: 'Output type unclear' as const, field: 'outputFormat' as const });
  }
  if (!dueDate) {
    blockers.push({ label: 'No ship date detected' as const, field: 'shipDate' as const });
  }
  if (reviewRoute === 'Specific person' && !reviewerName) {
    blockers.push({ label: 'Reviewer unclear' as const, field: 'reviewerName' as const });
  }

  return blockers.map((blocker) => ({
    id: crypto.randomUUID(),
    resolved: false,
    source: 'AI' as const,
    ...blocker,
  }));
}

function inferDueTiming(lowerSource: string) {
  const today = new Date();
  const time = inferDueTime(lowerSource);

  if (lowerSource.includes('today')) return { date: today.toISOString().slice(0, 10), time };
  if (lowerSource.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return { date: tomorrow.toISOString().slice(0, 10), time };
  }

  const isoDate = lowerSource.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoDate) return { date: isoDate[1], time };

  const monthDate = lowerSource.match(
    /\b(?:by|on|before|due)?\s*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|sept|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:,?\s*(20\d{2}))?\b/,
  );
  if (monthDate) {
    const [, monthName, day, year] = monthDate;
    return { date: dateFromParts(Number(year) || today.getFullYear(), monthIndex(monthName) + 1, Number(day)), time };
  }

  const weekdayMatch = lowerSource.match(/\b(?:by|on|before|due)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (weekdayMatch) return { date: nextWeekdayDate(weekdayMatch[1]), time };

  const looseDate = lowerSource.match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/);
  if (!looseDate) return { date: '', time };

  const [, first, second, year] = looseDate;
  return { date: `${year}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`, time };
}

function inferDueTime(lowerSource: string) {
  const withMeridiem = lowerSource.match(/\b(?:at|by|before|around)?\s*([01]?\d(?::[0-5]\d)?\s?(?:am|pm))\b/);
  if (withMeridiem) return withMeridiem[1].replace(/\s+/g, '');

  const twentyFourHour = lowerSource.match(/\b(?:at|by|before|around)\s+([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFourHour) return `${twentyFourHour[1].padStart(2, '0')}:${twentyFourHour[2]}`;

  return '';
}

function buildDueDateFlag(dueTiming: { date: string; time: string }) {
  if (!dueTiming.date) return 'Due date not specified in intake.';
  if (!dueTiming.time) return 'Due date found in intake, but no time was specified.';
  return 'Due date and time found in intake.';
}

function dateFromParts(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function monthIndex(monthName: string) {
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec'];
  const index = months.findIndex((month) => monthName.startsWith(month));
  return index === 9 ? 8 : index;
}

function nextWeekdayDate(dayName: string) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const target = days.indexOf(dayName);
  const date = new Date();
  const current = date.getDay();
  const delta = (target - current + 7) % 7 || 7;
  date.setDate(date.getDate() + delta);
  return date.toISOString().slice(0, 10);
}

function suggestDueDate(existingTasks: Task[], riskLevel: Task['riskLevel']) {
  const activeTasks = existingTasks.filter((task) => !['Trade Ledger', 'Storage'].includes(task.station));
  const highRiskActive = activeTasks.filter((task) => task.riskLevel === 'High').length;
  const daysToAdd = riskLevel === 'High' || highRiskActive >= 2 ? 5 : activeTasks.length >= 4 ? 3 : 1;
  const suggested = new Date();
  suggested.setDate(suggested.getDate() + daysToAdd);
  return suggested.toISOString().slice(0, 10);
}

function estimateTime(lowerSource: string, rawItem: RawInboxItem) {
  if (lowerSource.includes('case study') || lowerSource.includes('resource')) return '2-4 hours';
  if (lowerSource.includes('landing page') || lowerSource.includes('prototype') || rawItem.inputType === 'File') {
    return '2-4 hours';
  }
  if (lowerSource.includes('video') || lowerSource.includes('carousel') || rawItem.inputType === 'Image') {
    return '60-90 minutes';
  }
  return '30-45 minutes';
}

function inferReviewRoute(lowerSource: string): Task['reviewRoute'] {
  if (lowerSource.includes('client approval') || lowerSource.includes('client sign')) return 'Client approval';
  if (lowerSource.includes('founder approval') || lowerSource.includes('founder')) return 'Founder approval';
  if (lowerSource.includes('team review') || lowerSource.includes('team feedback')) return 'Team review';
  if (lowerSource.includes('send to') || lowerSource.includes('ask ') || lowerSource.includes('review by')) return 'Specific person';
  if (lowerSource.includes('self review')) return 'Self-review only';
  return 'No review needed';
}

function inferReviewerName(source: string, reviewRoute: Task['reviewRoute']) {
  if (reviewRoute !== 'Specific person') return '';
  const match = source.match(/\b(?:send to|ask|review by)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  return match?.[1] ?? '';
}

function inferOutputFormat(
  lowerSource: string,
  rawItem: RawInboxItem,
  isVisual: boolean,
  isLink: boolean,
  isFile: boolean,
): ClarificationDraft['outputFormat'] {
  if (lowerSource.includes('carousel')) return 'Carousel';
  if (lowerSource.includes('video') || lowerSource.includes('reel')) return 'Short video';
  if (lowerSource.includes('email')) return 'Email';
  if (lowerSource.includes('landing page')) return 'Landing page';
  if (lowerSource.includes('prototype')) return 'Prototype';
  if (lowerSource.includes('pdf')) return 'PDF';
  if (lowerSource.includes('instagram') || lowerSource.includes('linkedin') || lowerSource.includes('post')) return 'Text post';
  if (isVisual) return 'Image';
  if (isLink) return 'Internal note';
  if (isFile || rawItem.inputType === 'File') return 'PDF';
  return 'Text post';
}

function inferAudience(lowerSource: string): ClarificationDraft['audience'] {
  if (lowerSource.includes('client')) return 'Client';
  if (lowerSource.includes('buyer') || lowerSource.includes('enterprise')) return 'Enterprise buyer';
  if (lowerSource.includes('recruiter') || lowerSource.includes('hiring')) return 'Recruiter or hiring manager';
  if (lowerSource.includes('team')) return 'Internal team';
  if (lowerSource.includes('newsletter')) return 'Newsletter';
  if (lowerSource.includes('resource hub')) return 'Website / resource hub';
  if (lowerSource.includes('website') || lowerSource.includes('landing page')) return 'Website visitors';
  if (lowerSource.includes('social') || lowerSource.includes('instagram') || lowerSource.includes('linkedin') || lowerSource.includes('followers') || lowerSource.includes('audience')) return 'Social media';
  if (lowerSource.includes('community')) return 'Community';
  if (lowerSource.includes('person') || lowerSource.includes('mandi')) return 'Specific person';
  if (lowerSource.includes('public')) return 'Public audience';
  return 'Personal';
}

function generateTitle(
  source: string,
  rawItem: RawInboxItem,
  outputFormat: ClarificationDraft['outputFormat'],
  audience: ClarificationDraft['audience'],
) {
  const trimmed = source.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('shoe') && lower.includes('instagram')) return 'Create Instagram Post Centered on the Shoes';
  if (lower.includes('linkedin') && lower.includes('ai')) return 'Draft LinkedIn Post About AI Release Gates';
  if (lower.includes('buyer')) return 'Shape Enterprise Buyer Release Proof';
  if (lower.includes('visual') || rawItem.inputType === 'Image') return 'Clarify Visual Stock into a Shippable Asset';
  if (rawItem.inputType === 'Link') return 'Turn Source Link into a Structured Creative Task';
  if (rawItem.inputType === 'Voice') return 'Clarify Voice Note into Release Stock';
  if (rawItem.inputType === 'File') return 'Clarify Uploaded File into Release Stock';
  if (!trimmed) return `Clarify ${rawItem.inputType} Stock`;

  const action = inferTitleAction(lower);
  const subject = inferTitleSubject(lower, trimmed);
  const format = titleCase(outputFormat.replace('Text ', ''));
  const audienceSuffix = audience === 'Personal' ? '' : ` for ${audience}`;
  return `${action} ${format} About ${subject}${audienceSuffix}`;
}

function inferTitleAction(lowerSource: string) {
  if (lowerSource.includes('turn') || lowerSource.includes('convert')) return 'Convert';
  if (lowerSource.includes('summarise') || lowerSource.includes('summarize')) return 'Summarise';
  if (lowerSource.includes('draft') || lowerSource.includes('write')) return 'Draft';
  if (lowerSource.includes('create') || lowerSource.includes('make')) return 'Create';
  if (lowerSource.includes('test')) return 'Test';
  return 'Shape';
}

function inferTitleSubject(lowerSource: string, original: string) {
  const keywordSubjects: Array<[string, string]> = [
    ['shoe', 'Shoes'],
    ['flood', 'Flood Mapping'],
    ['release gate', 'AI Release Gates'],
    ['ai', 'AI Release Work'],
    ['stockroom', 'AZALAI Stockroom'],
    ['client', 'Client Proof'],
    ['buyer', 'Buyer Proof'],
    ['portfolio', 'Portfolio Proof'],
  ];
  const found = keywordSubjects.find(([keyword]) => lowerSource.includes(keyword));
  if (found) return found[1];

  const cleaned = original
    .replace(/\b(today|tomorrow|by|before|due|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '')
    .replace(/\b(20\d{2}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]20\d{2})\b/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleaned.split(' ').filter((word) => word.length > 2).slice(0, 5);
  return titleCase(words.join(' ') || 'Raw Stock');
}

function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
