import { BadgeCheck, Send } from 'lucide-react';
import type { Task } from '../types';
import { recommendReleaseDecision } from '../lib/decisionEngine';

type Props = {
  task: Task;
  onApplyDecision: (task: Task) => void;
  onSave: (task: Task) => void;
};

export function DecisionEngine({ task, onApplyDecision, onSave }: Props) {
  const recommendation = recommendReleaseDecision(task);
  const showConfidence = ['Judgement Hall', 'Feedback Booth', 'Departure Gate', 'Trade Ledger'].includes(task.station);

  function updateConfidence(value: number) {
    onSave({ ...task, confidenceScore: value, updatedAt: new Date().toISOString() });
  }

  return (
    <section className="panel-box">
      <div className="flex items-start gap-3">
        <BadgeCheck className="mt-1 h-5 w-5 text-dispatch" />
        <div>
          <h3 className="font-display text-lg text-ink">Release Recommendation</h3>
          <p className="mt-1 text-sm text-ink/70">{recommendation.explanation}</p>
        </div>
      </div>
      <div className="ai-suggestion mt-4">
        <span>AI generated</span>
        <strong>{recommendation.decision === 'Undecided' ? 'Waiting for Judgement Hall' : recommendation.decision}</strong>
      </div>
      {showConfidence && (
        <label className="field mt-4">
          <span>
            Confidence score: <strong>{task.confidenceScore}/5</strong>
          </span>
          <input
            min={1}
            max={5}
            type="range"
            value={task.confidenceScore}
            onChange={(event) => updateConfidence(Number(event.target.value))}
          />
        </label>
      )}
      <button
        className="primary-button mt-4 w-full"
        onClick={() => onApplyDecision({ ...task, releaseDecision: recommendation.decision })}
        disabled={recommendation.decision === 'Undecided'}
      >
        <Send className="h-4 w-4" />
        Apply recommendation
      </button>
    </section>
  );
}
