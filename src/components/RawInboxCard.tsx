import { FileAudio, FileText, Image, Link, Type } from 'lucide-react';
import type { RawInboxItem } from '../types';

type Props = {
  item: RawInboxItem;
  onClarify: (item: RawInboxItem) => void;
  onDelete: (itemId: string) => void;
};

const labels: Record<RawInboxItem['inputType'], string> = {
  Text: 'RAW TEXT',
  Voice: 'VOICE STOCK',
  File: 'FILE STOCK',
  Image: 'IMAGE STOCK',
  Link: 'LINK STOCK',
};

const icons = {
  Text: Type,
  Voice: FileAudio,
  File: FileText,
  Image,
  Link,
};

export function RawInboxCard({ item, onClarify, onDelete }: Props) {
  const Icon = icons[item.inputType];

  return (
    <article className="raw-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="raw-label">{labels[item.inputType]}</span>
          <h3 className="mt-2 font-display text-lg leading-tight text-ink">{item.rawTitle}</h3>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-stamp" />
      </div>

      {item.uploadedFilePreview && item.inputType === 'Image' ? (
        <img className="mt-3 max-h-40 w-full rounded border border-ink/15 object-cover" src={item.uploadedFilePreview} alt={item.uploadedFileName || item.rawTitle} />
      ) : (
        <p className="mt-3 line-clamp-4 text-sm text-ink/70">
          {item.rawText || item.linkNotes || item.sourceLink || item.uploadedFilePreview || 'Unprocessed stock needs clarification.'}
        </p>
      )}

      {item.uploadedFileName && <p className="mt-3 text-xs text-ink/55">{item.uploadedFileName}</p>}
      {item.sourceLink && (
        <a className="mt-3 block truncate text-sm font-semibold text-dispatch underline" href={item.sourceLink} target="_blank" rel="noreferrer">
          {item.sourceLink}
        </a>
      )}

      <div className="mt-4 grid gap-2 border-t border-dashed border-ink/20 pt-3">
        <button className="primary-button w-full" onClick={() => onClarify(item)}>
          Clarify with AZALAI
        </button>
        <button className="text-button justify-self-center" onClick={() => onDelete(item.id)}>
          Delete raw stock
        </button>
      </div>
    </article>
  );
}
