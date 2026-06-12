import { Plus, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Board } from './components/Board';
import { ClarificationDraftModal } from './components/ClarificationDraftModal';
import { InboxIntake } from './components/InboxIntake';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import { clarifyInboxItem } from './lib/aiClient';
import { stationForDecision } from './lib/decisionEngine';
import { loadRawInboxItems, loadTasks, saveRawInboxItems, saveTasks } from './lib/storage';
import { canMoveToStation, prepareForStation } from './lib/workflow';
import { STATIONS, type ClarificationDraft, type RawInboxItem, type Task } from './types';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [rawItems, setRawItems] = useState<RawInboxItem[]>(() => loadRawInboxItems());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [clarificationState, setClarificationState] = useState<{
    rawItem: RawInboxItem;
    draft: ClarificationDraft;
  } | null>(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveRawInboxItems(rawItems);
  }, [rawItems]);

  const selectedTask = useMemo(() => tasks.find((task) => task.id === selectedId) ?? null, [tasks, selectedId]);

  function updateTask(nextTask: Task) {
    setTasks((current) =>
      current.map((task) => (task.id === nextTask.id ? { ...nextTask, updatedAt: new Date().toISOString() } : task)),
    );
  }

  function deleteTask(taskId: string) {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    if (selectedId === taskId) setSelectedId(null);
  }

  function addRawItem(item: RawInboxItem) {
    setRawItems((current) => [item, ...current]);
    setIsIntakeOpen(false);
  }

  function deleteRawItem(itemId: string) {
    setRawItems((current) => current.filter((item) => item.id !== itemId));
  }

  async function clarifyRawItem(item: RawInboxItem) {
    const draft = await clarifyInboxItem(item, tasks);
    setClarificationState({ rawItem: item, draft });
  }

  function acceptClarification() {
    if (!clarificationState) return;

    const { rawItem, draft } = clarificationState;
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: draft.title,
      description: draft.description,
      station: 'Clarification Station',
      taskType: draft.taskType,
      outputFormat: draft.outputFormat,
      audience: draft.audience,
      reviewRoute: draft.reviewRoute,
      reviewerName: draft.reviewerName,
      riskLevel: draft.riskLevel,
      minimumShippableVersion: draft.minimumShippableVersion,
      minimumShippableItems: draft.minimumShippableItems,
      confidenceScore: 3,
      releaseDecision: 'Undecided',
      currentBlocker: draft.currentBlocker,
      aiDetectedBlockers: draft.aiDetectedBlockers,
      aiTouchedFields: draft.aiTouchedFields,
      shipDate: draft.dueDate,
      dueTime: draft.dueTime,
      dueDateFlag: draft.dueDateFlag,
      shipGoal: draft.shipGoal,
      estimatedTime: draft.estimatedTime,
      shipTimingNote: draft.shipTimingNote,
      outputLink: rawItem.sourceLink,
      createdAt: now,
      updatedAt: now,
      shippedAt: '',
      evidenceNotes: '',
      scopeItems: [],
      scopeLocked: false,
      originalStock: { ...rawItem, processed: true },
      azalaiClarification: draft,
    };

    setTasks((current) => [task, ...current]);
    setRawItems((current) => current.filter((item) => item.id !== rawItem.id));
    setSelectedId(task.id);
    setClarificationState(null);
  }

  function moveTask(taskId: string, direction: 'back' | 'next') {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        const currentIndex = STATIONS.indexOf(task.station);
        const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        const station = STATIONS[Math.min(Math.max(nextIndex, 0), STATIONS.length - 1)];
        const blocked = direction === 'next' ? canMoveToStation(task, station) : null;
        if (blocked) {
          window.alert(blocked);
          return task;
        }
        return { ...prepareForStation(task, station), updatedAt: new Date().toISOString() };
      }),
    );
  }

  function moveTaskToStation(taskId: string, station: Task['station']) {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        const blocked = canMoveToStation(task, station);
        if (blocked) {
          window.alert(blocked);
          return task;
        }
        return { ...prepareForStation(task, station), updatedAt: new Date().toISOString() };
      }),
    );
  }

  function applyDecision(task: Task) {
    if (task.releaseDecision === 'Ship') {
      moveTaskToStation(task.id, 'Departure Gate');
      return;
    }

    const station = stationForDecision(task);
    const blocked = canMoveToStation(task, station);
    if (blocked) {
      window.alert(blocked);
      return;
    }

    const nextTask = {
      ...prepareForStation(task, station),
      updatedAt: new Date().toISOString(),
    };

    updateTask(nextTask);
  }

  function shipTask(task: Task) {
    const shippedAt = new Date().toISOString();
    updateTask({
      ...task,
      station: 'Trade Ledger',
      releaseDecision: 'Ship',
      shippedAt,
      shipDate: task.shipDate,
      evidenceNotes:
        task.evidenceNotes ||
        `Shipped ${task.outputFormat} for ${task.audience}.`,
    });
  }

  function resetSeedData() {
    setTasks([]);
    setRawItems([]);
    setSelectedId(null);
    setIsIntakeOpen(false);
    setClarificationState(null);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-olive">Private release desk</p>
          <h1 className="mt-3 flex justify-center">
            <span className="sr-only">Azalai</span>
            <span className="azalai-logo-plate">
              <img
                className="azalai-logo"
                src="/assets/logo/azalai-logo.png"
                alt="Azalai logo"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                  const fallback = event.currentTarget.parentElement?.nextElementSibling;
                  if (fallback instanceof HTMLElement) fallback.hidden = false;
                }}
              />
            </span>
            <span hidden className="font-display text-5xl text-ink md:text-7xl">
              AZALAI
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-xl text-ink/75">A route system for moving creative chaos into shipped work.</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-ink/60">Raw stock enters. AZALAI reads it. Scope locks. Work ships. Results go to the ledger.</p>
        </div>
        <div className="mx-auto flex flex-wrap justify-center gap-3 md:mx-0">
          <button className="secondary-button" onClick={resetSeedData}>
            <RotateCcw className="h-4 w-4" />
            Reset stock
          </button>
          <button className="primary-button" onClick={() => setIsIntakeOpen(true)}>
            <Plus className="h-4 w-4" />
            New Stock
          </button>
        </div>
      </header>

      <section className="ledger-strip">
        <Status
          label="In motion"
          value={tasks.filter((task) => !['Trade Ledger', 'Storage'].includes(task.station)).length + rawItems.filter((item) => !item.processed).length}
        />
        <Status label="Shipped" value={tasks.filter((task) => task.station === 'Trade Ledger').length} />
        <Status label="Storage" value={tasks.filter((task) => task.station === 'Storage').length} />
      </section>

      <Board
        tasks={tasks}
        rawItems={rawItems}
        onOpen={(task) => setSelectedId(task.id)}
        onMove={moveTask}
        onDropTask={moveTaskToStation}
        onDelete={deleteTask}
        onClarifyRaw={clarifyRawItem}
        onDeleteRaw={deleteRawItem}
      />

      <TaskDetailPanel
        task={selectedTask}
        onClose={() => setSelectedId(null)}
        onSave={updateTask}
        onApplyDecision={applyDecision}
        onShip={shipTask}
        onMoveNext={(taskId) => moveTask(taskId, 'next')}
        onMoveTo={moveTaskToStation}
      />

      {isIntakeOpen && (
        <aside className="detail-shell">
          <div className="detail-backdrop" onClick={() => setIsIntakeOpen(false)} />
          <div className="intake-modal">
            <InboxIntake onCreate={addRawItem} onCancel={() => setIsIntakeOpen(false)} />
          </div>
        </aside>
      )}

      {clarificationState && (
        <ClarificationDraftModal
          rawItem={clarificationState.rawItem}
          draft={clarificationState.draft}
          onChange={(draft) => setClarificationState((current) => (current ? { ...current, draft } : current))}
          onAccept={acceptClarification}
          onReject={() => setClarificationState(null)}
        />
      )}
    </main>
  );
}

function Status({ label, value }: { label: string; value: number }) {
  return (
    <div className="ledger-cell">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
