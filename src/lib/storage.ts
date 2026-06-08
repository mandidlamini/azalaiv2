import type { RawInboxItem, Task } from '../types';
import { seedTasks } from './seedData';

const STORAGE_KEY = 'azalai.tasks.v1';
const RAW_STORAGE_KEY = 'azalai.rawInbox.v1';

export function loadTasks(): Task[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveTasks(seedTasks);
    return seedTasks;
  }

  try {
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed.map(normalizeTask) : seedTasks;
  } catch {
    return seedTasks;
  }
}

export function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function normalizeTask(task: Task): Task {
  const legacyDecision = task.releaseDecision as string;
  const legacyStation = task.station as string;

  return {
    ...task,
    audience: normalizeAudience(task.audience as string),
    station: task.station,
    releaseDecision:
      legacyDecision === 'Storage' ? 'Park' : task.releaseDecision,
    confidenceScore: typeof task.confidenceScore === 'number' ? task.confidenceScore : 3,
    scopeItems: Array.isArray(task.scopeItems) ? task.scopeItems : [],
    scopeLocked: Boolean(task.scopeLocked),
    reviewRoute: task.reviewRoute || 'No review needed',
    reviewerName: task.reviewerName || '',
    minimumShippableItems: Array.isArray(task.minimumShippableItems)
      ? task.minimumShippableItems
      : buildMinimumShippableItems(task.minimumShippableVersion),
    aiDetectedBlockers: Array.isArray(task.aiDetectedBlockers) ? task.aiDetectedBlockers : [],
    aiTouchedFields: Array.isArray(task.aiTouchedFields) ? task.aiTouchedFields : [],
    dueTime: task.dueTime || '',
    dueDateFlag: task.dueDateFlag || (task.shipDate ? 'Due date found in intake, but no time was specified.' : 'Due date not specified in intake.'),
    shipGoal: task.shipGoal || '',
    estimatedTime: task.estimatedTime || '',
    shipTimingNote:
      task.shipTimingNote ||
      (task.shipDate
        ? 'Due date found in intake, but no time was specified.'
        : 'Due date not specified in intake. Add one if timing matters.'),
  };
}

function buildMinimumShippableItems(minimumShippableVersion: string) {
  const text = minimumShippableVersion || 'Define the smallest useful release.';
  return [
    {
      id: crypto.randomUUID(),
      text,
      done: false,
      source: 'AI' as const,
    },
  ];
}

function normalizeAudience(audience: string): Task['audience'] {
  if (audience === 'Public audience') return 'Social media';
  if (audience === 'Personal audience') return 'Personal';
  return audience as Task['audience'];
}

export function loadRawInboxItems(): RawInboxItem[] {
  const raw = localStorage.getItem(RAW_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as RawInboxItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRawInboxItems(items: RawInboxItem[]) {
  localStorage.setItem(RAW_STORAGE_KEY, JSON.stringify(items));
}
