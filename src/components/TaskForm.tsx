import {
  DESTINATIONS,
  OUTPUT_FORMATS,
  REVIEW_ROUTES,
  RISK_LEVELS,
  TASK_TYPES,
  type Task,
} from '../types';
import { isFieldBlocked, markFieldConfirmed, unresolvedBlockers } from '../lib/workflow';

type Props = {
  task: Task;
  onChange: (task: Task) => void;
};

export function TaskForm({ task, onChange }: Props) {
  const update = <K extends keyof Task>(key: K, value: Task[K]) => {
    const next = markFieldConfirmed({ ...task, [key]: value, updatedAt: new Date().toISOString() }, key as any);
    onChange(next);
  };

  const resolveBlocker = (blockerId: string) => {
    const blockers = task.aiDetectedBlockers.map((blocker) =>
      blocker.id === blockerId ? { ...blocker, resolved: true, source: 'Manual' as const } : blocker,
    );
    onChange({ ...task, aiDetectedBlockers: blockers, currentBlocker: blockers.some((blocker) => !blocker.resolved) ? task.currentBlocker : 'None' });
  };

  return (
    <div className="space-y-5">
      <AiBlockers task={task} onResolve={resolveBlocker} />
      <TextField ai={isAiField(task, 'title')} blocked={isFieldBlocked(task, 'title')} label="Title" value={task.title} onChange={(value) => update('title', value)} />
      <TextArea ai={isAiField(task, 'description')} blocked={isFieldBlocked(task, 'description')} label="Description" value={task.description} onChange={(value) => update('description', value)} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select ai={isAiField(task, 'taskType')} blocked={isFieldBlocked(task, 'taskType')} label="Task type" value={task.taskType} options={TASK_TYPES} onChange={(value) => update('taskType', value)} />
        <Select
          ai={isAiField(task, 'outputFormat')}
          blocked={isFieldBlocked(task, 'outputFormat')}
          label="Output format"
          value={task.outputFormat}
          options={OUTPUT_FORMATS}
          onChange={(value) => update('outputFormat', value)}
        />
        <Select ai={isAiField(task, 'audience')} blocked={isFieldBlocked(task, 'audience')} label="Destination" value={task.audience} options={DESTINATIONS} onChange={(value) => update('audience', value)} />
        <Select ai={isAiField(task, 'riskLevel')} label="Risk level" value={task.riskLevel} options={RISK_LEVELS} onChange={(value) => update('riskLevel', value)} />
        <Select ai={isAiField(task, 'reviewRoute')} label="Review route" value={task.reviewRoute} options={REVIEW_ROUTES} onChange={(value) => update('reviewRoute', value)} />
        <TextField ai={isAiField(task, 'reviewerName')} blocked={isFieldBlocked(task, 'reviewerName')} label="Reviewer name" value={task.reviewerName} onChange={(value) => update('reviewerName', value)} />
        <BlockerStatus blocker={task.currentBlocker} onUnblock={() => update('currentBlocker', 'None')} />
      </div>

      <TextArea
        ai={isAiField(task, 'minimumShippableVersion')}
        label="Minimum shippable version"
        value={task.minimumShippableVersion}
        onChange={(value) => update('minimumShippableVersion', value)}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField ai={isAiField(task, 'shipDate')} blocked={isFieldBlocked(task, 'shipDate')} label="Suggested ship date" value={task.shipDate} onChange={(value) => update('shipDate', value)} />
        <TextField label="Due time" value={task.dueTime} onChange={(value) => update('dueTime', value)} />
        <TextField ai={isAiField(task, 'shipGoal')} blocked={isFieldBlocked(task, 'shipGoal')} label="Ship goal date" value={task.shipGoal} onChange={(value) => update('shipGoal', value)} />
        <TextField ai={isAiField(task, 'estimatedTime')} label="Estimated time taken" value={task.estimatedTime} onChange={(value) => update('estimatedTime', value)} />
      </div>
      <TimingReadout task={task} />
    </div>
  );
}

function isAiField(task: Task, field: string) {
  return task.aiTouchedFields.includes(field as any);
}

function AiBlockers({ task, onResolve }: { task: Task; onResolve: (blockerId: string) => void }) {
  const blockers = unresolvedBlockers(task);
  if (blockers.length === 0) {
    return (
      <div className="ai-blockers is-clear">
        <span>AI detected blockers</span>
        <strong>Route clear</strong>
      </div>
    );
  }

  return (
    <div className="ai-blockers">
      <span>AI detected blockers</span>
      <div className="mt-3 space-y-2">
        {blockers.map((blocker) => (
          <div key={blocker.id} className="flex items-center justify-between gap-3 rounded-xl border border-stamp/25 bg-stamp/10 px-3 py-2">
            <p className="text-sm font-semibold text-stamp">{blocker.label}</p>
            <button className="text-button" type="button" onClick={() => onResolve(blocker.id)}>
              Mark resolved
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimingReadout({ task }: { task: Task }) {
  const note = buildTimingNote(task);
  const missingDueDate = !task.shipDate;

  return (
    <div className={missingDueDate ? 'timing-readout is-missing' : 'timing-readout'}>
      <span>AZALAI timing check</span>
      <strong>{formatDueTiming(task)}</strong>
      <p>{note}</p>
    </div>
  );
}

function buildTimingNote(task: Task) {
  if (task.shipGoal && task.estimatedTime) {
    return `${task.dueDateFlag || 'Timing checked.'} Estimated effort is ${task.estimatedTime}. AZALAI recommends ship goal date ${task.shipGoal}.`;
  }

  if (task.shipTimingNote) return task.shipTimingNote;

  if (!task.shipDate) return 'Due date not specified in intake. Add one if timing matters.';

  return task.dueTime
    ? 'Due date and time recorded. Add a ship goal date if you want AZALAI to compare effort against your target.'
    : 'Due date found in intake, but no time was specified.';
}

function formatDueTiming(task: Task) {
  if (!task.shipDate) return 'Due date: Not specified';
  if (!task.dueTime) return `Due ${task.shipDate}; time not specified`;
  return `Due ${task.shipDate} at ${task.dueTime}`;
}

function BlockerStatus({ blocker, onUnblock }: { blocker: Task['currentBlocker']; onUnblock: () => void }) {
  const isBlocked = blocker !== 'None';

  return (
    <div className={isBlocked ? 'blocker-status is-blocked' : 'blocker-status'}>
      <span>Current blocker</span>
      <strong>{blocker}</strong>
      {isBlocked && (
        <button className="text-button mt-2 justify-self-start" onClick={onUnblock} type="button">
          Unblock manually
        </button>
      )}
    </div>
  );
}

function TextField({ label, value, onChange, ai = false, blocked = false }: { label: string; value: string; onChange: (value: string) => void; ai?: boolean; blocked?: boolean }) {
  return (
    <label className={blocked ? 'field is-blocked' : ai ? 'field is-ai' : 'field'}>
      <span>{label}{ai && <em>AI suggested</em>}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange, ai = false, blocked = false }: { label: string; value: string; onChange: (value: string) => void; ai?: boolean; blocked?: boolean }) {
  return (
    <label className={blocked ? 'field is-blocked' : ai ? 'field is-ai' : 'field'}>
      <span>{label}{ai && <em>AI suggested</em>}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  getLabel = (option) => option,
  ai = false,
  blocked = false,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  getLabel?: (value: T) => string;
  ai?: boolean;
  blocked?: boolean;
}) {
  return (
    <label className={blocked ? 'field is-blocked' : ai ? 'field is-ai' : 'field'}>
      <span>{label}{ai && <em>AI suggested</em>}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option || 'unset'} value={option}>
            {option ? getLabel(option) : 'Unset'}
          </option>
        ))}
      </select>
    </label>
  );
}
