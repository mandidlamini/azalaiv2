import { FileAudio, FileText, Image, Link, Mic, Plus, Square, Type, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { InboxInputType, RawInboxItem } from '../types';

type Props = {
  onCreate: (item: RawInboxItem) => void;
  onCancel?: () => void;
};

const inputOptions: Array<{ type: InboxInputType; label: string; icon: typeof Type }> = [
  { type: 'Text', label: 'Text input', icon: Type },
  { type: 'Voice', label: 'Voice note upload', icon: FileAudio },
  { type: 'File', label: 'File upload', icon: FileText },
  { type: 'Image', label: 'Image upload', icon: Image },
  { type: 'Link', label: 'Link input', icon: Link },
];

export function InboxIntake({ onCreate, onCancel }: Props) {
  const [inputType, setInputType] = useState<InboxInputType>('Text');
  const [rawText, setRawText] = useState('');
  const [sourceLink, setSourceLink] = useState('');
  const [linkNotes, setLinkNotes] = useState('');
  const [fileMeta, setFileMeta] = useState({ name: '', type: '', preview: '' });
  const [isListening, setIsListening] = useState(false);
  const [micMessage, setMicMessage] = useState('');
  const recognitionRef = useRef<any>(null);
  const keepListeningRef = useRef(false);
  const finalTranscriptRef = useRef('');

  function reset() {
    setRawText('');
    setSourceLink('');
    setLinkNotes('');
    setFileMeta({ name: '', type: '', preview: '' });
    setMicMessage('');
    finalTranscriptRef.current = '';
  }

  function startMicStt() {
    if (isListening) {
      stopMicStt();
      return;
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRawText('Voice transcription will be added later. This browser does not expose speech-to-text.');
      setFileMeta({
        name: 'Microphone note',
        type: 'audio/microphone',
        preview: 'Voice transcription will be added later. This browser does not expose speech-to-text.',
      });
      setMicMessage('Speech-to-text is not available in this browser.');
      return;
    }

    keepListeningRef.current = true;
    finalTranscriptRef.current = rawText.trim();
    startRecognition(SpeechRecognition);
  }

  function startRecognition(SpeechRecognition: new () => any) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript || '';
        if (event.results[index].isFinal) {
          finalTranscript += `${transcript} `;
        } else {
          interimTranscript += `${transcript} `;
        }
      }

      if (finalTranscript.trim()) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalTranscript}`.replace(/\s+/g, ' ').trim();
      }

      const transcript = `${finalTranscriptRef.current} ${interimTranscript}`.replace(/\s+/g, ' ').trim();
      setRawText(transcript);
      setFileMeta({
        name: 'Microphone transcript',
        type: 'audio/stt',
        preview: transcript || 'Listening for voice stock...',
      });
    };
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        keepListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
        setMicMessage('Microphone permission was blocked. You can type or upload audio instead.');
        return;
      }

      recognitionRef.current = null;
      setMicMessage(keepListeningRef.current ? 'Still listening. Restarting after the browser paused STT...' : 'Microphone STT stopped.');
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (keepListeningRef.current) {
        setMicMessage('Still listening. The browser paused STT, so AZALAI is restarting it.');
        window.setTimeout(() => {
          if (keepListeningRef.current) startRecognition(SpeechRecognition);
        }, 250);
        return;
      }

      setIsListening(false);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
      setMicMessage('Listening. Click Stop recording when you are done.');
    } catch {
      if (keepListeningRef.current) {
        window.setTimeout(() => {
          if (keepListeningRef.current) startRecognition(SpeechRecognition);
        }, 500);
      }
    }
  }

  function stopMicStt() {
    keepListeningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    finalTranscriptRef.current = rawText.trim();
    setMicMessage(rawText ? 'Transcript captured. You can edit it before adding to Inbox.' : 'Recording stopped.');
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    const fileType = file.type || file.name.split('.').pop() || 'unknown';

    if (inputType === 'Image') {
      setFileMeta({
        name: file.name,
        type: fileType,
        preview: await readAsDataUrl(file),
      });
      setRawText('Image text reading will be added later.');
      return;
    }

    if (inputType === 'Voice') {
      setFileMeta({
        name: file.name,
        type: fileType,
        preview: 'Voice transcription will be added later.',
      });
      setRawText('Voice transcription will be added later.');
      return;
    }

    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const text = await readAsText(file);
      setRawText(text);
      setFileMeta({ name: file.name, type: fileType, preview: text.slice(0, 700) });
      return;
    }

    setFileMeta({
      name: file.name,
      type: fileType,
      preview: file.type === 'application/pdf' || file.name.endsWith('.pdf') ? 'PDF text extraction will be added later.' : 'File reading will be added later.',
    });
    setRawText(file.type === 'application/pdf' || file.name.endsWith('.pdf') ? 'PDF text extraction will be added later.' : '');
  }

  function submit() {
    const hasContent = rawText.trim() || sourceLink.trim() || fileMeta.name;
    if (!hasContent) return;

    onCreate({
      id: crypto.randomUUID(),
      rawTitle: fallbackTitle(inputType, sourceLink, fileMeta.name),
      rawText: rawText.trim(),
      inputType,
      uploadedFileName: fileMeta.name,
      uploadedFileType: fileMeta.type,
      uploadedFilePreview: fileMeta.preview,
      sourceLink: sourceLink.trim(),
      linkNotes: linkNotes.trim(),
      createdAt: new Date().toISOString(),
      processed: false,
    });
    reset();
  }

  return (
    <section className="intake-desk">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stamp">Inbox intake</p>
            <h2 className="font-display text-2xl text-ink">Receive raw stock</h2>
          </div>
          {onCancel && (
            <button className="icon-button lg:hidden" title="Close intake" onClick={onCancel}>
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {onCancel && (
            <button className="icon-button hidden self-end lg:inline-flex" title="Close intake" onClick={onCancel}>
              <X className="h-5 w-5" />
            </button>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {inputOptions.map(({ type, label, icon: Icon }) => (
              <button key={type} className={inputType === type ? 'action-button is-active' : 'action-button'} onClick={() => setInputType(type)}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
        {inputType === 'Text' && (
          <label className="field">
            <span>Raw text</span>
            <textarea value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="Paste the rough idea, note, draft, or half-formed thought." />
          </label>
        )}

        {inputType === 'Link' && (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="field">
              <span>Source link</span>
              <input value={sourceLink} onChange={(event) => setSourceLink(event.target.value)} placeholder="https://..." />
            </label>
            <label className="field">
              <span>Link notes</span>
              <textarea value={linkNotes} onChange={(event) => setLinkNotes(event.target.value)} placeholder="Why this link matters or what it could become." />
            </label>
          </div>
        )}

        {inputType === 'Voice' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <button
                aria-pressed={isListening}
                className={isListening ? 'stt-toggle is-recording' : 'stt-toggle'}
                onClick={isListening ? stopMicStt : startMicStt}
                type="button"
              >
                {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isListening ? 'Stop recording' : 'Start recording'}
              </button>
              {micMessage && <p className="text-sm text-ink/60">{micMessage}</p>}
            </div>
            <label className="field">
              <span>Voice transcript</span>
              <textarea
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                placeholder="Use mic STT, upload audio, or type the transcript manually."
              />
            </label>
          </div>
        )}

        {['File', 'Image', 'Voice'].includes(inputType) && (
          <label className="field">
            <span>{inputType === 'Voice' ? 'Voice upload' : `${inputType} stock`}</span>
            <input
              type="file"
              accept={inputType === 'Image' ? 'image/*' : inputType === 'Voice' ? 'audio/*' : '.txt,.md,.pdf,text/plain,application/pdf'}
              onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
            />
            {fileMeta.name && <small className="mt-2 block text-ink/60">{fileMeta.name}</small>}
          </label>
        )}

        <button className="primary-button h-11 self-end" onClick={submit}>
          <Plus className="h-4 w-4" />
          Add to Inbox
        </button>
      </div>
    </section>
  );
}

function readAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function fallbackTitle(type: InboxInputType, link: string, fileName: string) {
  if (fileName) return fileName;
  if (link) return link;
  return `${type} stock`;
}
