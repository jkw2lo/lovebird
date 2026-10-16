import { useState } from 'react';
import { ArrowLeft, ArrowRight, X, Phone, MapPin, Check } from 'lucide-react';
import { update } from '../lib/store.js';
import { CATEGORY_BY_KEY } from '../data/categories.js';
import { newId, dayString, today, fmtDate } from '../lib/util.js';
import { MoneyInput, Stars, toast } from './ui.jsx';

// "Talking to a vendor" mode: one question at a time, big and calm, so you can
// keep up during a call or a tour. Everything is saved as you go.

const ORDER = ['idea', 'contacted', 'quoted', 'meeting', 'booked', 'passed'];

export default function Interview({ vendor, weddingDate, onClose }) {
  const cat = CATEGORY_BY_KEY[vendor.category];
  const questions = cat.questions;
  // Steps: intro, each question, date, price, feelings, done.
  const total = questions.length + 4;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => ({ ...vendor.answers }));
  const [availability, setAvailability] = useState(vendor.availability);
  const [holdUntil, setHoldUntil] = useState(vendor.holdUntil || '');
  const [price, setPrice] = useState(null);
  const [includes, setIncludes] = useState('');
  const [rating, setRating] = useState(vendor.rating);
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [kind, setKind] = useState('call');

  const save = (patch) => update((s) => { Object.assign(s.vendors.find((v) => v.id === vendor.id), patch); });
  const go = (n) => setStep(Math.max(0, Math.min(total, n)));
  const qIndex = step - 1;
  const isQuestion = step >= 1 && step <= questions.length;
  const answered = Object.values(answers).filter((a) => a && a.trim()).length;

  function start(k) {
    setKind(k);
    if (ORDER.indexOf(vendor.status) < ORDER.indexOf('meeting')) save({ status: 'meeting' });
    go(1);
  }

  function next() {
    if (isQuestion) save({ answers: { ...answers } });
    if (step === questions.length + 1) save({ availability, holdUntil: availability === 'hold' ? holdUntil : '' });
    if (step === questions.length + 2 && price) {
      update((s) => {
        const v = s.vendors.find((x) => x.id === vendor.id);
        v.quotes.push({ id: newId('q_'), label: v.quotes.length ? `Option ${v.quotes.length + 1}` : 'Quote', total: price, deposit: null, depositDue: '', balanceDue: '', includes, notes: '', fields: {}, receivedOn: dayString(today()) });
      });
    }
    if (step === questions.length + 3) {
      const join = (a, b) => [a, b].filter((x) => x && x.trim()).join('\n');
      update((s) => {
        const v = s.vendors.find((x) => x.id === vendor.id);
        v.rating = rating;
        v.pros = join(v.pros, pros);
        v.cons = join(v.cons, cons);
        const stamp = `${kind === 'tour' ? 'Tour' : 'Call'} on ${fmtDate(today())}: answered ${answered} of ${questions.length} questions.`;
        v.notes = join(v.notes, stamp);
      });
    }
    go(step + 1);
  }

  return (
    <div className="interview" role="dialog" aria-modal="true" aria-label={`Talking to ${vendor.name}`}>
      <div className="interview-top">
        <div className="tiny muted">{cat.emoji} {vendor.name || cat.label}</div>
        <div className="interview-progress" aria-hidden><span style={{ width: `${(step / total) * 100}%` }} /></div>
        <button className="btn ghost icon" onClick={() => { if (isQuestion) save({ answers: { ...answers } }); onClose(); }} aria-label="Close"><X size={18} /></button>
      </div>

      <div className="interview-body">
        {step === 0 && (
          <div className="stack loose interview-card">
            <div className="interview-kicker">Talking to a vendor</div>
            <h1>Ready when you are.</h1>
            <p className="ink2">I'll show you the {questions.length} questions worth asking a {cat.label.toLowerCase()}, one at a time. Jot down their answers as you go; skip anything that doesn't apply. Everything saves to {vendor.name ? `${vendor.name}'s page` : 'their page'} as you go.</p>
            <div className="row wrap">
              <button className="btn primary" onClick={() => start('call')}><Phone size={16} /> It's a call</button>
              <button className="btn" onClick={() => start('tour')}><MapPin size={16} /> It's a tour or tasting</button>
            </div>
          </div>
        )}

        {isQuestion && (
          <div className="stack interview-card" key={qIndex}>
            <div className="interview-kicker">Question {qIndex + 1} of {questions.length}</div>
            <h1 className="interview-q">{questions[qIndex]}</h1>
            <textarea className="textarea interview-answer" autoFocus rows={4} value={answers[qIndex] || ''} onChange={(e) => setAnswers({ ...answers, [qIndex]: e.target.value })}
              placeholder="Their answer…" onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) next(); }} />
            <div className="tiny muted">⌘ + Enter for the next question</div>
          </div>
        )}

        {step === questions.length + 1 && (
          <div className="stack interview-card">
            <div className="interview-kicker">The big one</div>
            <h1 className="interview-q">Is {weddingDate ? fmtDate(weddingDate, { month: 'long', day: 'numeric', year: 'numeric' }) : 'your date'} open?</h1>
            <div className="choice-stack">
              {[['available', 'Yes, it’s open'], ['hold', 'They’re holding it for us'], ['unavailable', 'No, it’s taken'], ['unknown', 'We didn’t get to it']].map(([k, label]) => (
                <button key={k} className={`choice ${availability === k ? 'on' : ''}`} onClick={() => setAvailability(k)}>{availability === k && <Check size={16} />} {label}</button>
              ))}
            </div>
            {availability === 'hold' && <label className="row small">Holding until <input type="date" className="input" style={{ width: 180 }} value={holdUntil} onChange={(e) => setHoldUntil(e.target.value)} /></label>}
          </div>
        )}

        {step === questions.length + 2 && (
          <div className="stack interview-card">
            <div className="interview-kicker">Pricing</div>
            <h1 className="interview-q">Did they give you a price?</h1>
            <div style={{ maxWidth: 260 }}><MoneyInput value={price} onChange={setPrice} placeholder="Total, if they said" /></div>
            <input className="input" value={includes} onChange={(e) => setIncludes(e.target.value)} placeholder="What's included, roughly (optional)" />
            <p className="tiny muted">Leave it blank if not. You can paste their written quote on their page later.</p>
          </div>
        )}

        {step === questions.length + 3 && (
          <div className="stack interview-card">
            <div className="interview-kicker">Gut check</div>
            <h1 className="interview-q">How did it feel?</h1>
            <Stars value={rating} onChange={setRating} size={30} />
            <textarea className="textarea" rows={2} value={pros} onChange={(e) => setPros(e.target.value)} placeholder="What did you love?" />
            <textarea className="textarea" rows={2} value={cons} onChange={(e) => setCons(e.target.value)} placeholder="Anything that gave you pause?" />
          </div>
        )}

        {step === total && (
          <div className="stack loose interview-card" style={{ textAlign: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: 48 }}>📝</div>
            <h1>All noted.</h1>
            <p className="ink2">You got answers to {answered} of {questions.length} questions{price ? ' and a price' : ''}. It's all on {vendor.name ? `${vendor.name}'s` : 'their'} page, ready to compare with the others.</p>
            <button className="btn primary" onClick={() => { onClose(); toast('Saved your notes'); }}>Done</button>
          </div>
        )}
      </div>

      {step > 0 && step < total && (
        <div className="interview-foot">
          <button className="btn ghost" onClick={() => go(step - 1)}><ArrowLeft size={16} /> Back</button>
          <div className="row">
            {isQuestion && <button className="btn ghost" onClick={() => { setAnswers({ ...answers }); go(step + 1); }}>Skip</button>}
            <button className="btn primary" onClick={next}>{step === total - 1 ? 'Finish' : 'Next'} <ArrowRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
