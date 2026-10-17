import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, ArrowUp, Square, Eraser } from 'lucide-react';
import { useAppState, update, getState } from '../lib/store.js';
import { Drawer, Markdown } from './ui.jsx';
import { newId } from '../lib/util.js';

// Anywhere in the app can open the planner with a question ready to send.
const OPEN_EVENT = 'lovebird:ask';
export function openAssistant(prompt = '') {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { prompt } }));
}

const SUGGESTIONS = [
  'What should we focus on this week?',
  'Are we on track with our budget?',
  'Which vendor should we book next, and why?',
  'Help us trim the guest list',
  'What do people usually forget?',
];

export default function Assistant() {
  const state = useAppState();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(null);
  const [error, setError] = useState('');
  const abort = useRef(null);
  const scroller = useRef(null);
  const hasKey = !!state.settings.apiKey;

  useEffect(() => {
    const onAsk = (e) => {
      setOpen(true);
      const prompt = e.detail && e.detail.prompt;
      if (prompt && getState().settings.apiKey) send(prompt);
      else if (prompt) setDraft(prompt);
    };
    window.addEventListener(OPEN_EVENT, onAsk);
    return () => window.removeEventListener(OPEN_EVENT, onAsk);
  });

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [state.chat.length, streaming, open]);

  async function send(text) {
    const content = (text ?? draft).trim();
    if (!content || streaming !== null) return;
    setDraft('');
    setError('');
    const userMsg = { id: newId('m_'), role: 'user', content };
    update((s) => { s.chat.push(userMsg); if (s.chat.length > 60) s.chat.splice(0, s.chat.length - 60); });
    const history = [...getState().chat].map(({ role, content: c }) => ({ role, content: c }));
    setStreaming('');
    abort.current = new AbortController();
    try {
      const { askPlanner } = await import('../lib/ai.js');
      const reply = await askPlanner({ state: getState(), history, onText: setStreaming, signal: abort.current.signal });
      if (reply.trim()) update((s) => { s.chat.push({ id: newId('m_'), role: 'assistant', content: reply }); });
    } catch (err) {
      setError(err.message || String(err));
      // Drop the unanswered question so the conversation stays valid.
      update((s) => { s.chat = s.chat.filter((m) => m.id !== userMsg.id); });
      setDraft(content);
    } finally {
      setStreaming(null);
      abort.current = null;
    }
  }

  if (!open) {
    return <button className="btn primary ask-fab no-print" onClick={() => setOpen(true)} aria-label="Ask your planner"><Sparkles size={16} /> <span className="fab-label">Ask your planner</span></button>;
  }

  return (
    <Drawer onClose={() => { if (abort.current) abort.current.abort(); setOpen(false); }} label="Ask your planner">
      <div className="modal-head" style={{ paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
        <div>
          <h2><Sparkles size={18} style={{ verticalAlign: -2, color: 'var(--accent)' }} /> Your planner</h2>
          <p className="tiny muted" style={{ marginTop: 3 }}>Knows your date, vendors, budget and guest numbers.</p>
        </div>
        <div className="row" style={{ gap: 2 }}>
          {state.chat.length > 0 && <button className="btn ghost icon" title="Clear conversation" onClick={() => update((s) => { s.chat = []; })}><Eraser size={16} /></button>}
          <button className="btn ghost icon" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
        </div>
      </div>

      <div className="chat" ref={scroller}>
        {!hasKey && (
          <div className="callout"><div className="small">
            Your planner runs on Claude and needs an Anthropic API key. <a href="#/settings" onClick={() => setOpen(false)}>Add one in Settings</a>; it takes a minute.
            Everything else in Lovebird works without it.
          </div></div>
        )}
        {state.chat.length === 0 && hasKey && (
          <div className="stack tight">
            <p className="ink2 small">Ask anything: what to do next, whether a quote is fair, how to handle a tricky family situation, what to ask a florist.</p>
            {SUGGESTIONS.map((s) => <button key={s} className="chip" style={{ alignSelf: 'flex-start', cursor: 'pointer' }} onClick={() => send(s)}>{s}</button>)}
          </div>
        )}
        {state.chat.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>{m.role === 'assistant' ? <Markdown text={m.content} /> : m.content}</div>
        ))}
        {streaming !== null && <div className="msg assistant">{streaming ? <Markdown text={streaming} /> : <span className="muted">Thinking…</span>}</div>}
        {error && <div className="small" style={{ color: 'var(--danger)' }}>{error}</div>}
      </div>

      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <textarea className="textarea" rows={1} value={draft} disabled={!hasKey} onChange={(e) => setDraft(e.target.value)} placeholder={hasKey ? 'Ask your planner…' : 'Add an API key in Settings first'}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} autoFocus />
        {streaming !== null
          ? <button type="button" className="btn icon" onClick={() => abort.current && abort.current.abort()} aria-label="Stop"><Square size={16} /></button>
          : <button className="btn primary icon" disabled={!hasKey || !draft.trim()} aria-label="Send"><ArrowUp size={18} /></button>}
      </form>
    </Drawer>
  );
}
