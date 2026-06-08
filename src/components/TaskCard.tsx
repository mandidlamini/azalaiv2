import { Package, Stamp, Truck } from 'lucide-react';
import type { Task } from '../types';

type Props = {
  task: Task;
  onOpen: (task: Task) => void;
  onMove: (taskId: string, direction: 'back' | 'next') => void;
  onDelete: (taskId: string) => void;
  onDragStart: (taskId: string) => void;
};

export function TaskCard({ task, onOpen, onMove, onDelete, onDragStart }: Props) {
  return (
    <article
      className="stock-card group"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', task.id);
        onDragStart(task.id);
      }}
    >
      <button className="w-full text-left" onClick={() => onOpen(task)}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg leading-tight text-ink">{task.title}</p>
            <p className="mt-2 line-clamp-2 text-sm text-ink/70">{task.description || 'No dispatch note yet.'}</p>
          </div>
          {task.station === 'Trade Ledger' ? (
            <Stamp className="h-5 w-5 shrink-0 text-stamp" />
          ) : (
            <Package className="h-5 w-5 shrink-0 text-dispatch" />
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="tag tag-blue">{task.taskType}</span>
          <span className="tag tag-paper">{task.riskLevel} risk</span>
          <span className="tag tag-stamp">
            {task.station === 'Trade Ledger' ? 'Shipped' : ['Judgement Hall', 'Revision Alley', 'Feedback Booth', 'Departure Gate'].includes(task.station) ? task.releaseDecision : task.audience}
          </span>
        </div>

        {task.station === 'Trade Ledger' && (
          <p className="mt-3 border-t border-ink/10 pt-3 text-xs text-ink/70">
            Shipped: {task.shippedAt ? new Date(task.shippedAt).toLocaleDateString() : 'Date not logged'}
          </p>
        )}

        {task.station === 'Storage' && (
          <p className="mt-3 border-t border-ink/10 pt-3 text-xs text-ink/70">
            Stored because: {task.currentBlocker}
          </p>
        )}
      </button>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-dashed border-ink/20 pt-3">
        <button className="icon-button" title="Move back" onClick={() => onMove(task.id, 'back')}>
          <span aria-hidden>←</span>
        </button>
        <div className="flex items-center gap-2">
          <button className="text-button" onClick={() => onDelete(task.id)}>
            Delete
          </button>
          <button className="icon-button" title="Move next" onClick={() => onMove(task.id, 'next')}>
            <Truck className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
