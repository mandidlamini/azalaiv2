import type { RawInboxItem, Station, Task } from '../types';
import { RawInboxCard } from './RawInboxCard';
import { TaskCard } from './TaskCard';

const stationNotes: Record<Station, string> = {
  Inbox: 'Receive raw stock.',
  'Clarification Station': 'Name the real job.',
  'Scope Market': 'Lock inclusions and exclusions.',
  Construction: 'Build the minimum version.',
  'Judgement Hall': 'Run the release decision.',
  'Revision Alley': 'One controlled revision pass.',
  'Feedback Booth': 'Gather targeted signal.',
  'Departure Gate': 'Final dispatch check.',
  'Trade Ledger': 'Shipped proof and evidence.',
  Storage: 'Stored backstock.',
};

type Props = {
  station: Station;
  tasks: Task[];
  rawItems?: RawInboxItem[];
  onOpen: (task: Task) => void;
  onMove: (taskId: string, direction: 'back' | 'next') => void;
  onDelete: (taskId: string) => void;
  onDropTask: (taskId: string, station: Station) => void;
  onClarifyRaw?: (item: RawInboxItem) => void;
  onDeleteRaw?: (itemId: string) => void;
};

export function Column({ station, tasks, rawItems = [], onOpen, onMove, onDelete, onDropTask, onClarifyRaw, onDeleteRaw }: Props) {
  const count = tasks.length + rawItems.length;

  return (
    <section
      className="column"
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(event) => {
        event.preventDefault();
        const taskId = event.dataTransfer.getData('text/plain');
        if (taskId) onDropTask(taskId, station);
      }}
    >
      <div className="sticky top-0 z-10 bg-shelf/95 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-ink">{station}</h2>
            <p className="text-sm text-ink/65">{stationNotes[station]}</p>
          </div>
          <span className="font-display text-2xl text-dispatch">
            {count}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {station === 'Inbox' &&
          rawItems.map((item) => (
            <RawInboxCard
              key={item.id}
              item={item}
              onClarify={onClarifyRaw ?? (() => undefined)}
              onDelete={onDeleteRaw ?? (() => undefined)}
            />
          ))}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onOpen={onOpen}
            onMove={onMove}
            onDelete={onDelete}
            onDragStart={() => undefined}
          />
        ))}
        {count === 0 && <div className="empty-slot">Awaiting stock</div>}
      </div>
    </section>
  );
}
