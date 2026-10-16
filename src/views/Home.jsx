import { ArrowRight, CalendarHeart, Handshake, Wallet, Users, AlertCircle, Hourglass, Sparkles } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { focusTasks, taskStatus, overallProgress, currentPhase, budgetSummary, guestStats, upcomingPayments, coupleName, daysToGo, bookedVendor, chosenQuote } from '../lib/derive.js';
import { CATEGORIES, CATEGORY_BY_KEY } from '../data/categories.js';
import { fmtDate, money, relDays, parseDay, today, daysBetween, plural } from '../lib/util.js';
import { Photo, Bar, go } from '../components/ui.jsx';
import { TaskLink } from './Plan.jsx';
import { openAssistant } from '../components/Assistant.jsx';

export default function Home() {
  const state = useAppState();
  const w = state.wedding;
  const dtg = daysToGo(state);
  const phase = currentPhase(state);
  const focus = focusTasks(state, 5);
  const progress = overallProgress(state);
  const budget = budgetSummary(state);
  const guests = guestStats(state);
  const payments = upcomingPayments(state, 45);
  const essentials = CATEGORIES.filter((c) => c.essential);
  const bookedEssentials = essentials.filter((c) => bookedVendor(state, c.key));

  // Things a planner would nudge you about.
  const nudges = [];
  for (const v of state.vendors) {
    if (v.availability === 'hold' && v.holdUntil && v.status !== 'booked' && v.status !== 'passed') {
      const d = daysBetween(today(), parseDay(v.holdUntil));
      if (d <= 14) nudges.push({ key: `hold-${v.id}`, tone: d < 0 ? 'danger' : 'warn', text: <><strong>{v.name}</strong> {d < 0 ? 'stopped holding' : 'is holding'} your date {d < 0 ? relDays(d) : `until ${fmtDate(v.holdUntil, { month: 'short', day: 'numeric' })} (${relDays(d)})`}.</>, href: `#/vendor/${v.id}` });
    }
  }
  for (const p of payments.filter((x) => x.daysLeft <= 14)) {
    nudges.push({ key: `pay-${p.id}`, tone: p.daysLeft < 0 ? 'danger' : 'warn', text: <>{money(p.amount)} {p.label.toLowerCase()}{p.vendor ? ` to ${p.vendor.name}` : ''} {p.daysLeft < 0 ? 'was due' : 'is due'} {relDays(p.daysLeft)}.</>, href: '#/budget' });
  }
  const over = budget.lines.filter((l) => l.committed > l.allocated && l.allocated > 0);
  for (const l of over) nudges.push({ key: `over-${l.key}`, tone: 'warn', text: <>{l.label} is {money(l.committed - l.allocated)} over its target. Worth rebalancing.</>, href: '#/budget' });
  if (guests.total > 0 && guests.expected > w.guestEstimate * 1.1) nudges.push({ key: 'guests', tone: 'warn', text: <>Your list points to about {guests.expected} guests, more than the {w.guestEstimate} you planned for.</>, href: '#/guests' });

  const recentSaves = state.saves.slice(0, 6);

  return (
    <div className="stack loose">
      <section className="hero">
        <div className="card hero-main">
          <svg className="hero-flourish" viewBox="0 0 200 200" aria-hidden><circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="18" /><circle cx="150" cy="70" r="40" fill="none" stroke="currentColor" strokeWidth="10" /></svg>
          <div className="eyebrow tiny muted" style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Your wedding</div>
          <h1>{coupleName(state)}</h1>
          <div className="date">{w.date ? fmtDate(w.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : w.dateIdeas ? `Thinking ${w.dateIdeas}` : 'No date yet'}{w.city ? ` · ${w.city}` : ''}</div>
          {dtg !== null ? (
            <div className="countdown"><span className="n num">{Math.max(dtg, 0)}</span><span className="ink2">{dtg === 1 ? 'day to go' : dtg >= 0 ? 'days to go' : ''}</span></div>
          ) : (
            <div style={{ marginTop: 18 }}><a className="btn sm" href="#/settings"><CalendarHeart size={15} /> Set your date</a></div>
          )}
        </div>
        <div className="card pad stack">
          <div className="row between">
            <span className="tiny muted" style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Where you are</span>
            <span className="chip">{phase.when}</span>
          </div>
          <h2>{phase.label}</h2>
          <p className="ink2">{phase.intro}</p>
          <div>
            <div className="row between small" style={{ marginBottom: 5 }}><span className="muted">Whole plan</span><span className="num">{progress.done} of {progress.total} steps</span></div>
            <Bar committed={progress.done} paid={progress.done} total={progress.total} />
          </div>
          <button className="btn sm ghost" style={{ alignSelf: 'flex-start', marginLeft: -10 }} onClick={() => openAssistant('What should we focus on right now?')}><Sparkles size={15} /> Ask your planner what to focus on</button>
        </div>
      </section>

      {nudges.length > 0 && (
        <section className="stack tight">
          {nudges.slice(0, 5).map((n) => (
            <a key={n.key} href={n.href} className={`callout ${n.tone === 'danger' ? 'rose' : ''}`} style={{ textDecoration: 'none', padding: '10px 14px' }}>
              <AlertCircle size={17} /><span className="grow">{n.text}</span><ArrowRight size={16} className="muted" />
            </a>
          ))}
        </section>
      )}

      <section className="grid split">
        <div className="card">
          <div className="card-head">
            <h2>Up next</h2>
            <a className="btn sm ghost" href="#/plan">Full plan <ArrowRight size={15} /></a>
          </div>
          <div className="card-body">
            {focus.length === 0 ? <p className="muted">Everything is done. Enjoy it!</p> : focus.map((t) => <FocusItem key={t.id} task={t} state={state} />)}
          </div>
        </div>

        <div className="stack">
          <a className="card stat" href="#/vendors">
            <div className="k"><Handshake size={15} /> Vendors booked</div>
            <div className="v num">{bookedEssentials.length}<small> / {essentials.length} essentials</small></div>
            <div className="s">{plural(state.vendors.filter((v) => v.status !== 'passed' && v.status !== 'booked').length, 'option')} you're considering</div>
          </a>
          <a className="card stat" href="#/budget">
            <div className="k"><Wallet size={15} /> Budget</div>
            <div className="v num">{money(budget.committed)}<small> of {money(budget.total)}</small></div>
            <div style={{ margin: '8px 0 2px' }}><Bar committed={budget.committed} paid={budget.paid} total={budget.total} /></div>
            <div className="s">{money(budget.paid)} paid so far · {money(budget.remaining)} left</div>
          </a>
          <a className="card stat" href="#/guests">
            <div className="k"><Users size={15} /> Guests</div>
            {guests.total ? (
              <>
                <div className="v num">{guests.yes}<small> yes · {guests.total} on the list</small></div>
                <div className="s">{guests.invited ? `${guests.pending} still to reply` : `Planning for about ${w.guestEstimate}`}</div>
              </>
            ) : (
              <>
                <div className="v num">{w.guestEstimate}<small> planned</small></div>
                <div className="s">Start your list to get real numbers</div>
              </>
            )}
          </a>
        </div>
      </section>

      <section className="grid two">
        <div className="card">
          <div className="card-head"><h2>Your vendor team</h2><a className="btn sm ghost" href="#/vendors">All vendors <ArrowRight size={15} /></a></div>
          <div className="card-body stack tight">
            {essentials.map((c) => {
              const v = bookedVendor(state, c.key);
              const options = state.vendors.filter((x) => x.category === c.key && x.status !== 'passed').length;
              return (
                <a key={c.key} href={v ? `#/vendor/${v.id}` : `#/vendors/${c.key}`} className="row" style={{ textDecoration: 'none', padding: '5px 0' }}>
                  <span style={{ width: 24, textAlign: 'center' }}>{c.emoji}</span>
                  <span className="grow">{c.label}</span>
                  {v ? <span className="chip green">{v.name}</span> : options ? <span className="chip">{plural(options, 'option')}</span> : <span className="tiny muted">Not started</span>}
                </a>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h2>Payments coming up</h2><a className="btn sm ghost" href="#/budget">Budget <ArrowRight size={15} /></a></div>
          <div className="card-body">
            {payments.length === 0 ? (
              <p className="muted small">Nothing due in the next few weeks. When you book a vendor, add their deposit and balance dates and they'll show up here.</p>
            ) : (
              <div className="stack tight">
                {payments.slice(0, 6).map((p) => (
                  <div key={p.id} className="row">
                    <Hourglass size={15} className="muted" />
                    <div className="grow">
                      <div style={{ fontWeight: 550 }}>{p.label}{p.vendor ? ` · ${p.vendor.name}` : ''}</div>
                      <div className={`tiny ${p.daysLeft < 0 ? '' : 'muted'}`} style={p.daysLeft < 0 ? { color: 'var(--danger)' } : null}>{fmtDate(p.due)} · {relDays(p.daysLeft)}</div>
                    </div>
                    <span className="num" style={{ fontWeight: 600 }}>{money(p.amount)}</span>
                    <button className="btn sm" onClick={() => update((s) => { const x = s.payments.find((y) => y.id === p.id); x.paid = true; x.paidOn = new Date().toISOString().slice(0, 10); })}>Paid</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {recentSaves.length > 0 && (
        <section>
          <div className="row between" style={{ marginBottom: 10 }}><h2>Recently saved</h2><a className="btn sm ghost" href="#/saves">All saves <ArrowRight size={15} /></a></div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {recentSaves.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="card vendor-card">
                <div className="ph" style={{ aspectRatio: '1 / 1' }}><Photo imageId={s.imageId} url={s.imageUrl} fallback="🔖" /></div>
                <div className="bd"><div className="small ellipsis" style={{ fontWeight: 600 }}>{s.title}</div></div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FocusItem({ task, state }) {
  const s = taskStatus(state, task);
  const cat = task.category && CATEGORY_BY_KEY[task.category];
  const options = cat ? state.vendors.filter((v) => v.category === cat.key && v.status !== 'passed') : [];
  const quoted = options.filter((v) => chosenQuote(v));
  return (
    <div className="focus-item">
      <input type="checkbox" className="check" checked={s.done} onChange={() => update((st) => { st.tasks[task.id] = { ...(st.tasks[task.id] || {}), done: !s.done, doneAt: Date.now() }; })} aria-label={`Mark "${task.title}" done`} />
      <div className="grow stack tight" style={{ gap: 3 }}>
        <div className="row between top">
          <a className="title" href={`#/plan/${task.id}`}>{task.title}</a>
          {s.due && <span title={`Suggested by ${fmtDate(s.due)}`} className={`due ${s.daysLeft < 0 ? 'overdue' : s.daysLeft < 21 ? 'soon' : ''}`}>{s.daysLeft < 0 ? 'Catch up' : `By ${fmtDate(s.due, { month: 'short', day: 'numeric' })}`}</span>}
        </div>
        <p className="small ink2">{task.why}</p>
        {cat && options.length > 0 && <p className="tiny muted">{plural(options.length, 'option')} saved{quoted.length ? `, ${quoted.length} with quotes` : ''}</p>}
        <div style={{ marginTop: 4 }}><TaskLink task={task} small /></div>
      </div>
    </div>
  );
}
