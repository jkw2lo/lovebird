import { useState } from 'react';
import { ArrowLeft, Plus, Copy, CheckCircle2, Sparkles } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { CATEGORY_BY_KEY, VENDOR_STATUSES, AVAILABILITY } from '../data/categories.js';
import { TASKS } from '../data/plan.js';
import { bookedVendor, chosenQuote, vendorCost, budgetSummary } from '../lib/derive.js';
import { money, fmtDate, plural, addDays, parseDay } from '../lib/util.js';
import { PageHead, Empty, Photo, Stars, toast } from '../components/ui.jsx';
import { AddVendorModal } from './Vendors.jsx';
import { BookModal } from './VendorDetail.jsx';
import { openAssistant } from '../components/Assistant.jsx';
import VenueDirectory from '../components/VenueDirectory.jsx';
import { TORONTO } from '../data/venues.js';

export const STATUS_LABEL = Object.fromEntries(VENDOR_STATUSES.map((s) => [s.key, s.label]));
export const AVAIL_LABEL = Object.fromEntries(AVAILABILITY.map((s) => [s.key, s.label]));
export const availChip = (a) => ({ available: 'green', hold: 'gold', unavailable: 'danger' }[a] || '');

export default function VendorCategory({ category }) {
  const state = useAppState();
  const cat = CATEGORY_BY_KEY[category];
  const hasDirectory = category === 'venue';
  const [tab, setTab] = useState(() => (hasDirectory && !state.vendors.some((v) => v.category === 'venue') ? 'discover' : 'options'));
  const [adding, setAdding] = useState(false);
  const [showPassed, setShowPassed] = useState(false);
  const [booking, setBooking] = useState(null);
  if (!cat) return <Empty title="Not found" />;

  const all = state.vendors.filter((v) => v.category === category);
  const passed = all.filter((v) => v.status === 'passed');
  const vendors = showPassed ? all : all.filter((v) => v.status !== 'passed');
  const booked = bookedVendor(state, category);
  const line = budgetSummary(state).lines.find((l) => l.key === category);
  const task = TASKS.find((t) => t.books === category);

  return (
    <div>
      <a className="back" href="#/vendors"><ArrowLeft size={14} /> Vendors</a>
      <PageHead title={<>{cat.emoji} {cat.label}</>} lede={cat.blurb}>
        <button className="btn ghost" onClick={() => openAssistant(`We're looking for a ${cat.label.toLowerCase()}. Based on our plan and the options we've saved, what should we look for and which looks strongest so far?`)}><Sparkles size={15} /> Ask your planner</button>
        <button className="btn primary" onClick={() => setAdding(true)}><Plus size={16} /> Add option</button>
      </PageHead>

      <div className="row wrap" style={{ marginBottom: 16, gap: 8 }}>
        {booked && <span className="chip green"><CheckCircle2 size={13} /> Booked {booked.name}</span>}
        {line && line.allocated > 0 && <span className="chip">Budget target {money(line.allocated)}</span>}
        {task && state.wedding.date && !booked && <a className="chip" href={`#/plan/${task.id}`} style={{ textDecoration: 'none' }}>Plan to book by {fmtDate(addDays(parseDay(state.wedding.date), -task.before), { month: 'short', day: 'numeric', year: 'numeric' })}</a>}
      </div>

      <div className="tabs">
        {hasDirectory && <button className={tab === 'discover' ? 'on' : ''} onClick={() => setTab('discover')}>✨ Discover {TORONTO.label} venues</button>}
        <button className={tab === 'options' ? 'on' : ''} onClick={() => setTab('options')}>Your options ({vendors.length})</button>
        <button className={tab === 'compare' ? 'on' : ''} onClick={() => setTab('compare')}>Compare</button>
        <button className={tab === 'questions' ? 'on' : ''} onClick={() => setTab('questions')}>Questions to ask</button>
      </div>

      {tab === 'options' && (
        vendors.length === 0 ? (
          <Empty emoji={cat.emoji} title={`No ${cat.label.toLowerCase()} options yet`} action={<button className="btn primary" onClick={() => setAdding(true)}><Plus size={16} /> Add your first option</button>}>
            Paste a website or listing link and Lovebird will grab the name and a photo. You can also import a Magpie collection from Saves.
          </Empty>
        ) : (
          <div className="grid auto">
            {vendors.map((v) => <VendorCard key={v.id} vendor={v} state={state} />)}
          </div>
        )
      )}

      {tab === 'discover' && <VenueDirectory state={state} />}

      {tab === 'compare' && <Compare vendors={vendors.filter((v) => v.status !== 'passed' || showPassed)} cat={cat} state={state} onBook={setBooking} />}

      {tab === 'questions' && <Questions cat={cat} />}

      {passed.length > 0 && (tab === 'options' || tab === 'compare') && (
        <button className="btn sm ghost" style={{ marginTop: 14 }} onClick={() => setShowPassed(!showPassed)}>{showPassed ? 'Hide' : 'Show'} {plural(passed.length, 'passed option')}</button>
      )}

      {adding && <AddVendorModal category={category} onClose={() => setAdding(false)} />}
      {booking && <BookModal vendor={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}

function VendorCard({ vendor: v, state }) {
  const cost = vendorCost(v);
  return (
    <a href={`#/vendor/${v.id}`} className={`card vendor-card ${v.status}`}>
      <div className="ph"><Photo imageId={v.imageId} url={v.imageUrl} fallback={CATEGORY_BY_KEY[v.category].emoji} /></div>
      <div className="bd">
        <div className="row between top">
          <h3 style={{ fontSize: 16 }}>{v.name || 'Unnamed'}</h3>
          <span className={`chip ${v.status === 'booked' ? 'green' : ''}`}>{STATUS_LABEL[v.status]}</span>
        </div>
        {v.location && <div className="tiny muted">{v.location}</div>}
        <div className="row between">
          <span className="num" style={{ fontWeight: 600 }}>{cost ? money(cost) : <span className="muted small">{v.startingPrice || 'No quote yet'}</span>}</span>
          <Stars value={v.rating} onChange={(n) => update((s) => { s.vendors.find((x) => x.id === v.id).rating = n; })} size={14} />
        </div>
        {v.availability !== 'unknown' && <span className={`chip ${availChip(v.availability)}`} style={{ alignSelf: 'flex-start' }}>{AVAIL_LABEL[v.availability]}{v.availability === 'hold' && v.holdUntil ? ` until ${fmtDate(v.holdUntil, { month: 'short', day: 'numeric' })}` : ''}</span>}
      </div>
    </a>
  );
}

function Compare({ vendors, cat, state, onBook }) {
  if (vendors.length === 0) return <Empty emoji="⚖️" title="Nothing to compare yet">Add two or more options with quotes, and they'll line up here side by side.</Empty>;
  const totals = vendors.map(vendorCost).filter((x) => x);
  const lowest = totals.length > 1 ? Math.min(...totals) : null;
  const perGuest = ['venue', 'catering'].includes(cat.key);
  const guests = state.wedding.guestEstimate || 0;
  const fieldVal = (v, label) => {
    const q = chosenQuote(v);
    return (q && q.fields && q.fields[label]) || (v.details || []).find((d) => d.label.toLowerCase() === label.toLowerCase())?.value || '';
  };
  const usedFields = cat.fields.filter((f) => vendors.some((v) => fieldVal(v, f)));
  const setVendor = (id, patch) => update((s) => { Object.assign(s.vendors.find((x) => x.id === id), patch); });

  const rows = [
    ['Status', (v) => <span className={`chip ${v.status === 'booked' ? 'green' : ''}`}>{STATUS_LABEL[v.status]}</span>],
    ['Your date', (v) => <span className={`chip ${availChip(v.availability)}`}>{AVAIL_LABEL[v.availability]}{v.availability === 'hold' && v.holdUntil ? ` until ${fmtDate(v.holdUntil, { month: 'short', day: 'numeric' })}` : ''}</span>],
    ['Package', (v) => v.quotes.length > 1 ? (
      <select className="select sm" value={chosenQuote(v).id} onChange={(e) => setVendor(v.id, { chosenQuoteId: e.target.value })}>
        {v.quotes.map((q) => <option key={q.id} value={q.id}>{q.label || 'Quote'} · {money(q.total)}</option>)}
      </select>
    ) : chosenQuote(v) ? (chosenQuote(v).label || '—') : <span className="muted">—</span>],
    ['Price', (v) => { const c = vendorCost(v); return c ? <span className={`num ${c === lowest ? 'best' : ''}`} style={{ fontWeight: 650 }}>{money(c)}</span> : <span className="muted small">{v.startingPrice ? `Listed ${v.startingPrice}` : 'No quote yet'}</span>; }],
    ...(perGuest && guests ? [[`Per guest (${guests})`, (v) => { const c = vendorCost(v); return c ? <span className="num">{money(c / guests)}</span> : <span className="muted">—</span>; }]] : []),
    ['Deposit', (v) => { const q = chosenQuote(v); return q && q.deposit ? <span className="num">{money(q.deposit)}{q.depositDue ? <span className="muted tiny"> · by {fmtDate(q.depositDue, { month: 'short', day: 'numeric' })}</span> : ''}</span> : <span className="muted">—</span>; }],
    ["What's included", (v) => { const q = chosenQuote(v); return <span className="small">{(q && q.includes) || <span className="muted">—</span>}</span>; }],
    ...usedFields.map((f) => [f, (v) => <span className="small">{fieldVal(v, f) || <span className="muted">—</span>}</span>]),
    ['Your rating', (v) => <Stars value={v.rating} onChange={(n) => setVendor(v.id, { rating: n })} />],
    ['Pros', (v) => <span className="small" style={{ whiteSpace: 'pre-line' }}>{v.pros || <span className="muted">—</span>}</span>],
    ['Cons', (v) => <span className="small" style={{ whiteSpace: 'pre-line' }}>{v.cons || <span className="muted">—</span>}</span>],
    ['Notes', (v) => <span className="small" style={{ whiteSpace: 'pre-line' }}>{(v.notes || '').slice(0, 220) || <span className="muted">—</span>}</span>],
  ];

  return (
    <div className="stack">
      {usedFields.length < cat.fields.length && (
        <p className="small muted">Worth comparing for {cat.label.toLowerCase()}: {cat.fields.join(', ')}. Add them to each quote and they'll show up here.</p>
      )}
      <div className="compare-wrap">
        <table className="compare" style={{ minWidth: 160 + vendors.length * 220 }}>
          <thead>
            <tr>
              <th className="rowhead" />
              {vendors.map((v) => (
                <td key={v.id} className="vhead">
                  {v.imageId || v.imageUrl ? <Photo imageId={v.imageId} url={v.imageUrl} /> : <div className="ph">{cat.emoji}</div>}
                  <a href={`#/vendor/${v.id}`} style={{ fontWeight: 650, fontFamily: 'var(--serif)', fontSize: 16, textDecoration: 'none' }}>{v.name}</a>
                  {v.location && <div className="tiny muted">{v.location}</div>}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, render]) => (
              <tr key={label}><th className="rowhead">{label}</th>{vendors.map((v) => <td key={v.id}>{render(v)}</td>)}</tr>
            ))}
            <tr>
              <th className="rowhead" />
              {vendors.map((v) => (
                <td key={v.id}>
                  {v.status === 'booked' ? <span className="chip green"><CheckCircle2 size={13} /> Booked</span>
                    : <button className="btn sm primary" onClick={() => onBook(v)}>Book</button>}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Questions({ cat }) {
  const copy = () => {
    navigator.clipboard.writeText(`Questions for our ${cat.label.toLowerCase()}:\n\n${cat.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`);
    toast('Copied. Paste it into an email or your notes.');
  };
  return (
    <div className="card pad stack" style={{ maxWidth: 760 }}>
      <div className="row between">
        <p className="ink2">Ask every {cat.label.toLowerCase()} these before you sign. Each vendor's page has space to write down their answers.</p>
        <button className="btn sm" onClick={copy}><Copy size={14} /> Copy</button>
      </div>
      <ol className="stack tight" style={{ margin: 0, paddingLeft: 20 }}>
        {cat.questions.map((q, i) => <li key={i}>{q}</li>)}
      </ol>
    </div>
  );
}
