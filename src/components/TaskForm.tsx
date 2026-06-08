import {
  AUDIENCES,
  OUTPUT_FORMATS,
  RELEASE_DECISIONS,
  RISK_LEVELS,
  TASK_TYPES,
  type Task,
} from '../types';

type Props = {
  task: Task;
  onChange: (task: Task) => void;
};

export function TaskForm({ task, onChange }: Props) {
  const update = <K extends keyof Task>(key: K, value: Task[K]) => {
    onChange({ ...task, [key]: value, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-5">
      <TextField label="Title" value={task.title} onChange={(value) => update('title', value)} />
      <TextArea label="Description" value={task.description} onChange={(value) => update('description', value)} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select label="Task type" value={task.taskType} options={TASK_TYPES} onChange={(value) => update('taskType', value)} />
        <Select
          label="Output format"
          value={task.outputFormat}
          options={OUTPUT_FORMATS}
          onChange={(value) => update('outputFormat', value)}
        />
        <Select label="Audience" value={task.audience} options={AUDIENCES} onChange={(value) => update('audience', value)} />
        <Select label="Risk level" value={task.riskLevel} options={RISK_LEVELS} onChange={(value) => update('riskLevel', value)} />
        <Select
          label="Release decision"
          value={task.releaseDecision}
          options={RELEASE_DECISIONS}
          onChange={(value) => update('releaseDecision', value)}
          getLabel={(value) => (task.station === 'Trade Ledger' && value === 'Ship' ? 'Shipped' : value)}
        />
        <BlockerStatus blocker={task.currentBlocker} onUnblock={() => update('currentBlocker', 'None')} />
      </div>

      <TextArea
        label="Minimum shippable version"
        value={task.minimumShippableVersion}
        onChange={(value) => update('minimumShippableVersion', value)}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Due date" value={task.shipDate} onChange={(value) => update('shipDate', value)} />
        <TextField label="Due time" value={task.dueTime} onChange={(value) => update('dueTime', value)} />
        <TextField label="Ship goal date" value={task.shipGoal} onChange={(value) => update('shipGoal', value)} />
      </div>
      <TimingReadout task={task} />
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

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  getLabel = (option) => option,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  getLabel?: (value: T) => string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
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
