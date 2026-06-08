import type { RawInboxItem, Station, Task } from '../types';
import { STATIONS } from '../types';
import { Column } from './Column';
import { useEffect, useRef } from 'react';

type Props = {
  tasks: Task[];
  rawItems: RawInboxItem[];
  onOpen: (task: Task) => void;
  onMove: (taskId: string, direction: 'back' | 'next') => void;
  onDropTask: (taskId: string, station: Station) => void;
  onDelete: (taskId: string) => void;
  onClarifyRaw: (item: RawInboxItem) => void;
  onDeleteRaw: (itemId: string) => void;
};

export function Board({ tasks, rawItems, onOpen, onMove, onDropTask, onDelete, onClarifyRaw, onDeleteRaw }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const grouped = STATIONS.reduce<Record<Station, Task[]>>((acc, station) => {
    acc[station] = tasks.filter((task) => task.station === station);
    return acc;
  }, {} as Record<Station, Task[]>);

  useEffect(() => {
    boardRef.current?.scrollTo({ left: 0 });
  }, []);

  return (
    <div className="board-scroll" ref={boardRef}>
      {STATIONS.map((station) => (
        <Column
          key={station}
          station={station}
          tasks={grouped[station]}
          rawItems={station === 'Inbox' ? rawItems.filter((item) => !item.processed) : []}
          onOpen={onOpen}
          onMove={onMove}
          onDropTask={onDropTask}
          onDelete={onDelete}
          onClarifyRaw={onClarifyRaw}
          onDeleteRaw={onDeleteRaw}
        />
      ))}
    </div>
  );
}
