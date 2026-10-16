import { useState } from 'react';
import { ArrowRight, ArrowLeft, Bird } from 'lucide-react';
import { update, useAppState } from '../lib/store.js';
import { Field, MoneyInput, go } from '../components/ui.jsx';
import MagpieImport from '../components/MagpieImport.jsx';
import { money } from '../lib/util.js';

export const STYLES = ['Classic', 'Modern', 'Romantic', 'Rustic', 'Garden', 'Boho', 'Black tie', 'Beach', 'Intimate', 'Big party', 'Cultural traditions', 'Destination'];
export const PRIORITIES = ['Food & drink', 'Photos & video', 'Music & dancing', 'The venue', 'Outfits', 'Flowers & decor', 'Guest experience', 'Keeping costs down'];

export default function Onboarding() {
  const state = useAppState();
  const w = state.wedding;
  const [step, setStep] = useState(0);
  const set = (patch) => update((s) => { Object.assign(s.wedding, patch); });
  const styles = w.style ? w.style.split(', ') : [];
  const toggleStyle = (st) => set({ style: (styles.includes(st) ? styles.filter((x) => x !== st) : [...styles, st]).join(', ') });
  const togglePriority = (p) => set({ priorities: w.priorities.includes(p) ? w.priorities.filter((x) => x !== p) : w.priorities.length >= 3 ? w.priorities : [...w.priorities, p] });

  const finish = () => {
    update((s) => {
      s.onboarded = true;
      s.tasks.vision = { ...(s.tasks.vision || {}), done: !!(w.style || w.priorities.length) };
      if (w.budget) s.tasks.budget = { ...(s.tasks.budget || {}), done: true };
    });
    go('');
  };

  const steps = [
    {
      title: 'Congratulations! Let’s plan your wedding.',
      lede: 'Lovebird is your planner in an app. It walks you through what to book and when, keeps every vendor, quote, link and guest in one place, and tells you what to focus on next. A few quick questions to set it up:',
      body: (
        <div className="grid two">
          <Field label="Your name"><input className="input" autoFocus value={w.partner1} onChange={(e) => set({ partner1: e.target.value })} placeholder="First name" /></Field>
          <Field label="Your partner's name"><input className="input" value={w.partner2} onChange={(e) => set({ partner2: e.target.value })} placeholder="First name" /></Field>
        </div>
      ),
    },
    {
      title: 'Do you have a date?',
      lede: 'If not, that’s completely normal; most couples pick it when they book the venue. Every step in your plan gets a due date once it’s set.',
      body: (
        <div className="stack">
          <Field label="Wedding date"><input type="date" className="input" value={w.date} onChange={(e) => set({ date: e.target.value })} /></Field>
          {!w.date && (
            <Field label="Or, roughly when?" hint="A season, a month, or a few dates you're considering.">
              <input className="input" value={w.dateIdeas} onChange={(e) => set({ dateIdeas: e.target.value })} placeholder="e.g. Fall 2027, a Saturday in September" />
            </Field>
          )}
          <Field label="Where?" hint="City, region, or 'not sure yet'."><input className="input" value={w.city} onChange={(e) => set({ city: e.target.value })} placeholder="e.g. Hudson Valley, NY" /></Field>
        </div>
      ),
    },
    {
      title: 'How big, and how much?',
      lede: 'Rough guesses are fine. You can change these any time, and the budget gets split into suggested amounts per category for you.',
      body: (
        <div className="stack">
          <Field label={`About how many guests? ${w.guestEstimate}`}>
            <input type="range" min="10" max="350" step="5" value={w.guestEstimate} onChange={(e) => set({ guestEstimate: Number(e.target.value) })} />
          </Field>
          <Field label="Total budget" hint={w.budget && w.guestEstimate ? `That's about ${money(w.budget / w.guestEstimate)} per guest. In the US, couples spend around $30,000–$36,000 on average, but it varies a lot by region.` : ''}>
            <MoneyInput value={w.budget} onChange={(v) => set({ budget: v || 0 })} />
          </Field>
        </div>
      ),
    },
    {
      title: 'What should it feel like?',
      lede: 'Pick any words that fit, and up to three things that matter most to you both. Your planner uses these to weigh advice.',
      body: (
        <div className="stack loose">
          <div className="choice-grid">
            {STYLES.map((st) => <button key={st} type="button" className={`chip ${styles.includes(st) ? 'on' : ''}`} onClick={() => toggleStyle(st)}>{st}</button>)}
          </div>
          <div className="stack tight">
            <div className="label">Top priorities ({w.priorities.length}/3)</div>
            <div className="choice-grid">
              {PRIORITIES.map((p) => <button key={p} type="button" className={`chip ${w.priorities.includes(p) ? 'on' : ''}`} onClick={() => togglePriority(p)}>{p}</button>)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Bring in what you’ve already saved',
      lede: 'If you’ve been collecting venues, dresses or ideas in Magpie, import them now. You can also do this later from Saves.',
      body: <MagpieImport />,
    },
  ];
  const s = steps[step];
  const last = step === steps.length - 1;

  return (
    <div className="onboard">
      <div className="card">
        <div className="row" style={{ marginBottom: 18, gap: 8 }}>
          <span className="brand-mark"><Bird size={17} /></span>
          <span className="brand-name">Lovebird</span>
        </div>
        <div className="steps">{steps.map((_, i) => <span key={i} className={i <= step ? 'on' : ''} />)}</div>
        <h1>{s.title}</h1>
        <p className="ink2" style={{ marginBottom: 22 }}>{s.lede}</p>
        {s.body}
        <div className="row between" style={{ marginTop: 28 }}>
          {step > 0 ? <button className="btn ghost" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Back</button> : <span />}
          <div className="row">
            {step > 0 && !last && <button className="btn ghost" onClick={() => setStep(step + 1)}>Skip</button>}
            <button className="btn primary" onClick={() => (last ? finish() : setStep(step + 1))}>
              {last ? 'Open my planner' : 'Continue'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
