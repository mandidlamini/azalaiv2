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
};

export function TaskDetailPanel({ task, onClose, onSave, onApplyDecision, onShip, onMoveNext }: Props) {
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
          <div className="panel-box">
            <TaskForm task={task} onChange={onSave} />
          </div>
          <div className="space-y-5">
            <ScopeMarketPanel task={task} onChange={onSave} />
            <DecisionEngine task={task} onApplyDecision={onApplyDecision} onSave={onSave} />
            <AIActionPanel task={task} />
            {(task.originalStock || task.azalaiClarification) && (
              <section className="panel-box">
                {task.originalStock && (
                  <div>
                    <h3 className="font-display text-lg text-ink">Original Stock</h3>
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
                  </div>
                )}

                {task.azalaiClarification && (
                  <div className="mt-5 border-t border-dashed border-ink/20 pt-4">
                    <h3 className="font-display text-lg text-ink">AZALAI Stock Read</h3>
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
                  </div>
                )}
              </section>
            )}
            <section className="panel-box">
              <h3 className="font-display text-lg text-ink">Manual Dispatch</h3>
              <div className="mt-4 grid gap-2">
                <button className="primary-button" onClick={() => onMoveNext(task.id)}>
                  <ChevronRight className="h-4 w-4" />
                  Send to next station
                </button>
                <button className="secondary-button" onClick={() => onApplyDecision({ ...task, releaseDecision: task.releaseDecision })}>
                  <CheckCircle2 className="h-4 w-4" />
                  Route by current decision
                </button>
                <button className="secondary-button" onClick={() => onShip(task)}>
                  <PackageCheck className="h-4 w-4" />
                  Mark shipped to ledger
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </aside>
  );
}
