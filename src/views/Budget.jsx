import { useState, useEffect, Fragment } from 'react';
import BudgetBuilder from '../components/BudgetBuilder.jsx';
import { ChevronDown, Plus, Trash2, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { budgetSummary, vendorCost } from '../lib/derive.js';
import { BUDGET_LINES } from '../data/categories.js';
import { money, fmtDate, newId, relDays, daysBetween, parseDay, today, dayString } from '../lib/util.js';
import { PageHead, MoneyInput, Text, Bar, Segmented } from '../components/ui.jsx';
import { openAssistant } from '../components/Assistant.jsx';

export default function Budget({ query }) {
  const state = useAppState();
  const [building, setBuilding] = useState(false);
  useEffect(() => {
    if (query && query.get('build')) { setBuilding(true); history.replaceState(null, '', '#/budget'); }
  }, [query && query.toString()]);
  const b = budgetSummary(state);
  const [open, setOpen] = useState(new Set());
  const toggle = (k) => setOpen((o) => { const n = new Set(o); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const unallocated = b.total - b.allocated;

  return (
    <div className="stack loose">
      <PageHead eyebrow="Budget" title="Where the money goes" lede="Targets start from typical splits for a US wedding. Change any of them; booked vendors and extra expenses fill in what's committed.">
        <button className="btn ghost" onClick={() => openAssistant('Look at our budget. Are we on track, and where could we save if we need to?')}><Sparkles size={15} /> Ask your planner</button>
        <button className="btn" onClick={() => setBuilding(true)}><Wand2 size={15} /> Plan it step by step</button>
      </PageHead>

      {state.budget.contributors.length > 0 && (
        <div className="row wrap" style={{ gap: 6, marginTop: -8 }}>
          <span className="small muted">Coming from:</span>
          {state.budget.contributors.map((c) => <span key={c.id} className="chip">{c.name || 'Someone'} · {money(c.amount)}</span>)}
        </div>
      )}
      {building && <BudgetBuilder onClose={() => setBuilding(false)} />}

      <section className="grid four">
        <div className="card stat">
          <div className="k">Total budget</div>
          <div style={{ marginTop: 6 }}><MoneyInput value={state.wedding.budget} onChange={(v) => update((s) => { s.wedding.budget = v || 0; })} /></div>
          <div className="s">{state.wedding.guestEstimate ? `${money(b.total / state.wedding.guestEstimate)} per guest at ${state.wedding.guestEstimate}` : ''}</div>
        </div>
        <div className="card stat"><div className="k">Committed</div><div className="v num">{money(b.committed)}</div><div className="s">{b.total ? Math.round((b.committed / b.total) * 100) : 0}% of your budget</div></div>
        <div className="card stat"><div className="k">Paid so far</div><div className="v num">{money(b.paid)}</div><div className="s">{money(b.committed - b.paid)} still to pay</div></div>
        <div className="card stat"><div className="k">Left to commit</div><div className="v num" style={{ color: b.remaining < 0 ? 'var(--danger)' : undefined }}>{money(b.remaining)}</div><div className="s">{b.remaining < 0 ? 'Over budget' : 'Not yet spoken for'}</div></div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>By category</h2>
          <div className="row">
            {Math.abs(unallocated) > 1 && <span className={`chip ${unallocated < 0 ? 'warn' : ''}`}>{unallocated < 0 ? `Targets are ${money(-unallocated)} over your total` : `${money(unallocated)} not assigned to a category`}</span>}
            {Object.keys(state.budget.allocations).length > 0 && <button className="btn sm ghost" onClick={() => update((s) => { s.budget.allocations = {}; })}><RotateCcw size={14} /> Reset targets</button>}
          </div>
        </div>
        <div className="card-body table-wrap">
          <table className="data">
            <thead><tr><th>Category</th><th style={{ width: 150 }}>Target</th><th className="right">Committed</th><th className="right hide-mobile">Paid</th><th className="right">Left</th><th style={{ width: '22%' }} className="hide-mobile" /></tr></thead>
            <tbody>
              {b.lines.map((l) => {
                const left = l.allocated - l.committed;
                const isOpen = open.has(l.key);
                return (
                  <Fragment key={l.key}>
                    <tr className="clickable" onClick={() => toggle(l.key)}>
                      <td><span className="row" style={{ gap: 8 }}><ChevronDown size={14} className="muted" style={{ transform: isOpen ? 'rotate(180deg)' : '' }} />{l.emoji} {l.label}{l.booked.length > 0 && <span className="tiny muted">· {l.booked.map((v) => v.name).join(', ')}</span>}</span></td>
                      <td onClick={(e) => e.stopPropagation()}><MoneyInput className="input sm" value={l.allocated} onChange={(v) => update((s) => { s.budget.allocations[l.key] = v || 0; })} /></td>
                      <td className="right num">{l.committed ? money(l.committed) : <span className="muted">—</span>}</td>
                      <td className="right num hide-mobile">{l.paid ? money(l.paid) : <span className="muted">—</span>}</td>
                      <td className="right num" style={{ color: left < 0 ? 'var(--danger)' : undefined, fontWeight: left < 0 ? 650 : undefined }}>{l.committed ? money(left) : <span className="muted">{money(left)}</span>}</td>
                      <td className="hide-mobile"><Bar committed={l.committed} paid={l.paid} total={l.allocated} /></td>
                    </tr>
                    {isOpen && <tr><td colSpan={6} style={{ background: 'var(--surface-2)' }}><LineDetail line={l} state={state} /></td></tr>}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <PaymentsList state={state} />
    </div>
  );
}

function LineDetail({ line, state }) {
  const setExtra = (id, patch) => update((s) => { Object.assign(s.budget.extras.find((e) => e.id === id), patch); });
  return (
    <div className="stack tight" style={{ padding: '6px 4px 8px 22px' }}>
      {line.booked.map((v) => (
        <div key={v.id} className="row small">
          <a href={`#/vendor/${v.id}`} className="grow">{v.name}</a>
          <span className="num">{money(vendorCost(v))}</span>
        </div>
      ))}
      {line.extras.map((e) => (
        <div key={e.id} className="row small">
          <input type="checkbox" className="check" checked={!!e.paid} onChange={(ev) => setExtra(e.id, { paid: ev.target.checked })} title="Paid" aria-label="Paid" />
          <Text className="input sm grow" value={e.label} onChange={(label) => setExtra(e.id, { label })} placeholder="What is it?" />
          <div style={{ width: 130 }}><MoneyInput className="input sm" value={e.amount} onChange={(amount) => setExtra(e.id, { amount })} /></div>
          <button className="btn sm ghost icon" aria-label="Delete" onClick={() => update((s) => { s.budget.extras = s.budget.extras.filter((x) => x.id !== e.id); })}><Trash2 size={14} /></button>
        </div>
      ))}
      {line.booked.length === 0 && line.extras.length === 0 && <p className="small muted">Nothing committed yet. {line.key !== 'other' ? <>Book a vendor under <a href={`#/vendors/${line.key}`}>{line.label}</a>, or add</> : 'Add'} an expense below (things you buy yourself, fees, tips).</p>}
      <div><button className="btn sm ghost" onClick={() => update((s) => { s.budget.extras.push({ id: newId('x_'), category: line.key, label: '', amount: null, paid: false }); })}><Plus size={14} /> Add an expense</button></div>
    </div>
  );
}

function PaymentsList({ state }) {
  const [show, setShow] = useState('upcoming');
  const now = today();
  const list = state.payments
    .map((p) => ({ ...p, vendor: state.vendors.find((v) => v.id === p.vendorId), daysLeft: p.due ? daysBetween(now, parseDay(p.due)) : null }))
    .filter((p) => (show === 'upcoming' ? !p.paid : show === 'paid' ? p.paid : true))
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  const setP = (id, patch) => update((s) => { Object.assign(s.payments.find((p) => p.id === id), patch); });
  const totalDue = state.payments.filter((p) => !p.paid).reduce((s, p) => s + (Number(p.amount) || 0), 0);

  return (
    <section className="card">
      <div className="card-head">
        <div><h2>Payment schedule</h2><p className="small muted">{money(totalDue)} still to pay across {state.payments.filter((p) => !p.paid).length} payments</p></div>
        <div className="row">
          <Segmented value={show} onChange={setShow} options={[{ value: 'upcoming', label: 'To pay' }, { value: 'paid', label: 'Paid' }, { value: 'all', label: 'All' }]} />
          <button className="btn sm" onClick={() => update((s) => { s.payments.push({ id: newId('p_'), vendorId: null, category: 'other', label: 'New payment', amount: null, due: '', paid: false, paidOn: '' }); })}><Plus size={14} /> Add</button>
        </div>
      </div>
      <div className="card-body table-wrap">
        {list.length === 0 ? <p className="muted small">{show === 'upcoming' ? 'Nothing to pay right now. Booking a vendor adds its deposit and balance here.' : 'No payments here yet.'}</p> : (
          <table className="data">
            <thead><tr><th style={{ width: 36 }}>Paid</th><th>For</th><th>Vendor</th><th style={{ width: 140 }}>Amount</th><th style={{ width: 160 }}>Due</th><th className="hide-mobile" /><th /></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td><input type="checkbox" className="check" checked={p.paid} onChange={(e) => setP(p.id, { paid: e.target.checked, paidOn: e.target.checked ? dayString(today()) : '' })} aria-label="Paid" /></td>
                  <td><Text className="input sm" value={p.label} onChange={(label) => setP(p.id, { label })} /></td>
                  <td className="small">{p.vendor ? <a href={`#/vendor/${p.vendor.id}`}>{p.vendor.name}</a> : (
                    <select className="select sm" value={p.category || 'other'} onChange={(e) => setP(p.id, { category: e.target.value })}>
                      {BUDGET_LINES.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
                    </select>
                  )}</td>
                  <td><MoneyInput className="input sm" value={p.amount} onChange={(amount) => setP(p.id, { amount })} /></td>
                  <td><input type="date" className="input sm" value={p.due} onChange={(e) => setP(p.id, { due: e.target.value })} /></td>
                  <td className="small hide-mobile nowrap">{p.paid ? <span className="muted">Paid {p.paidOn ? fmtDate(p.paidOn, { month: 'short', day: 'numeric' }) : ''}</span> : p.daysLeft !== null ? <span className={`due ${p.daysLeft < 0 ? 'overdue' : p.daysLeft < 14 ? 'soon' : ''}`}>{relDays(p.daysLeft)}</span> : null}</td>
                  <td><button className="btn sm ghost icon" aria-label="Delete payment" onClick={() => update((s) => { s.payments = s.payments.filter((x) => x.id !== p.id); })}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
