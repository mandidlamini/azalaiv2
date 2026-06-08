import { ListChecks, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { generateScopeItems } from '../lib/aiClient';
import type { ScopeItem, Task } from '../types';

type Props = {
  task: Task;
  onChange: (task: Task) => void;
};

export function ScopeMarketPanel({ task, onChange }: Props) {
  const [newItem, setNewItem] = useState('');
  const scopeItems = task.scopeItems ?? [];
  const canEditScope = task.station === 'Scope Market' && !task.scopeLocked;

  useEffect(() => {
    if (task.station !== 'Scope Market' || task.scopeItems.length > 0) return;
    updateScopeItems(generateScopeItems(task));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.station, task.id]);

  function updateScopeItems(items: ScopeItem[]) {
    onChange({ ...task, scopeItems: items, updatedAt: new Date().toISOString() });
  }

  function generateWithAzalai() {
    if (!canEditScope) return;
    const generated = generateScopeItems(task);
    const existing = new Set(scopeItems.map((item) => item.text.trim().toLowerCase()));
    const next = [...scopeItems, ...generated.filter((item) => !existing.has(item.text.trim().toLowerCase()))];
    updateScopeItems(next);
  }

  function addManualItem() {
    if (!canEditScope) return;
    const text = newItem.trim();
    if (!text) return;

    updateScopeItems([
      ...scopeItems,
      {
        id: crypto.randomUUID(),
        text,
        done: false,
        source: 'Manual',
      },
    ]);
    setNewItem('');
  }

  function updateItem(itemId: string, patch: Partial<ScopeItem>) {
    if (!canEditScope && 'text' in patch) return;
    updateScopeItems(scopeItems.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  }

  function removeItem(itemId: string) {
    if (!canEditScope) return;
    updateScopeItems(scopeItems.filter((item) => item.id !== itemId));
  }

  function updateMinimumItem(itemId: string, patch: Partial<ScopeItem>) {
    onChange({
      ...task,
      minimumShippableItems: task.minimumShippableItems.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
      updatedAt: new Date().toISOString(),
    });
  }

  function acceptScope() {
    if (!scopeItems.length) return;
    onChange({ ...task, scopeLocked: true, station: 'Construction', updatedAt: new Date().toISOString() });
  }

  return (
    <section className="panel-box">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <ListChecks className="mt-1 h-5 w-5 text-dispatch" />
          <div>
            <h3 className="font-display text-lg text-ink">Scope Market</h3>
            <p className="mt-1 text-sm text-ink/70">Keep the build list small. Add only what belongs in this release.</p>
          </div>
        </div>
        <button className="secondary-button shrink-0" disabled={!canEditScope} onClick={generateWithAzalai}>
          <Sparkles className="h-4 w-4" />
          Generate
        </button>
      </div>

      <div className="msv-box">
        <h4 className="font-display text-base text-ink">Minimum Shippable Version</h4>
        <p className="mt-1 text-sm text-ink/70">{task.minimumShippableVersion}</p>
        <div className="mt-3 space-y-2">
          {task.minimumShippableItems.map((item) => (
            <label key={item.id} className="scope-item grid-cols-[auto_1fr_auto]">
              <input
                aria-label="Minimum shippable item complete"
                checked={item.done}
                type="checkbox"
                onChange={(event) => updateMinimumItem(item.id, { done: event.target.checked })}
              />
              <span className={item.done ? 'line-through opacity-60' : ''}>{item.text}</span>
              <span className="scope-source ai">AI</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {scopeItems.map((item) => (
          <div key={item.id} className="scope-item">
            <input
              aria-label="Scope item complete"
              checked={item.done}
              type="checkbox"
              onChange={(event) => updateItem(item.id, { done: event.target.checked })}
            />
            <input
              aria-label="Scope item"
              className={item.done ? 'line-through opacity-60' : ''}
              disabled={!canEditScope}
              value={item.text}
              onChange={(event) => updateItem(item.id, { text: event.target.value, source: 'Manual' })}
            />
            <span className={item.source === 'AI' ? 'scope-source ai' : 'scope-source'}>{item.source}</span>
            <button className="icon-button" disabled={!canEditScope} title="Remove scope item" onClick={() => removeItem(item.id)}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {scopeItems.length === 0 && <p className="empty-slot">No scope items yet</p>}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="scope-add-input"
          disabled={!canEditScope}
          value={newItem}
          onChange={(event) => setNewItem(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') addManualItem();
          }}
          placeholder="Add a Scope Market item"
        />
        <button className="primary-button" onClick={addManualItem}>
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      {task.station === 'Scope Market' && (
        <button className="primary-button mt-4 w-full" disabled={!scopeItems.length || task.scopeLocked} onClick={acceptScope}>
          Accept scope and move to Construction
        </button>
      )}
      {task.scopeLocked && <p className="mt-3 text-sm font-semibold text-olive">Scope locked. Reopen Scope Market to change the original build list.</p>}
    </section>
  );
}
