import { useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { parseGuestLines } from '../lib/guests.js';
import { fullName, plural } from '../lib/util.js';
import { toast } from './ui.jsx';

// Building the guest list from a blank page is hard. This walks through it
// circle by circle, for each side, with a running count against your target.
// Guests are added as you go, so closing halfway loses nothing.

function circles(p1, p2) {
  const side = (who) => [
    { group: 'Family', title: `${who}'s immediate family`, prompt: 'Parents, siblings, grandparents, and their partners and kids.', example: 'Mom & Dad Smith\nAnna & Leo Smith\nGrandma Rose' },
    { group: 'Family', title: `${who}'s extended family`, prompt: 'Aunts, uncles, cousins. Tip: pick a rule (all first cousins, or none) so nobody feels singled out.', example: 'Aunt Carol & Uncle Jim Reyes\nCousin Mia Reyes +1' },
    { group: 'Friends', title: `${who}'s close friends`, prompt: 'The people you would call first with big news.', example: 'Priya Patel +1\nTheo & Ivy Park' },
    { group: 'Friends', title: `${who}'s wider circle`, prompt: 'School, old jobs, teams, clubs, neighbors. Be generous here; the B list is for exactly this.', example: 'Oscar Diaz\nNora Quinn' },
    { group: 'Work', title: `${who}'s work people`, prompt: 'Only people you would see outside work. Inviting your boss is optional.', example: 'Dana Kim' },
    { group: 'Family friends', title: `${who}'s family's friends`, prompt: 'Your parents’ friends. Ask them for their must-haves, then decide together.', example: 'The Hendersons: Bill, Sue Henderson' },
  ];
  return [
    ...side(p1 || 'Partner 1').map((c) => ({ ...c, side: 'p1' })),
    ...side(p2 || 'Partner 2').map((c) => ({ ...c, side: 'p2' })),
    { group: 'Friends', side: 'both', title: 'Friends you share', prompt: 'Couple friends, friends you made together, people who belong to both of you.', example: 'Marcus Lee & Dana Kim' },
  ];
}

export default function GuestBuilder({ onClose }) {
  const state = useAppState();
  const { partner1, partner2, guestEstimate } = state.wedding;
  const steps = useMemo(() => circles(partner1, partner2), [partner1, partner2]);
  const [step, setStep] = useState(0);
  const [drafts, setDrafts] = useState({});
  const [bList, setBList] = useState({});
  const added = useRef({}); // step index → ids added for that step

  const total = steps.length + 1;
  const circle = steps[step - 1];
  const text = drafts[step] || '';
  const preview = circle ? parseGuestLines(text, { side: circle.side, group: circle.group, list: bList[step] ? 'B' : 'A' }) : [];
  const pendingIds = new Set(added.current[step] || []);
  const count = state.guests.filter((g) => !pendingIds.has(g.id)).length + preview.length;

  // Commit this step's guests, replacing whatever this step added before.
  function commit() {
    if (!circle) return;
    const prev = new Set(added.current[step] || []);
    added.current[step] = preview.map((g) => g.id);
    update((s) => { s.guests = s.guests.filter((g) => !prev.has(g.id)); s.guests.push(...preview); });
  }
  const go = (n) => { commit(); setStep(Math.max(0, Math.min(total, n))); };

  const ratio = guestEstimate ? count / guestEstimate : 0;
  const meterTone = ratio > 1.15 ? 'over' : ratio > 0.9 ? 'near' : '';
  const sides = { p1: partner1 || 'Partner 1', p2: partner2 || 'Partner 2', both: 'Shared' };
  const bySide = (side) => state.guests.filter((g) => g.side === side).length;

  return (
    <div className="interview" role="dialog" aria-modal="true" aria-label="Build your guest list">
      <div className="interview-top">
        <div className="tiny muted">💌 Guest list</div>
        <div className="interview-progress" aria-hidden><span style={{ width: `${(step / total) * 100}%` }} /></div>
        <button className="btn ghost icon" onClick={() => { commit(); onClose(); }} aria-label="Close"><X size={18} /></button>
      </div>

      <div className="interview-body">
        {step === 0 && (
          <div className="stack loose interview-card">
            <div className="interview-kicker">Build your guest list</div>
            <h1>Let's fill it in, one circle at a time.</h1>
            <p className="ink2">
              We'll go through {sides.p1}'s people, then {sides.p2}'s, then the friends you share. For each circle, type names one household per line.
              Don't overthink it: get everyone down first, trim later. Anyone you're unsure about can go on the B list.
            </p>
            <p className="ink2">You're planning for about <strong>{guestEstimate}</strong>. {state.guests.length ? `${plural(state.guests.length, 'person is', 'people are')} already on the list.` : ''}</p>
            <div><button className="btn primary" onClick={() => setStep(1)}>Let's go <ArrowRight size={16} /></button></div>
          </div>
        )}

        {circle && (
          <div className="stack interview-card" key={step}>
            <div className="interview-kicker">{step} of {steps.length} · {sides[circle.side]}</div>
            <h1 className="interview-q">{circle.title}</h1>
            <p className="ink2">{circle.prompt}</p>
            <textarea className="textarea interview-answer" autoFocus rows={6} value={text} onChange={(e) => setDrafts({ ...drafts, [step]: e.target.value })} placeholder={circle.example} />
            <div className="row between wrap">
              <label className="row small"><input type="checkbox" className="check" checked={!!bList[step]} onChange={(e) => setBList({ ...bList, [step]: e.target.checked })} /> These are B list (only if there's room)</label>
              <span className="tiny muted">"&" joins a couple · "+1" adds a plus-one</span>
            </div>
            {preview.length > 0 && <div className="row wrap" style={{ gap: 5 }}>{preview.map((g) => <span key={g.id} className="chip">{fullName(g)}</span>)}</div>}
          </div>
        )}

        {step === total && (
          <div className="stack loose interview-card">
            <div className="interview-kicker">Your list so far</div>
            <h1>{plural(state.guests.length, 'person', 'people')} on the list.</h1>
            <div className="grid three">
              {['p1', 'p2', 'both'].map((k) => <div key={k} className="card stat"><div className="k">{sides[k]}</div><div className="v num">{bySide(k)}</div></div>)}
            </div>
            <p className="ink2">
              {state.guests.length > guestEstimate * 1.1
                ? `That's more than the ${guestEstimate} you planned for. Totally normal at this stage. Expect 10–20% to decline, and use the A/B list on the Guests page to trim.`
                : state.guests.length < guestEstimate * 0.7
                  ? `That's under the ${guestEstimate} you planned for, which leaves room. You might lower your estimate (and your catering costs) in Settings.`
                  : `Right around the ${guestEstimate} you planned for. Nice.`}
            </p>
            <div><button className="btn primary" onClick={() => { onClose(); toast('Guest list saved'); }}>Done</button></div>
          </div>
        )}
      </div>

      {step > 0 && step <= total && (
        <div className="interview-foot">
          <button className="btn ghost" onClick={() => go(step - 1)}><ArrowLeft size={16} /> Back</button>
          {step < total && (
            <div className={`guest-meter ${meterTone}`} title={`${count} of about ${guestEstimate}`}>
              <span className="num">{count}</span><span className="muted"> / {guestEstimate}</span>
              <div className="bar" style={{ width: 90 }}><span style={{ width: `${Math.min(100, ratio * 100)}%` }} /></div>
            </div>
          )}
          {step < total && <button className="btn primary" onClick={() => go(step + 1)}>{text.trim() ? 'Next' : 'Skip'} <ArrowRight size={16} /></button>}
        </div>
      )}
    </div>
  );
}
