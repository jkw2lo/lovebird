import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, Check, X as XIcon } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { CATEGORIES, BUDGET_LINES } from '../data/categories.js';
import { PHASES } from '../data/plan.js';
import { saveLink } from '../lib/links.js';
import { newId, fullName, plural } from '../lib/util.js';
import { Modal, Field, MoneyInput, go, toast } from './ui.jsx';
import { AddVendorModal } from '../views/Vendors.jsx';
import { AddGuestsModal } from '../views/Guests.jsx';

// One place to capture anything, from anywhere: the + button, or press N.

const OPEN = 'lovebird:quickadd';
export function openQuickAdd(kind = null) {
  window.dispatchEvent(new CustomEvent(OPEN, { detail: { kind } }));
}

const TILES = [
  { kind: 'link', emoji: '🔗', title: 'Save a link', hint: 'Anything you found online' },
  { kind: 'vendor', emoji: '🤝', title: 'Add a vendor', hint: 'A venue, photographer, florist…' },
  { kind: 'quote', emoji: '💬', title: 'Log a quote', hint: 'Pricing from a vendor' },
  { kind: 'guests', emoji: '💌', title: 'Add guests', hint: 'One or a whole list' },
  { kind: 'rsvp', emoji: '✅', title: 'Record an RSVP', hint: 'Who said yes, who can’t come' },
  { kind: 'expense', emoji: '🧾', title: 'Add an expense', hint: 'Something you paid or will pay' },
  { kind: 'todo', emoji: '📝', title: 'Add a to-do', hint: 'A step that isn’t in the plan' },
];

export default function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState(null);

  useEffect(() => {
    const onOpen = (e) => { setKind(e.detail.kind); setOpen(true); };
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey && !['input', 'textarea', 'select'].includes(tag) && !e.target.isContentEditable && !document.querySelector('.overlay, .drawer')) {
        e.preventDefault();
        setKind(null);
        setOpen(true);
      }
    };
    window.addEventListener(OPEN, onOpen);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener(OPEN, onOpen); window.removeEventListener('keydown', onKey); };
  }, []);

  if (!open) return null;
  const close = () => { setOpen(false); setKind(null); };

  if (kind === 'vendor') return <AddVendorModal onClose={close} />;
  if (kind === 'guests') return <AddGuestsModal onClose={close} />;

  const back = <button className="btn ghost sm" onClick={() => setKind(null)} style={{ marginLeft: -8, marginBottom: 6 }}><ArrowLeft size={14} /> Everything</button>;
  const titles = { link: 'Save a link', quote: 'Log a quote', rsvp: 'Record an RSVP', expense: 'Add an expense', todo: 'Add a to-do' };

  return (
    <Modal title={kind ? titles[kind] : 'Add something'} subtitle={kind ? null : 'Tip: press N anywhere to open this.'} onClose={close}>
      {!kind && (
        <div className="tiles">
          {TILES.map((t) => (
            <button key={t.kind} className="tile" onClick={() => setKind(t.kind)}>
              <span className="tile-emoji">{t.emoji}</span>
              <span className="tile-title">{t.title}</span>
              <span className="tile-hint">{t.hint}</span>
            </button>
          ))}
        </div>
      )}
      {kind && back}
      {kind === 'link' && <LinkForm onDone={close} />}
      {kind === 'quote' && <QuotePicker onDone={close} />}
      {kind === 'rsvp' && <RsvpForm />}
      {kind === 'expense' && <ExpenseForm onDone={close} />}
      {kind === 'todo' && <TodoForm onDone={close} />}
    </Modal>
  );
}

function LinkForm({ onDone }) {
  const state = useAppState();
  const [url, setUrl] = useState('');
  const [board, setBoard] = useState(state.boards[0].id);
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    const s = await saveLink(url, board);
    toast(`Saved “${s.title.slice(0, 40)}”`);
    onDone();
  };
  return (
    <form className="stack" onSubmit={save}>
      <Field label="Link"><input className="input" autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></Field>
      <Field label="Board">
        <select className="select" value={board} onChange={(e) => setBoard(e.target.value)}>{state.boards.map((b) => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}</select>
      </Field>
      <button className="btn primary" disabled={busy || !url.trim()} style={{ alignSelf: 'flex-end' }}>{busy ? 'Saving…' : 'Save link'}</button>
    </form>
  );
}

function QuotePicker({ onDone }) {
  const state = useAppState();
  const options = state.vendors.filter((v) => v.status !== 'passed');
  if (!options.length) {
    return <p className="ink2">Add the vendor first, then log their quote on their page. <button className="btn sm" onClick={() => { onDone(); setTimeout(() => openQuickAdd('vendor'), 0); }}>Add a vendor</button></p>;
  }
  return (
    <div className="stack tight">
      <p className="small muted">Who is the quote from?</p>
      {CATEGORIES.filter((c) => options.some((v) => v.category === c.key)).map((c) => (
        <div key={c.key} className="stack tight" style={{ gap: 4 }}>
          <div className="tiny muted" style={{ fontWeight: 650, marginTop: 6 }}>{c.emoji} {c.label}</div>
          {options.filter((v) => v.category === c.key).map((v) => (
            <button key={v.id} className="pick-row" onClick={() => { onDone(); go(`vendor/${v.id}?quote=1`); }}>
              <span className="grow">{v.name}</span>
              <span className="tiny muted">{plural(v.quotes.length, 'quote')}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

function RsvpForm() {
  const state = useAppState();
  const [q, setQ] = useState('');
  const matches = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.toLowerCase();
    const hits = state.guests.filter((g) => `${g.first} ${g.last} ${g.party}`.toLowerCase().includes(needle));
    // Show each match with the rest of their household.
    const parties = new Map();
    for (const g of hits) {
      const key = g.party || g.id;
      if (!parties.has(key)) parties.set(key, state.guests.filter((x) => (g.party ? x.party === g.party : x.id === g.id)));
    }
    return [...parties.values()].slice(0, 5);
  }, [q, state.guests]);
  const meals = [...new Set(state.guests.map((g) => g.meal).filter(Boolean))];
  const set = (id, patch) => update((s) => { Object.assign(s.guests.find((g) => g.id === id), patch); });

  if (!state.guests.length) return <p className="ink2">Your guest list is empty. Add guests first, then come back here as replies arrive.</p>;
  return (
    <div className="stack">
      <div className="row" style={{ position: 'relative' }}>
        <Search size={15} className="muted" style={{ position: 'absolute', left: 10 }} />
        <input className="input" style={{ paddingLeft: 32 }} autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Start typing a name…" />
      </div>
      {q && matches.length === 0 && <p className="small muted">No one by that name on the list.</p>}
      {matches.map((household, i) => (
        <div key={i} className="card flat pad stack tight" style={{ padding: 12 }}>
          {household.length > 1 && <div className="tiny muted" style={{ fontWeight: 650 }}>{household[0].party}</div>}
          {household.map((g) => (
            <div key={g.id} className="row wrap" style={{ gap: 8 }}>
              <span className="grow" style={{ fontWeight: 550, minWidth: 120 }}>{fullName(g)}</span>
              <button className={`btn sm ${g.rsvp === 'yes' ? 'primary' : ''}`} onClick={() => set(g.id, { rsvp: 'yes' })}><Check size={14} /> Coming</button>
              <button className={`btn sm ${g.rsvp === 'no' ? 'primary' : ''}`} onClick={() => set(g.id, { rsvp: 'no' })}><XIcon size={14} /> Can't</button>
              {g.rsvp === 'yes' && (
                <>
                  <input className="input sm" style={{ width: 110 }} list="qa-meals" value={g.meal} onChange={(e) => set(g.id, { meal: e.target.value })} placeholder="Meal" />
                  <input className="input sm" style={{ width: 130 }} value={g.dietary} onChange={(e) => set(g.id, { dietary: e.target.value })} placeholder="Dietary needs" />
                </>
              )}
            </div>
          ))}
        </div>
      ))}
      <datalist id="qa-meals">{meals.map((m) => <option key={m} value={m} />)}</datalist>
      <p className="tiny muted">Changes save as you go. Search for the next person whenever you're ready.</p>
    </div>
  );
}

function ExpenseForm({ onDone }) {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('other');
  const [amount, setAmount] = useState(null);
  const [paid, setPaid] = useState(true);
  const save = (e) => {
    e.preventDefault();
    update((s) => { s.budget.extras.push({ id: newId('x_'), category, label: label.trim() || 'Expense', amount, paid }); });
    toast(`Added to ${BUDGET_LINES.find((l) => l.key === category).label}`);
    onDone();
  };
  return (
    <form className="stack" onSubmit={save}>
      <Field label="What was it?"><input className="input" autoFocus value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Marriage license, welcome bag snacks" /></Field>
      <div className="grid two">
        <Field label="Amount"><MoneyInput value={amount} onChange={setAmount} /></Field>
        <Field label="Category">
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>{BUDGET_LINES.map((l) => <option key={l.key} value={l.key}>{l.emoji} {l.label}</option>)}</select>
        </Field>
      </div>
      <label className="row small"><input type="checkbox" className="check" checked={paid} onChange={(e) => setPaid(e.target.checked)} /> Already paid</label>
      <button className="btn primary" style={{ alignSelf: 'flex-end' }} disabled={!amount}>Add expense</button>
    </form>
  );
}

const PHASE_BEFORE = { foundation: 360, big: 300, team: 240, look: 180, finish: 110, invite: 50, final: 14, week: 2, after: -30 };

function TodoForm({ onDone }) {
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState('foundation');
  const save = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    update((s) => { s.customTasks.push({ id: newId('t_'), phase, title: title.trim(), before: PHASE_BEFORE[phase], notes: '', done: false }); });
    toast('Added to your plan');
    onDone();
  };
  return (
    <form className="stack" onSubmit={save}>
      <Field label="What needs doing?"><input className="input" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Book the hair trial" /></Field>
      <Field label="When">
        <select className="select" value={phase} onChange={(e) => setPhase(e.target.value)}>{PHASES.map((p) => <option key={p.key} value={p.key}>{p.label} ({p.when})</option>)}</select>
      </Field>
      <button className="btn primary" style={{ alignSelf: 'flex-end' }} disabled={!title.trim()}>Add to plan</button>
    </form>
  );
}

