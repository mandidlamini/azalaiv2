import { generateScopeItems } from './aiClient';
import type { AiDetectedBlocker, ScopeItem, Station, Task } from '../types';

export function unresolvedBlockers(task: Task) {
  return (task.aiDetectedBlockers ?? []).filter((blocker) => !blocker.resolved);
}

export function isFieldBlocked(task: Task, field: AiDetectedBlocker['field']) {
  return unresolvedBlockers(task).some((blocker) => blocker.field === field);
}

export function markFieldConfirmed(task: Task, field: AiDetectedBlocker['field']): Task {
  const aiDetectedBlockers = (task.aiDetectedBlockers ?? []).map((blocker) =>
    blocker.field === field ? { ...blocker, resolved: true, source: 'Manual' as const } : blocker,
  );
  const hasUnresolvedBlockers = aiDetectedBlockers.some((blocker) => !blocker.resolved);

  return {
    ...task,
    currentBlocker: hasUnresolvedBlockers ? task.currentBlocker : 'None',
    aiDetectedBlockers,
    aiTouchedFields: (task.aiTouchedFields ?? []).filter((item) => item !== field),
  };
}

export function canMoveToStation(task: Task, station: Station) {
  const blockers = unresolvedBlockers(task);
  const clarificationBlocked = blockers.some((blocker) =>
    ['taskType', 'audience', 'outputFormat', 'shipDate', 'shipGoal', 'reviewerName'].includes(blocker.field),
  );

  if (['Scope Market', 'Construction', 'Judgement Hall', 'Revision Alley', 'Feedback Booth', 'Departure Gate', 'Trade Ledger'].includes(station)) {
    if (clarificationBlocked || task.currentBlocker !== 'None') {
      return 'Resolve AI-detected blockers in Clarification Station before moving deeper into the route.';
    }
  }

  if (['Construction', 'Judgement Hall', 'Revision Alley', 'Feedback Booth', 'Departure Gate', 'Trade Ledger'].includes(station)) {
    if (!task.scopeLocked) return 'Accept and lock the Scope Market checklist before Construction.';
    if (!task.scopeItems.length) return 'Scope Market needs a checklist before Construction.';
  }

  if (['Judgement Hall', 'Revision Alley', 'Feedback Booth', 'Departure Gate', 'Trade Ledger'].includes(station)) {
    if (!allDone(task.scopeItems)) return 'Complete every construction checklist item before Judgement Hall.';
    if (!allDone(task.minimumShippableItems)) return 'Satisfy the minimum shippable version checklist before Judgement Hall.';
  }

  if (station === 'Trade Ledger' && !task.shippedAt) {
    return 'Confirm the work has actually shipped at Departure Gate before moving it to Trade Ledger.';
  }

  return null;
}

export function prepareForStation(task: Task, station: Station): Task {
  if (station === 'Scope Market' && task.scopeItems.length === 0) {
    return { ...task, station, scopeItems: generateScopeItems(task) };
  }

  return { ...task, station };
}

export function allDone(items: ScopeItem[]) {
  return items.length > 0 && items.every((item) => item.done);
}
