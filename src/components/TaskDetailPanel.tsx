import { CheckCircle2, ChevronRight, PackageCheck, X } from 'lucide-react';
import type { Task } from '../types';
import { AIActionPanel } from './AIActionPanel';
import { DecisionEngine } from './DecisionEngine';
import { ScopeMarketPanel } from './ScopeMarketPanel';
import { TaskForm } from './TaskForm';

type Props = {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  onApplyDecision: (task: Task) => void;
  onShip: (task: Task) => void;
  onMoveNext: (taskId: string) => void;
  onMoveTo: (taskId: string, station: Task['station']) => void;
};

export function TaskDetailPanel({ task, onClose, onSave, onApplyDecision, onShip, onMoveNext, onMoveTo }: Props) {
  if (!task) return null;

  return (
    <aside className="detail-shell">
      <div className="detail-backdrop" onClick={onClose} />
      <div className="detail-panel">
        <header className="flex items-start justify-between gap-4 border-b border-ink/15 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stamp">Dispatch slip</p>
            <h2 className="mt-1 font-display text-3xl text-ink">{task.title || 'Untitled stock'}</h2>
            <p className="mt-1 text-sm text-ink/65">{task.station}</p>
          </div>
          <button className="icon-button" title="Close" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid gap-5 py-5 xl:grid-cols-[1fr_360px]">
          {['Construction', 'Judgement Hall', 'Revision Alley', 'Feedback Booth', 'Departure Gate', 'Trade Ledger'].includes(task.station) ? (
            <RouteManifest task={task} />
          ) : (
            <div className="panel-box">
              <TaskForm task={task} onChange={onSave} />
            </div>
          )}
          <div className="space-y-5">
            <ScopeMarketPanel task={task} onChange={onSave} />
            <DecisionEngine task={task} onApplyDecision={onApplyDecision} onSave={onSave} />
            <AIActionPanel task={task} />
            {(task.originalStock || task.azalaiClarification) && (
              <section className="panel-box">
                {task.originalStock && (
                  <details>
                    <summary className="cursor-pointer font-display text-lg text-ink">Original Stock</summary>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-stamp">
                      {task.originalStock.inputType} stock
                    </p>
                    <p className="mt-2 text-sm font-semibold text-ink">{task.originalStock.rawTitle}</p>
                    {task.originalStock.uploadedFilePreview && task.originalStock.inputType === 'Image' ? (
                      <img
                        className="mt-3 max-h-44 w-full rounded border border-ink/15 object-cover"
                        src={task.originalStock.uploadedFilePreview}
                        alt={task.originalStock.uploadedFileName || task.originalStock.rawTitle}
                      />
                    ) : (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-ink/65">
                        {task.originalStock.rawText ||
                          task.originalStock.linkNotes ||
                          task.originalStock.sourceLink ||
                          task.originalStock.uploadedFilePreview}
                      </p>
                    )}
                    {task.originalStock.uploadedFileName && (
                      <p className="mt-2 text-xs text-ink/55">{task.originalStock.uploadedFileName}</p>
                    )}
                  </details>
                )}

                {task.azalaiClarification && (
                  <details className="mt-5 border-t border-dashed border-ink/20 pt-4">
                    <summary className="cursor-pointer font-display text-lg text-ink">AZALAI Stock Read</summary>
                    <div className="mt-3 space-y-3 text-sm text-ink/70">
                      <p>
                        <strong className="text-ink">Description:</strong> {task.azalaiClarification.description}
                      </p>
                      <p>
                        <strong className="text-ink">Minimum shippable version:</strong>{' '}
                        {task.azalaiClarification.minimumShippableVersion}
                      </p>
                      <p>
                        <strong className="text-ink">Ship timing:</strong> {task.shipTimingNote}
                      </p>
                      <p>
                        <strong className="text-ink">Due date:</strong>{' '}
                        {task.shipDate ? `${task.shipDate}${task.dueTime ? ` at ${task.dueTime}` : ' (time not specified)'}` : 'Not specified'}
                      </p>
                      <p>
                        <strong className="text-ink">Ship goal date:</strong> {task.shipGoal || 'Not set'}
                      </p>
                      <div>
                        <strong className="text-ink">Clarifying questions:</strong>
                        <ul className="mt-2 space-y-2">
                          {task.azalaiClarification.clarifyingQuestions.map((question) => (
                            <li key={question} className="rounded border border-ink/10 bg-paper px-3 py-2">
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                )}
              </section>
            )}
            <section className="panel-box">
              <h3 className="font-display text-lg text-ink">Manual Dispatch</h3>
              {task.station === 'Departure Gate' && (
                <div className="timing-readout mb-4">
                  <span>Departure date</span>
                  <strong>{task.shipGoal || task.shipDate || 'No ship date set'}</strong>
                  <p>Confirm the work has actually been posted, sent, submitted, uploaded, exported, published, or delivered.</p>
                </div>
              )}
              <div className="mt-4 grid gap-2">
                <button className="primary-button" onClick={() => onMoveNext(task.id)}>
                  <ChevronRight className="h-4 w-4" />
                  Send to next station
                </button>
                <button className="secondary-button" onClick={() => onApplyDecision({ ...task, releaseDecision: task.releaseDecision })}>
                  <CheckCircle2 className="h-4 w-4" />
                  Apply current recommendation
                </button>
                <button className="secondary-button" onClick={() => onMoveTo(task.id, 'Revision Alley')}>
                  Move to Revision Alley
                </button>
                <button className="secondary-button" onClick={() => onMoveTo(task.id, 'Feedback Booth')}>
                  Move to Feedback Booth
                </button>
                <button className="secondary-button" onClick={() => onMoveTo(task.id, 'Departure Gate')}>
                  Move to Departure Gate
                </button>
                <button className="secondary-button" onClick={() => onShip(task)}>
                  <PackageCheck className="h-4 w-4" />
                  Ship and log in Trade Ledger
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </aside>
  );
}

function RouteManifest({ task }: { task: Task }) {
  return (
    <section className="panel-box">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-olive">Locked route manifest</p>
      <h3 className="mt-2 font-display text-2xl text-ink">{task.title}</h3>
      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <ManifestItem label="Description" value={task.description} />
        <ManifestItem label="Task type" value={task.taskType} />
        <ManifestItem label="Output type" value={task.outputFormat} />
        <ManifestItem label="Destination" value={task.audience} />
        <ManifestItem label="Review route" value={task.reviewRoute} />
        <ManifestItem label="Estimated time taken" value={task.estimatedTime || 'Not estimated'} />
        <ManifestItem label="Ship goal date" value={task.shipGoal || task.shipDate || 'Not set'} />
        <ManifestItem label="Risk" value={task.riskLevel} />
      </dl>
    </section>
  );
}

function ManifestItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-paper px-3 py-2">
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-ink/50">{label}</dt>
      <dd className="mt-1 text-ink/75">{value}</dd>
    </div>
  );
}
