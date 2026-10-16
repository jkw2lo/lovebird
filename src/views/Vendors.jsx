import { useState } from 'react';
import { Plus, Link2 } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { CATEGORIES, CATEGORY_BY_KEY } from '../data/categories.js';
import { bookedVendor, vendorCost, chosenQuote } from '../lib/derive.js';
import { TASKS } from '../data/plan.js';
import { money, plural, fmtDate, parseDay, addDays } from '../lib/util.js';
import { PageHead, Modal, Field, go, toast } from '../components/ui.jsx';
import { newVendor } from '../lib/magpie.js';
import { unfurl, keepPhoto } from '../lib/links.js';

export default function Vendors() {
  const state = useAppState();
  const [adding, setAdding] = useState(false);
  const wedding = parseDay(state.wedding.date);

  const groups = [
    { label: 'Essentials', items: CATEGORIES.filter((c) => c.essential) },
    { label: 'Nice to have', items: CATEGORIES.filter((c) => !c.essential) },
  ];

  return (
    <div>
      <PageHead eyebrow="Vendors" title="Your vendor team" lede="Save options for each kind of vendor, log their quotes and whether they're free on your date, then compare side by side and book one.">
        <button className="btn primary" onClick={() => setAdding(true)}><Plus size={16} /> Add a vendor</button>
      </PageHead>

      {groups.map((g) => (
        <section key={g.label} style={{ marginBottom: 26 }}>
          <h3 className="muted" style={{ fontFamily: 'var(--sans)', fontSize: 12.5, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 650, marginBottom: 10 }}>{g.label}</h3>
          <div className="grid auto">
            {g.items.map((c) => {
              const booked = bookedVendor(state, c.key);
              const options = state.vendors.filter((v) => v.category === c.key && v.status !== 'passed');
              const quoted = options.filter((v) => chosenQuote(v));
              const task = TASKS.find((t) => t.books === c.key);
              const bookBy = wedding && task ? addDays(wedding, -task.before) : null;
              return (
                <a key={c.key} href={`#/vendors/${c.key}`} className={`card cat-card ${booked ? 'booked' : ''}`}>
                  <div className="row between top">
                    <span className="em">{c.emoji}</span>
                    {booked ? <span className="chip green">Booked</span> : bookBy && !booked ? <span className="tiny muted">Book by {fmtDate(bookBy, { month: 'short', year: 'numeric' })}</span> : null}
                  </div>
                  <h3>{c.label}</h3>
                  {booked ? (
                    <p className="small"><strong>{booked.name}</strong>{vendorCost(booked) ? ` · ${money(vendorCost(booked))}` : ''}</p>
                  ) : options.length ? (
                    <p className="small ink2">{plural(options.length, 'option')}{quoted.length ? ` · ${quoted.length} quoted` : ''}</p>
                  ) : (
                    <p className="small muted">{c.blurb}</p>
                  )}
                </a>
              );
            })}
          </div>
        </section>
      ))}

      {adding && <AddVendorModal onClose={() => setAdding(false)} />}
    </div>
  );
}

export function AddVendorModal({ category, onClose, initial = {} }) {
  const [cat, setCat] = useState(category || initial.category || 'venue');
  const [name, setName] = useState(initial.name || '');
  const [website, setWebsite] = useState(initial.website || '');
  const [notes, setNotes] = useState(initial.notes || '');
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  async function lookUp() {
    if (!website.trim()) return;
    setBusy(true);
    const meta = await unfurl(website);
    setBusy(false);
    setPreview(meta);
    if (!name && meta.title) setName(meta.title.split(/\s[|–—-]\s/)[0].slice(0, 80));
  }

  async function save() {
    setBusy(true);
    const imageId = preview && preview.image ? await keepPhoto(preview.image) : initial.imageId || null;
    const vendor = newVendor({
      category: cat, name: name.trim() || (preview && preview.siteName) || 'New vendor', website: (preview && preview.url) || website.trim(),
      notes, summary: (preview && preview.description) || '', imageId, imageUrl: (preview && preview.image) || initial.imageUrl || null,
      startingPrice: initial.startingPrice || '', tags: initial.tags || [], details: initial.details || [],
    });
    update((s) => { s.vendors.push(vendor); });
    setBusy(false);
    onClose(vendor);
    toast(`Added ${vendor.name} to ${CATEGORY_BY_KEY[cat].label}`);
    go(`vendor/${vendor.id}`);
  }

  return (
    <Modal title="Add a vendor option" subtitle="Just the basics for now. You can add quotes, contacts and notes on the next screen." onClose={() => onClose(null)}
      footer={<><button className="btn ghost" onClick={() => onClose(null)}>Cancel</button><button className="btn primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Add vendor'}</button></>}>
      <div className="stack">
        {!category && (
          <Field label="Kind of vendor">
            <select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
            </select>
          </Field>
        )}
        <Field label="Website or listing" hint="Paste a link and press Look up to grab the name and a photo.">
          <div className="row">
            <input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" onKeyDown={(e) => e.key === 'Enter' && lookUp()} />
            <button className="btn" onClick={lookUp} disabled={busy || !website.trim()}><Link2 size={15} /> Look up</button>
          </div>
        </Field>
        {preview && (preview.image || preview.description) && (
          <div className="row top" style={{ padding: 10, border: '1px solid var(--line)', borderRadius: 10 }}>
            {preview.image && <img src={preview.image} alt="" referrerPolicy="no-referrer" style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8 }} />}
            <div className="small grow"><div style={{ fontWeight: 600 }}>{preview.title}</div><div className="muted">{(preview.description || '').slice(0, 160)}</div></div>
          </div>
        )}
        {preview && preview.error && <p className="tiny muted">Couldn't preview that page ({preview.error}). The link will still be saved.</p>}
        <Field label="Name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rosewood Estate" /></Field>
        <Field label="First impressions"><textarea className="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Who recommended them, what you liked…" /></Field>
      </div>
    </Modal>
  );
}
