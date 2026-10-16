import { useState } from 'react';
import { ArrowLeft, ArrowRight, X, Plus, Trash2 } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { BUDGET_LINES, suggestSplit, PRIORITY_CATEGORIES } from '../data/categories.js';
import { money, newId } from '../lib/util.js';
import { MoneyInput } from './ui.jsx';
import { celebrate } from './Celebrate.jsx';

// Setting a budget, step by step: who's chipping in, how many people, what
// matters most, and a split that reflects it.

const PRIORITIES = Object.keys(PRIORITY_CATEGORIES);

function perGuestNote(perGuest) {
  if (!perGuest) return '';
  if (perGuest < 120) return 'That’s a tight per-guest budget. Very doable with a daytime or weekday wedding, a brunch or family-style meal, a park or family home, or a shorter list.';
  if (perGuest < 220) return 'A modest per-guest budget. Off-season dates, Fridays or Sundays, and a venue that includes tables and chairs stretch it a long way.';
  if (perGuest < 400) return 'Right around typical in much of the US. You’ll have choices; your priorities decide where the extra goes.';
  return 'A generous per-guest budget. Room for the extras: a band, a videographer, upgraded florals, welcome bags.';
}

export default function BudgetBuilder({ onClose }) {
  const state = useAppState();
  const w = state.wedding;
  const [step, setStep] = useState(0);
  const [people, setPeople] = useState(() => (state.budget.contributors.length ? state.budget.contributors : [{ id: newId('c_'), name: 'Us', amount: w.budget || null }]));
  const [guests, setGuests] = useState(w.guestEstimate || 120);
  const [priorities, setPriorities] = useState(w.priorities || []);
  const total = people.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const [split, setSplit] = useState(null);
  const steps = 4;

  const addPerson = (name) => setPeople([...people, { id: newId('c_'), name, amount: null }]);
  const setPerson = (id, patch) => setPeople(people.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const toggle = (p) => setPriorities(priorities.includes(p) ? priorities.filter((x) => x !== p) : priorities.length >= 3 ? priorities : [...priorities, p]);
  const next = () => {
    if (step === 3) setSplit(suggestSplit(total, priorities));
    setStep(step + 1);
  };
  const splitTotal = split ? Object.values(split).reduce((a, b) => a + (Number(b) || 0), 0) : 0;
  const base = suggestSplit(total, []);

  const finish = () => {
    update((s) => {
      s.wedding.budget = total;
      s.wedding.guestEstimate = guests;
      s.wedding.priorities = priorities;
      s.budget.contributors = people.filter((p) => p.amount);
      s.budget.allocations = { ...split };
      s.tasks.budget = { ...(s.tasks.budget || {}), done: true, doneAt: Date.now() };
    });
    onClose();
    celebrate('Your budget is set', `${money(total)} for about ${guests} guests, split around what matters most to you.`, '💰');
  };

  return (
    <div className="interview" role="dialog" aria-modal="true" aria-label="Plan your budget">
      <div className="interview-top">
        <div className="tiny muted">💰 Budget</div>
        <div className="interview-progress" aria-hidden><span style={{ width: `${(step / steps) * 100}%` }} /></div>
        <button className="btn ghost icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
      </div>

      <div className="interview-body">
        {step === 0 && (
          <div className="stack loose interview-card">
            <div className="interview-kicker">Plan your budget</div>
            <h1>Money talk, the easy way.</h1>
            <p className="ink2">Four quick questions: who's contributing, how many people, what matters most. Then you'll get a split across every category that leans toward your priorities. You can change any number afterwards.</p>
            <div><button className="btn primary" onClick={() => setStep(1)}>Start <ArrowRight size={16} /></button></div>
          </div>
        )}

        {step === 1 && (
          <div className="stack interview-card">
            <div className="interview-kicker">1 of 3 · Who's chipping in</div>
            <h1 className="interview-q">Where is the money coming from?</h1>
            <p className="ink2 small">Include yourselves and anyone who has offered. If family is contributing, it helps to ask early whether anything comes with it.</p>
            <div className="stack tight">
              {people.map((p) => (
                <div key={p.id} className="row">
                  <input className="input" style={{ flex: 1.3 }} value={p.name} onChange={(e) => setPerson(p.id, { name: e.target.value })} placeholder="Who" />
                  <div style={{ flex: 1 }}><MoneyInput value={p.amount} onChange={(amount) => setPerson(p.id, { amount })} /></div>
                  {people.length > 1 && <button className="btn ghost icon sm" aria-label="Remove" onClick={() => setPeople(people.filter((x) => x.id !== p.id))}><Trash2 size={14} /></button>}
                </div>
              ))}
            </div>
            <div className="row wrap" style={{ gap: 6 }}>
              {[`${w.partner1 || 'Partner 1'}'s family`, `${w.partner2 || 'Partner 2'}'s family`, 'Someone else'].filter((n) => !people.some((p) => p.name === n)).map((n) => (
                <button key={n} className="chip" onClick={() => addPerson(n === 'Someone else' ? '' : n)}><Plus size={12} /> {n}</button>
              ))}
            </div>
            <div className="budget-total"><span className="muted">Total</span> <span className="num serif">{money(total)}</span></div>
          </div>
        )}

        {step === 2 && (
          <div className="stack interview-card">
            <div className="interview-kicker">2 of 3 · Headcount</div>
            <h1 className="interview-q">About how many guests?</h1>
            <div className="row" style={{ gap: 14 }}>
              <input type="range" min="10" max="350" step="5" value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
              <span className="serif num" style={{ fontSize: 30, minWidth: 60 }}>{guests}</span>
            </div>
            {state.guests.length > 0 && <p className="small muted">Your guest list has {state.guests.length} people so far.</p>}
            <div className="callout"><div><strong>{money(total / (guests || 1))} per guest.</strong> {perGuestNote(total / (guests || 1))}</div></div>
          </div>
        )}

        {step === 3 && (
          <div className="stack interview-card">
            <div className="interview-kicker">3 of 3 · Priorities</div>
            <h1 className="interview-q">What matters most to you two?</h1>
            <p className="ink2 small">Pick up to three. They get a bigger slice; everything else gets a little less.</p>
            <div className="choice-stack">
              {PRIORITIES.map((p) => (
                <button key={p} className={`choice ${priorities.includes(p) ? 'on' : ''}`} onClick={() => toggle(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && split && (
          <div className="stack interview-card">
            <div className="interview-kicker">Your split</div>
            <h1 className="interview-q">Here's where {money(total)} goes.</h1>
            <p className="ink2 small">Based on typical US weddings{priorities.length ? `, leaning toward ${priorities.join(', ').toLowerCase()}` : ''}. Change anything.</p>
            <div className="split-list">
              {BUDGET_LINES.map((l) => {
                const diff = (split[l.key] || 0) - base[l.key];
                return (
                  <div key={l.key} className="row split-row">
                    <span style={{ width: 22 }}>{l.emoji}</span>
                    <span className="grow">{l.label}{diff > 50 && <span className="chip rose" style={{ marginLeft: 6, padding: '0 7px', fontSize: 11 }}>+{money(diff)}</span>}</span>
                    <div style={{ width: 140 }}><MoneyInput className="input sm" value={split[l.key]} onChange={(v) => setSplit({ ...split, [l.key]: v || 0 })} /></div>
                  </div>
                );
              })}
            </div>
            {Math.abs(splitTotal - total) > 1 && <p className="small" style={{ color: 'var(--warn)' }}>These add up to {money(splitTotal)}, {splitTotal > total ? 'over' : 'under'} your total by {money(Math.abs(splitTotal - total))}.</p>}
          </div>
        )}
      </div>

      {step > 0 && (
        <div className="interview-foot">
          <button className="btn ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button>
          {step < 4
            ? <button className="btn primary" onClick={next} disabled={step === 1 && !total}>Next <ArrowRight size={16} /></button>
            : <button className="btn primary" onClick={finish}>Use this budget</button>}
        </div>
      )}
    </div>
  );
}
