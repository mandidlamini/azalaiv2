import type { DecisionResult, Task } from '../types';
import { allDone, unresolvedBlockers } from './workflow';

export function recommendReleaseDecision(task: Task): DecisionResult {
  if (task.station !== 'Judgement Hall') {
    return {
      decision: 'Undecided',
      explanation: 'Release recommendation runs in Judgement Hall after construction is complete.',
    };
  }

  if (unresolvedBlockers(task).length > 0 || task.currentBlocker !== 'None') {
    return {
      decision: 'Park',
      explanation: 'There are unresolved route blockers. Park this until the blocker is resolved.',
    };
  }

  if (!allDone(task.scopeItems) || !allDone(task.minimumShippableItems)) {
    return {
      decision: 'Revise Once',
      explanation: 'The build or minimum shippable version checklist is not fully complete.',
    };
  }

  if (!task.minimumShippableVersion.trim()) {
    return {
      decision: 'Park',
      explanation: 'The task needs a minimum shippable version before it can leave the system.',
    };
  }

  if (task.confidenceScore <= 2) {
    return {
      decision: 'Ask for Feedback',
      explanation: 'Confidence is low enough that targeted feedback is more useful than another private polish pass.',
    };
  }

  if (task.riskLevel === 'High' && task.confidenceScore < 5) {
    return {
      decision: 'Ask for Feedback',
      explanation: 'High-risk work should get an outside signal unless confidence, clarity, and approvals are already resolved.',
    };
  }

  return {
    decision: 'Ship',
    explanation: 'Construction is complete and the minimum shippable version is satisfied. Human taste remains the final gate.',
  };
}

export function stationForDecision(task: Task): Task['station'] {
  const decision = task.releaseDecision as string;
  if (decision === 'Ship') return 'Departure Gate';
  if (decision === 'Revise Once') return 'Revision Alley';
  if (decision === 'Ask for Feedback') return 'Feedback Booth';
  if (decision === 'Park') return 'Storage';
  return task.station;
}
