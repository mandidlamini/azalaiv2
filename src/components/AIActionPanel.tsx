import { Bot, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { askAzalai } from '../lib/aiClient';
import type { AiMode, Task } from '../types';

const modes: AiMode[] = [
  'Clarify Goal',
  'Define Minimum Shippable Version',
  'Check Scope Creep',
  'Run Release Check',
  'Generate Feedback Questions',
  'Summarise Shipped Evidence',
];

type Props = {
  task: Task;
};

export function AIActionPanel({ task }: Props) {
  const [response, setResponse] = useState('Select a dispatch action for this stock card.');
  const [activeMode, setActiveMode] = useState<AiMode | null>(null);

  async function run(mode: AiMode) {
    setActiveMode(mode);
    setResponse(await askAzalai(task, mode));
  }

  return (
    <section className="panel-box">
      <div className="flex items-start gap-3">
        <Bot className="mt-1 h-5 w-5 text-dispatch" />
        <div>
          <h3 className="font-display text-lg text-ink">Ask AZALAI</h3>
          <p className="mt-1 text-sm text-ink/70">Mock release-assistant actions. Human taste keeps the final call.</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {modes.map((mode) => (
          <button
            key={mode}
            className={activeMode === mode ? 'action-button is-active' : 'action-button'}
            onClick={() => run(mode)}
          >
            <Wand2 className="h-4 w-4" />
            {mode}
          </button>
        ))}
      </div>
      <pre className="mt-4 whitespace-pre-wrap rounded border border-ink/15 bg-paper p-3 text-sm leading-relaxed text-ink">
        {response}
      </pre>
    </section>
  );
}
