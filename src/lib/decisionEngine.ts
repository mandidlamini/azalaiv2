import type { DecisionResult, Task } from '../types';

export function recommendReleaseDecision(task: Task): DecisionResult {
  if (!task.minimumShippableVersion.trim()) {
    return {
      decision: 'Storage',
      explanation:
        'The task needs a minimum shippable version before it can move forward, so it belongs in Storage for now.',
    };
  }

  if (task.confidenceScore <= 2) {
    return {
      decision: 'Ask for Feedback',
      explanation:
        'Confidence is low enough that targeted feedback is more useful than another private polish pass.',
    };
  }

  if (task.riskLevel === 'High') {
    if (task.confidenceScore >= 5) {
      return {
        decision: 'Ship',
        explanation:
          'This is high risk, but confidence is maxed.',
      };
    }

    return {
      decision: 'Ask for Feedback',
      explanation:
        'High-risk work should get an outside signal unless confidence, clarity, and approvals are already resolved.',
    };
  }

  if (task.riskLevel === 'Medium' && task.confidenceScore >= 4) {
    return {
      decision: 'Ship',
      explanation:
        'Medium-risk work has enough confidence to move toward shipping.',
    };
  }

  if (task.riskLevel === 'Low' && task.confidenceScore >= 4) {
    return {
      decision: 'Ship',
      explanation:
        'Low-risk work with strong confidence should leave storage and become proof.',
    };
  }

  return {
    decision: 'Ask for Feedback',
    explanation:
      'The task is close but needs a clearer signal before shipping.',
  };
}

export function stationForDecision(task: Task): Task['station'] {
  const decision = task.releaseDecision as string;
  if (decision === 'Ship') return 'Trade Ledger';
  if (decision === 'Ask for Feedback') return 'Feedback Booth';
  if (decision === 'Storage' || decision === 'Park') return 'Storage';
  return task.station;
}
