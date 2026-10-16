import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Plus, Trash2, Undo2, CheckCircle2, Sparkles } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { phaseProgress, taskStatus, currentPhase } from '../lib/derive.js';
import { CATEGORY_BY_KEY } from '../data/categories.js';
import { fmtDate, newId } from '../lib/util.js';
import { PageHead, Segmented, Text } from '../components/ui.jsx';
import { openAssistant } from '../components/Assistant.jsx';
import { TORONTO } from '../data/venues.js';

const TOOL_LINKS = {
  budget: ['#/budget', 'Open budget'],
  guests: ['#/guests', 'Open guest list'],
  seating: ['#/seating', 'Open seating chart'],
  saves: ['#/saves', 'Open saves'],
  dayof: ['#/dayof', 'Open day-of timeline'],
  details: ['#/settings', 'Edit wedding details'],
  vendors: ['#/vendors', 'Open vendors'],
};

// Steps with a guided walkthrough get it as their main action.
const GUIDED = {
  budget: ['#/budget?build=1', 'Plan your budget step by step'],
  guestDraft: ['#/guests?build=1', 'Build your guest list step by step'],
};

export function TaskLink({ task, small }) {
  const cls = `btn ${small ? 'sm' : ''}`;
  if (task.id === 'venue') return <a className={`${cls} primary`} href="#/vendors/venue">✨ Browse {TORONTO.venues.length} researched {TORONTO.label} venues <ArrowRight size={14} /></a>;
  if (GUIDED[task.id]) return <a className={`${cls} primary`} href={GUIDED[task.id][0]}>✨ {GUIDED[task.id][1]} <ArrowRight size={14} /></a>;
  if (task.category && CATEGORY_BY_KEY[task.category]) {
    const c = CATEGORY_BY_KEY[task.category];
    return <a className={cls} href={`#/vendors/${c.key}`}>{c.emoji} {task.books ? `Compare ${c.label.toLowerCase()} options` : `Go to ${c.label.toLowerCase()}`} <ArrowRight size={14} /></a>;
  }
  const link = task.tool && TOOL_LINKS[task.tool];
  if (!link) return null;
  return <a className={cls} href={link[0]}>{link[1]} <ArrowRight size={14} /></a>;
}

export default function Plan({ focus }) {
  const state = useAppState();
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(() => new Set(focus ? [focus] : []));
  const phases = phaseProgress(state);
  const now = currentPhase(state);
  const focusRef = useRef(null);

  useEffect(() => {
    if (focus) {
      setOpen((o) => new Set([...o, focus]));
      setTimeout(() => focusRef.current && focusRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
    }
  }, [focus]);

  const toggle = (id) => setOpen((o) => { const n = new Set(o); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div>
      <PageHead eyebrow="Your plan" title="Everything to do, in order"
        lede={state.wedding.date ? 'Each step has a suggested deadline counted back from your date. Booking a vendor checks off its step automatically.' : 'Add your date in Settings and every step gets a deadline. Until then, just work top to bottom.'}>
        <Segmented value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'open', label: 'To do' }, { value: 'done', label: 'Done' }]} />
      </PageHead>

      {phases.map((phase) => {
        const items = phase.items.filter((t) => {
          const s = taskStatus(state, t);
          return filter === 'all' || (filter === 'done' ? s.done : !s.done && !s.skipped);
        });
        if (!items.length && filter !== 'all') return null;
        return (
          <section key={phase.key} className="phase">
            <div className={`phase-side ${phase.key === now.key ? 'now' : ''}`}>
              <div className="when">{phase.when}</div>
              <h2>{phase.label}</h2>
              <p className="small ink2">{phase.intro}</p>
              <div className="tiny muted" style={{ marginTop: 8 }}>{phase.done} of {phase.total} done{phase.key === now.key ? ' · you are here' : ''}</div>
            </div>
            <div>
              {items.map((t) => (
                <div key={t.id} ref={t.id === focus ? focusRef : null}>
                  <TaskRow task={t} state={state} open={open.has(t.id)} onToggle={() => toggle(t.id)} />
                </div>
              ))}
              <AddTask phase={phase.key} />
            </div>
          </section>
        );
      })}
    </div>
  );
}

function setTask(task, patch) {
  update((s) => {
    if (task.custom) Object.assign(s.customTasks.find((c) => c.id === task.id), patch);
    else s.tasks[task.id] = { ...(s.tasks[task.id] || {}), ...patch };
  });
}

function TaskRow({ task, state, open, onToggle }) {
  const s = taskStatus(state, task);
  const dueClass = s.daysLeft === null || s.done ? '' : s.daysLeft < 0 ? 'overdue' : s.daysLeft < 21 ? 'soon' : '';
  return (
    <div className={`task ${s.done ? 'done' : ''} ${s.skipped ? 'skipped' : ''}`}>
      <div className="task-row" onClick={onToggle}>
        <input type="checkbox" className="check" checked={s.done} disabled={!!s.autoVendor || s.autoDone}
          title={s.autoVendor ? `Done: you booked ${s.autoVendor.name}` : s.autoDone ? 'Done, based on what you have entered' : ''}
          onClick={(e) => e.stopPropagation()}
          onChange={() => setTask(task, { done: !s.done, doneAt: Date.now(), skipped: false })} aria-label={`Mark "${task.title}" done`} />
        <div className="grow">
          <span className="task-title">{task.title}</span>
          {task.optional && <span className="chip" style={{ marginLeft: 8, padding: '1px 8px', fontSize: 11.5 }}>optional</span>}
          {s.autoVendor && <span className="chip green" style={{ marginLeft: 8, padding: '1px 8px', fontSize: 11.5 }}>Booked: {s.autoVendor.name}</span>}
        </div>
        {s.skipped ? <span className="due">Skipped</span> : s.due && !s.done ? (
          <span className={`due ${dueClass}`} title={fmtDate(s.due)}>{s.daysLeft < 0 ? 'Catch up' : `By ${fmtDate(s.due, { month: 'short', day: 'numeric', year: s.due.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })}`}</span>
        ) : null}
        <ChevronDown size={16} className="muted" style={{ transform: open ? 'rotate(180deg)' : '', transition: 'transform 0.15s', flex: 'none' }} />
      </div>
      {open && (
        <div className="task-body">
          {task.why && <p className="ink2">{task.why}</p>}
          {task.tips && task.tips.length > 0 && <ul className="small">{task.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>}
          <Text multiline className="textarea" value={s.notes} onChange={(v) => setTask(task, { notes: v })} placeholder="Notes for this step…" rows={2} />
          <div className="row wrap">
            <TaskLink task={task} small />
            {!task.custom && <button className="btn sm ghost" onClick={() => openAssistant(`Help me with this step: "${task.title}". What do we need to know and decide?`)}><Sparkles size={14} /> Ask your planner</button>}
            <span className="grow" />
            {s.done && s.autoVendor && <span className="tiny muted row" style={{ gap: 4 }}><CheckCircle2 size={14} /> Checked off because you booked {s.autoVendor.name}</span>}
            {s.done && !s.autoVendor && s.autoDone && <span className="tiny muted row" style={{ gap: 4 }}><CheckCircle2 size={14} /> Checked off automatically from what you've entered</span>}
            {!s.done && (s.skipped
              ? <button className="btn sm ghost" onClick={() => setTask(task, { skipped: false })}><Undo2 size={14} /> Bring back</button>
              : <button className="btn sm ghost" onClick={() => setTask(task, { skipped: true })}>{task.optional ? 'Not for us' : 'Skip'}</button>)}
            {task.custom && <button className="btn sm ghost danger" onClick={() => update((st) => { st.customTasks = st.customTasks.filter((c) => c.id !== task.id); })}><Trash2 size={14} /> Delete</button>}
          </div>
        </div>
      )}
    </div>
  );
}

const PHASE_BEFORE = { foundation: 360, big: 300, team: 240, look: 180, finish: 110, invite: 50, final: 14, week: 2, after: -30 };

function AddTask({ phase }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  if (!adding) return <button className="btn sm ghost" style={{ marginTop: 2 }} onClick={() => setAdding(true)}><Plus size={14} /> Add a step</button>;
  const save = () => {
    if (title.trim()) update((s) => { s.customTasks.push({ id: newId('t_'), phase, title: title.trim(), before: PHASE_BEFORE[phase], notes: '', done: false }); });
    setTitle('');
    setAdding(false);
  };
  return (
    <form className="row" onSubmit={(e) => { e.preventDefault(); save(); }} style={{ marginTop: 4 }}>
      <input className="input" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you need to do?" onKeyDown={(e) => e.key === 'Escape' && setAdding(false)} />
      <button className="btn primary sm" type="submit">Add</button>
      <button className="btn ghost sm" type="button" onClick={() => setAdding(false)}>Cancel</button>
    </form>
  );
}
