import { CheckCircle2, X } from 'lucide-react';
import {
  AUDIENCES,
  OUTPUT_FORMATS,
  RISK_LEVELS,
  TASK_TYPES,
  type ClarificationDraft,
  type RawInboxItem,
  type RiskLevel,
} from '../types';

type Props = {
  rawItem: RawInboxItem;
  draft: ClarificationDraft;
  onChange: (draft: ClarificationDraft) => void;
  onAccept: () => void;
  onReject: () => void;
};

export function ClarificationDraftModal({ rawItem, draft, onChange, onAccept, onReject }: Props) {
  const update = <K extends keyof ClarificationDraft>(key: K, value: ClarificationDraft[K]) => {
    onChange({ ...draft, [key]: value });
  };

  return (
    <aside className="detail-shell">
      <div className="detail-backdrop" onClick={onReject} />
      <div className="detail-panel">
        <header className="flex items-start justify-between gap-4 border-b border-ink/15 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stamp">Clarification Draft</p>
            <h2 className="mt-1 font-display text-3xl text-ink">{draft.title}</h2>
            <p className="mt-1 text-sm text-ink/65">Review AZALAI's structure before this leaves messy Inbox stock.</p>
          </div>
          <button className="icon-button" title="Reject / Keep in Inbox" onClick={onReject}>
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid gap-5 py-5 xl:grid-cols-[1fr_360px]">
          <section className="panel-box space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Title" value={draft.title} onChange={(value) => update('title', value)} />
              <Select label="Task type" value={draft.taskType} options={TASK_TYPES} onChange={(value) => update('taskType', value)} />
              <Select label="Output format" value={draft.outputFormat} options={OUTPUT_FORMATS} onChange={(value) => update('outputFormat', value)} />
              <Select label="Audience" value={draft.audience} options={AUDIENCES} onChange={(value) => update('audience', value)} />
              <RiskSelector value={draft.riskLevel} onChange={(value) => update('riskLevel', value)} />
              <BlockerReadout blocker={draft.currentBlocker} />
              <TextField label="Due date" value={draft.dueDate} onChange={(value) => update('dueDate', value)} />
              <TextField label="Due time" value={draft.dueTime} onChange={(value) => update('dueTime', value)} />
              <TextField label="Ship goal date" value={draft.shipGoal} onChange={(value) => update('shipGoal', value)} />
            </div>
          </section>

          <div className="space-y-5">
            <section className="panel-box">
              <h3 className="font-display text-lg text-ink">AZALAI Stock Read</h3>
              <div className="mt-4 space-y-4 text-sm text-ink/70">
                <ReadOnlyBlock label="Description" value={draft.description} />
                <ReadOnlyBlock label="Minimum shippable version" value={draft.minimumShippableVersion} />
                <ReadOnlyBlock label="Due date in intake" value={draft.dueDate || 'Not specified'} />
                <ReadOnlyBlock label="Due time in intake" value={draft.dueTime || 'Not specified'} />
                <ReadOnlyBlock label="Timing flag" value={draft.dueDateFlag} />
                <ReadOnlyBlock label="Ship timing" value={draft.shipTimingNote} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">Clarifying questions</p>
                  <ul className="mt-2 space-y-2">
                    {draft.clarifyingQuestions.map((question) => (
                      <li key={question} className="rounded border border-ink/10 bg-paper px-3 py-2">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section className="panel-box">
              <h3 className="font-display text-lg text-ink">Original Stock</h3>
              <p className="mt-2 text-sm text-ink/70">{rawItem.rawTitle}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink/60">
                {rawItem.rawText || rawItem.linkNotes || rawItem.sourceLink || rawItem.uploadedFilePreview}
              </p>
            </section>

            <section className="panel-box grid gap-2">
              <button className="primary-button" onClick={onAccept}>
                <CheckCircle2 className="h-4 w-4" />
                Accept Clarification
              </button>
              <button className="secondary-button" onClick={onReject}>
                Reject / Keep in Inbox
              </button>
            </section>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function RiskSelector({ value, onChange }: { value: RiskLevel; onChange: (value: RiskLevel) => void }) {
  return (
    <div className="field">
      <span>Risk level</span>
      <div className="grid grid-cols-3 gap-2">
        {RISK_LEVELS.map((risk) => (
          <button
            key={risk}
            className={value === risk ? `risk-pill ${risk.toLowerCase()} is-active` : `risk-pill ${risk.toLowerCase()}`}
            type="button"
            onClick={() => onChange(risk)}
          >
            {risk}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlockerReadout({ blocker }: { blocker: ClarificationDraft['currentBlocker'] }) {
  const isBlocked = blocker !== 'None';

  return (
    <div className={isBlocked ? 'blocker-status is-blocked' : 'blocker-status'}>
      <span>AI-detected blocker</span>
      <strong>{blocker}</strong>
    </div>
  );
}

function ReadOnlyBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/50">{label}</p>
      <p className="mt-2 rounded border border-ink/10 bg-paper px-3 py-2 leading-relaxed text-ink/75">{value}</p>
    </div>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option || 'unset'} value={option}>
            {option || 'Unset'}
          </option>
        ))}
      </select>
    </label>
  );
}
