import { useState, useEffect, Fragment } from 'react';
import { ArrowLeft, ExternalLink, Plus, Trash2, Sparkles, CheckCircle2, ImagePlus, Mail, Phone, Undo2, MessagesSquare } from 'lucide-react';
import Interview from '../components/Interview.jsx';
import { useAppState, update, getState } from '../lib/store.js';
import { CATEGORIES, CATEGORY_BY_KEY, VENDOR_STATUSES, AVAILABILITY } from '../data/categories.js';
import { chosenQuote, bookedVendor } from '../lib/derive.js';
import { money, fmtDate, newId, hostOf, normalizeUrl, addDays, parseDay, dayString, today } from '../lib/util.js';
import { Field, Text, MoneyInput, Stars, Photo, Modal, Empty, go, toast } from '../components/ui.jsx';
import { keepFile } from '../lib/links.js';

function setVendor(id, patch) {
  update((s) => { const v = s.vendors.find((x) => x.id === id); if (v) Object.assign(v, typeof patch === 'function' ? patch(v) : patch); });
}

export default function VendorDetail({ id, query }) {
  const state = useAppState();
  const v = state.vendors.find((x) => x.id === id);
  const [booking, setBooking] = useState(false);
  const [reading, setReading] = useState(false);
  const [interviewing, setInterviewing] = useState(false);

  // Arriving from "Log a quote" or "Start a call" opens that straight away.
  useEffect(() => {
    if (!query) return;
    if (query.get('quote')) setReading(true);
    if (query.get('talk')) setInterviewing(true);
    if (query.get('quote') || query.get('talk')) history.replaceState(null, '', `#/vendor/${id}`);
  }, [id, query && query.toString()]);
  if (!v) return <Empty emoji="🤷" title="That vendor is gone" action={<a className="btn" href="#/vendors">Back to vendors</a>} />;
  const cat = CATEGORY_BY_KEY[v.category];
  const set = (patch) => setVendor(v.id, patch);
  const statusIndex = VENDOR_STATUSES.findIndex((s) => s.key === v.status);
  const otherBooked = bookedVendor(state, v.category);

  const remove = () => {
    const snapshot = { ...v };
    const payments = state.payments.filter((p) => p.vendorId === v.id);
    update((s) => { s.vendors = s.vendors.filter((x) => x.id !== v.id); s.payments = s.payments.filter((p) => p.vendorId !== v.id); });
    go(`vendors/${v.category}`);
    toast(`Deleted ${v.name}`, { label: 'Undo', run: () => update((s) => { s.vendors.push(snapshot); s.payments.push(...payments); }) });
  };

  const addPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageId = await keepFile(file);
    set({ imageId });
  };

  return (
    <div className="stack loose">
      <div>
        <a className="back" href={`#/vendors/${v.category}`}><ArrowLeft size={14} /> {cat.label}</a>
        <div className="vendor-hero">
          <label className="ph" style={{ cursor: 'pointer' }} title="Change photo">
            <Photo imageId={v.imageId} url={v.imageUrl} fallback={cat.emoji} />
            <input type="file" accept="image/*" hidden onChange={addPhoto} />
            <span className="btn sm" style={{ position: 'absolute', right: 8, bottom: 8 }}><ImagePlus size={14} /></span>
          </label>
          <div className="stack">
            <Text className="input bare name-input" value={v.name} onChange={(name) => set({ name })} placeholder="Vendor name" aria-label="Vendor name" />
            <div className="row wrap" style={{ gap: 8, marginTop: -6 }}>
              <select className="select sm" style={{ width: 'auto' }} value={v.category} onChange={(e) => set({ category: e.target.value })} aria-label="Category">
                {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
              </select>
              {v.website && <a className="btn sm" href={normalizeUrl(v.website)} target="_blank" rel="noreferrer"><ExternalLink size={14} /> {hostOf(normalizeUrl(v.website)) || 'Website'}</a>}
              {v.email && <a className="btn sm" href={`mailto:${v.email}`}><Mail size={14} /> Email</a>}
              {v.phone && <a className="btn sm" href={`tel:${v.phone}`}><Phone size={14} /> Call</a>}
              <Stars value={v.rating} onChange={(rating) => set({ rating })} size={17} />
            </div>
            {v.summary && <p className="ink2">{v.summary}</p>}
            <div className="pipeline" role="radiogroup" aria-label="Status">
              {VENDOR_STATUSES.map((s, i) => (
                <button key={s.key} title={s.hint} role="radio" aria-checked={v.status === s.key}
                  className={`${v.status === s.key ? 'on' : ''} ${s.key === 'passed' ? 'passed' : ''} ${i < statusIndex && v.status !== 'passed' && s.key !== 'passed' ? 'past' : ''}`}
                  onClick={() => (s.key === 'booked' && v.status !== 'booked' ? setBooking(true) : set({ status: s.key }))}>
                  {s.label}
                </button>
              ))}
            </div>
            {v.status === 'booked' ? (
              <div className="callout green"><CheckCircle2 size={18} style={{ color: 'var(--accent-2)' }} /><div className="grow">Booked{chosenQuote(v) ? ` for ${money(chosenQuote(v).total)}` : ''}. It counts toward your budget, and the matching step in your plan is checked off.</div><button className="btn sm ghost" onClick={() => set({ status: 'quoted' })}><Undo2 size={14} /> Unbook</button></div>
            ) : otherBooked && otherBooked.id !== v.id ? (
              <p className="small muted">You've already booked <a href={`#/vendor/${otherBooked.id}`}>{otherBooked.name}</a> for this.</p>
            ) : (
              <div className="row wrap">
                <button className="btn" onClick={() => setInterviewing(true)}><MessagesSquare size={16} /> On a call or tour? Start here</button>
                <button className="btn primary" onClick={() => setBooking(true)}><CheckCircle2 size={16} /> Book them</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid two" style={{ alignItems: 'start' }}>
        <div className="stack">
          <section className="card pad stack">
            <div className="row between"><h3>Your date</h3></div>
            <div className="grid two">
              <Field label="Availability">
                <select className="select" value={v.availability} onChange={(e) => set({ availability: e.target.value })}>
                  {AVAILABILITY.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                </select>
              </Field>
              {v.availability === 'hold' && (
                <Field label="Holding until"><input type="date" className="input" value={v.holdUntil} onChange={(e) => set({ holdUntil: e.target.value })} /></Field>
              )}
            </div>
            {state.wedding.date ? <p className="tiny muted">Your date: {fmtDate(state.wedding.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p> : <p className="tiny muted">No date set yet. Ask about the dates you're considering.</p>}
          </section>

          <section className="card pad stack">
            <div className="row between">
              <h3>Quotes</h3>
              <div className="row">
                <button className="btn sm" onClick={() => setReading(true)}><Sparkles size={14} /> Paste a quote</button>
                <button className="btn sm" onClick={() => set((x) => ({ quotes: [...x.quotes, newQuote(x.quotes.length)], chosenQuoteId: x.chosenQuoteId || null }))}><Plus size={14} /> Add</button>
              </div>
            </div>
            {v.quotes.length === 0 && <p className="small muted">{v.startingPrice ? `Their listing says ${v.startingPrice}. ` : ''}When you get pricing, add it here (or paste the email and let Claude fill it in) so you can compare.</p>}
            {v.quotes.map((q) => <QuoteEditor key={q.id} vendor={v} quote={q} cat={cat} />)}
          </section>

          <section className="card pad stack">
            <h3>Questions to ask</h3>
            {cat.questions.map((q, i) => (
              <Field key={i} label={q}>
                <Text multiline className="textarea" rows={1} style={{ minHeight: 38 }} value={v.answers[i] || ''} onChange={(val) => set((x) => ({ answers: { ...x.answers, [i]: val } }))} placeholder="Their answer…" />
              </Field>
            ))}
          </section>
        </div>

        <div className="stack">
          <section className="card pad stack">
            <h3>Notes</h3>
            <Text multiline className="textarea" rows={4} value={v.notes} onChange={(notes) => set({ notes })} placeholder="Impressions from calls, tours and tastings…" />
            <div className="grid two">
              <Field label="Pros"><Text multiline className="textarea" rows={3} value={v.pros} onChange={(pros) => set({ pros })} placeholder="What you love" /></Field>
              <Field label="Cons"><Text multiline className="textarea" rows={3} value={v.cons} onChange={(cons) => set({ cons })} placeholder="What gives you pause" /></Field>
            </div>
          </section>

          <section className="card pad stack">
            <h3>Contact</h3>
            <div className="grid two">
              <Field label="Contact person"><Text value={v.contactName} onChange={(contactName) => set({ contactName })} /></Field>
              <Field label="Location"><Text value={v.location} onChange={(location) => set({ location })} /></Field>
              <Field label="Email"><Text type="email" value={v.email} onChange={(email) => set({ email })} /></Field>
              <Field label="Phone"><Text type="tel" value={v.phone} onChange={(phone) => set({ phone })} /></Field>
              <Field label="Website"><Text value={v.website} onChange={(website) => set({ website })} /></Field>
              <Field label="Instagram"><Text value={v.instagram} onChange={(instagram) => set({ instagram })} placeholder="@handle" /></Field>
            </div>
          </section>

          {v.details && v.details.length > 0 && (
            <section className="card pad stack">
              <h3>From the listing</h3>
              <dl className="detail-list">{v.details.map((d, i) => <Fragment key={i}><dt>{d.label}</dt><dd>{d.value}</dd></Fragment>)}</dl>
              {v.tags && v.tags.length > 0 && <div className="row wrap" style={{ gap: 5 }}>{v.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>}
            </section>
          )}

          <Payments vendor={v} state={state} />

          <div><button className="btn sm ghost danger" onClick={remove}><Trash2 size={14} /> Delete this vendor</button></div>
        </div>
      </div>

      {booking && <BookModal vendor={v} onClose={() => setBooking(false)} />}
      {reading && <ReadQuoteModal vendor={v} cat={cat} onClose={() => setReading(false)} />}
      {interviewing && <Interview vendor={v} weddingDate={state.wedding.date} onClose={() => setInterviewing(false)} />}
    </div>
  );
}

function newQuote(n, fields = {}) {
  return { id: newId('q_'), label: n ? `Option ${n + 1}` : 'Quote', total: null, deposit: null, depositDue: '', balanceDue: '', includes: '', notes: '', fields: {}, receivedOn: dayString(today()), ...fields };
}

function QuoteEditor({ vendor, quote: q, cat }) {
  const chosen = chosenQuote(vendor)?.id === q.id;
  const setQ = (patch) => setVendor(vendor.id, (x) => ({ quotes: x.quotes.map((y) => (y.id === q.id ? { ...y, ...patch } : y)) }));
  return (
    <div className={`quote stack ${chosen && vendor.quotes.length > 1 ? 'chosen' : ''}`}>
      <div className="row between">
        <Text className="input bare" style={{ fontWeight: 650, fontSize: 15 }} value={q.label} onChange={(label) => setQ({ label })} placeholder="Package name" />
        <div className="row" style={{ gap: 4 }}>
          {vendor.quotes.length > 1 && (chosen ? <span className="chip green">Comparing this one</span> : <button className="btn sm ghost" onClick={() => setVendor(vendor.id, { chosenQuoteId: q.id })}>Use this one</button>)}
          <button className="btn sm ghost icon" aria-label="Delete quote" onClick={() => setVendor(vendor.id, (x) => ({ quotes: x.quotes.filter((y) => y.id !== q.id), chosenQuoteId: x.chosenQuoteId === q.id ? null : x.chosenQuoteId }))}><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="grid three">
        <Field label="Total price"><MoneyInput value={q.total} onChange={(total) => setQ({ total })} /></Field>
        <Field label="Deposit"><MoneyInput value={q.deposit} onChange={(deposit) => setQ({ deposit })} /></Field>
        <Field label="Deposit due"><input type="date" className="input" value={q.depositDue} onChange={(e) => setQ({ depositDue: e.target.value })} /></Field>
      </div>
      <div className="grid three">
        <Field label="Balance due"><input type="date" className="input" value={q.balanceDue} onChange={(e) => setQ({ balanceDue: e.target.value })} /></Field>
        <Field label="What's included" style={{ gridColumn: 'span 2' }}><Text value={q.includes} onChange={(includes) => setQ({ includes })} placeholder="e.g. 8 hours, second shooter, online gallery" /></Field>
      </div>
      <div className="kv">
        {cat.fields.map((f) => (
          <Field key={f} label={f}><Text className="input sm" value={q.fields[f] || ''} onChange={(val) => setQ({ fields: { ...q.fields, [f]: val } })} /></Field>
        ))}
      </div>
      <Field label="Fine print"><Text multiline className="textarea" rows={2} value={q.notes} onChange={(notes) => setQ({ notes })} placeholder="Overtime, travel fees, cancellation terms…" /></Field>
    </div>
  );
}

function ReadQuoteModal({ vendor, cat, onClose }) {
  const state = getState();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const hasKey = !!state.settings.apiKey;

  async function run() {
    setBusy(true);
    setError('');
    try {
      const { readQuote } = await import('../lib/ai.js');
      const r = await readQuote({ state: getState(), text, category: cat.key });
      const fields = Object.fromEntries((r.fields || []).filter((f) => cat.fields.includes(f.label)).map((f) => [f.label, f.value]));
      setVendor(vendor.id, (x) => {
        const quote = newQuote(x.quotes.length, {
          label: r.package_name || (x.quotes.length ? `Option ${x.quotes.length + 1}` : 'Quote'), total: r.total, deposit: r.deposit,
          depositDue: r.deposit_due || '', balanceDue: r.balance_due || '', includes: r.includes || '', notes: r.notes || '', fields,
        });
        return {
          quotes: [...x.quotes, quote],
          status: ['idea', 'contacted'].includes(x.status) ? 'quoted' : x.status,
          availability: r.availability !== 'unknown' ? r.availability : x.availability,
          holdUntil: r.hold_until || x.holdUntil,
          contactName: x.contactName || r.contact.name || '', email: x.email || r.contact.email || '', phone: x.phone || r.contact.phone || '',
          name: x.name || r.vendor_name || '',
        };
      });
      toast('Quote added. Check it over.');
      onClose();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title="Paste a quote or email" subtitle={`Paste what ${vendor.name || 'they'} sent: a proposal, a price list or an email. Claude pulls out the price, deposit, dates and what's included.`} onClose={onClose} wide
      footer={<><button className="btn ghost" style={{ marginRight: 'auto' }} onClick={() => { setVendor(vendor.id, (x) => ({ quotes: [...x.quotes, newQuote(x.quotes.length)], status: ['idea', 'contacted'].includes(x.status) ? 'quoted' : x.status })); onClose(); toast('Added a blank quote below. Fill it in.'); }}>Type it in myself</button><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!hasKey || busy || !text.trim()} onClick={run}>{busy ? 'Reading…' : <><Sparkles size={15} /> Fill in the quote</>}</button></>}>
      {!hasKey && <div className="callout" style={{ marginBottom: 12 }}><div>This uses Claude, which needs an Anthropic API key. <a href="#/settings" onClick={onClose}>Add one in Settings</a>, or choose <strong>Type it in myself</strong>.</div></div>}
      <textarea className="textarea" rows={12} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Hi! Thanks so much for reaching out. For a Saturday in September our Classic package is $6,800 and includes…" />
      {error && <p className="small" style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</p>}
    </Modal>
  );
}

// ---------- booking

export function BookModal({ vendor, onClose }) {
  const state = getState();
  const q = chosenQuote(vendor);
  const [quoteId, setQuoteId] = useState(q ? q.id : null);
  const quote = vendor.quotes.find((x) => x.id === quoteId) || null;
  const [total, setTotal] = useState(quote ? quote.total : null);
  const wedding = parseDay(state.wedding.date);
  const [deposit, setDeposit] = useState(quote && quote.deposit ? quote.deposit : null);
  const [depositDue, setDepositDue] = useState((quote && quote.depositDue) || dayString(today()));
  const [balanceDue, setBalanceDue] = useState((quote && quote.balanceDue) || (wedding ? dayString(addDays(wedding, -14)) : ''));
  const [depositPaid, setDepositPaid] = useState(false);
  const [passOthers, setPassOthers] = useState(true);
  const others = state.vendors.filter((x) => x.category === vendor.category && x.id !== vendor.id && !['passed', 'booked'].includes(x.status));
  const hasPayments = state.payments.some((p) => p.vendorId === vendor.id);

  const pickQuote = (id) => {
    setQuoteId(id);
    const nq = vendor.quotes.find((x) => x.id === id);
    if (nq) { setTotal(nq.total); setDeposit(nq.deposit); if (nq.depositDue) setDepositDue(nq.depositDue); if (nq.balanceDue) setBalanceDue(nq.balanceDue); }
  };

  const book = () => {
    update((s) => {
      const v = s.vendors.find((x) => x.id === vendor.id);
      v.status = 'booked';
      v.availability = 'available';
      v.holdUntil = '';
      if (quote) {
        v.chosenQuoteId = quote.id;
        const sq = v.quotes.find((x) => x.id === quote.id);
        sq.total = total;
      } else if (total) {
        const nq = newQuote(0, { label: 'Contract', total, deposit, depositDue, balanceDue });
        v.quotes.push(nq);
        v.chosenQuoteId = nq.id;
      }
      if (!hasPayments && total) {
        if (deposit) s.payments.push({ id: newId('p_'), vendorId: v.id, label: 'Deposit', amount: deposit, due: depositDue, paid: depositPaid, paidOn: depositPaid ? dayString(today()) : '' });
        const balance = Number(total) - Number(deposit || 0);
        if (balance > 0) s.payments.push({ id: newId('p_'), vendorId: v.id, label: deposit ? 'Final balance' : 'Payment', amount: balance, due: balanceDue, paid: false, paidOn: '' });
      }
      if (passOthers) for (const o of s.vendors) if (others.some((x) => x.id === o.id)) o.status = 'passed';
    });
    onClose();
  };

  return (
    <Modal title={`Book ${vendor.name || 'this vendor'}`} subtitle="Add the price and payment dates from your contract. Payments will show up in your budget and on the Today page when they're due." onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" onClick={book}><CheckCircle2 size={16} /> Mark as booked</button></>}>
      <div className="stack">
        {vendor.quotes.length > 1 && (
          <Field label="Which package?">
            <select className="select" value={quoteId || ''} onChange={(e) => pickQuote(e.target.value)}>
              {vendor.quotes.map((x) => <option key={x.id} value={x.id}>{x.label} · {money(x.total)}</option>)}
            </select>
          </Field>
        )}
        <Field label="Contract total"><MoneyInput value={total} onChange={setTotal} /></Field>
        {!hasPayments ? (
          <>
            <div className="grid two">
              <Field label="Deposit"><MoneyInput value={deposit} onChange={setDeposit} /></Field>
              <Field label="Deposit due"><input type="date" className="input" value={depositDue} onChange={(e) => setDepositDue(e.target.value)} /></Field>
            </div>
            <label className="row small"><input type="checkbox" className="check" checked={depositPaid} onChange={(e) => setDepositPaid(e.target.checked)} /> We've already paid the deposit</label>
            <Field label="Final balance due" hint={total ? `${money(Number(total) - Number(deposit || 0))} remaining after the deposit.` : ''}><input type="date" className="input" value={balanceDue} onChange={(e) => setBalanceDue(e.target.value)} /></Field>
          </>
        ) : <p className="small muted">This vendor already has payments in your budget.</p>}
        {others.length > 0 && (
          <label className="row small"><input type="checkbox" className="check" checked={passOthers} onChange={(e) => setPassOthers(e.target.checked)} /> Mark the other {others.length} {CATEGORY_BY_KEY[vendor.category].label.toLowerCase()} option{others.length === 1 ? '' : 's'} as passed</label>
        )}
      </div>
    </Modal>
  );
}

function Payments({ vendor, state }) {
  const payments = state.payments.filter((p) => p.vendorId === vendor.id).sort((a, b) => (a.due || '').localeCompare(b.due || ''));
  if (vendor.status !== 'booked' && payments.length === 0) return null;
  const setP = (id, patch) => update((s) => { Object.assign(s.payments.find((p) => p.id === id), patch); });
  return (
    <section className="card pad stack">
      <div className="row between">
        <h3>Payments</h3>
        <button className="btn sm" onClick={() => update((s) => { s.payments.push({ id: newId('p_'), vendorId: vendor.id, label: 'Payment', amount: null, due: '', paid: false, paidOn: '' }); })}><Plus size={14} /> Add</button>
      </div>
      {payments.length === 0 && <p className="small muted">No payments scheduled.</p>}
      {payments.map((p) => (
        <div key={p.id} className="row">
          <input type="checkbox" className="check" checked={p.paid} onChange={(e) => setP(p.id, { paid: e.target.checked, paidOn: e.target.checked ? dayString(today()) : '' })} aria-label="Paid" />
          <Text className="input sm" style={{ flex: 1.3 }} value={p.label} onChange={(label) => setP(p.id, { label })} />
          <div style={{ flex: 1 }}><MoneyInput className="input sm" value={p.amount} onChange={(amount) => setP(p.id, { amount })} /></div>
          <input type="date" className="input sm" style={{ flex: 1.1 }} value={p.due} onChange={(e) => setP(p.id, { due: e.target.value })} />
          <button className="btn sm ghost icon" aria-label="Delete payment" onClick={() => update((s) => { s.payments = s.payments.filter((x) => x.id !== p.id); })}><Trash2 size={14} /></button>
        </div>
      ))}
    </section>
  );
}
