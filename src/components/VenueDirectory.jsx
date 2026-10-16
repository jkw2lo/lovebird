import { useMemo, useState } from 'react';
import { Plus, Check, ExternalLink, Users, Info, Sparkles, MapPin } from 'lucide-react';
import { update, getState } from '../lib/store.js';
import { TORONTO, VENUE_TYPES, CATERING_LABEL, venueEstimate } from '../data/venues.js';
import { budgetSummary } from '../lib/derive.js';
import { newVendor } from '../lib/magpie.js';
import { keepPhoto } from '../lib/links.js';
import { money, plural } from '../lib/util.js';
import { Modal, Photo, Segmented, go, toast } from './ui.jsx';
import { openAssistant } from './Assistant.jsx';

// Researched venues you can browse, filter by what fits, and add to your options.

const SETTING_LABEL = { indoor: 'Indoor', outdoor: 'Outdoor', both: 'Indoor & outdoor' };
const k = (n) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : money(n));

function fitFor(est, target) {
  if (!target) return null;
  if (est.allInHigh <= target) return { tone: 'green', label: 'Fits your budget' };
  if (est.allInLow <= target) return { tone: 'gold', label: 'Could fit' };
  if (est.allInLow <= target * 1.25) return { tone: 'warn', label: 'A stretch' };
  return { tone: 'danger', label: 'Over budget' };
}

export default function VenueDirectory({ state }) {
  const city = TORONTO;
  const [guests, setGuests] = useState(state.wedding.guestEstimate || 120);
  const [type, setType] = useState('all');
  const [catering, setCatering] = useState('all');
  const [outdoor, setOutdoor] = useState(false);
  const [onlyFits, setOnlyFits] = useState(false);
  const [showSmall, setShowSmall] = useState(false);
  const [sort, setSort] = useState('fit');
  const [openId, setOpenId] = useState(null);

  // What you've set aside for venue + food and drink.
  const lines = budgetSummary(state).lines;
  const target = (lines.find((l) => l.key === 'venue')?.allocated || 0) + (lines.find((l) => l.key === 'catering')?.allocated || 0);
  const added = new Map(state.vendors.filter((v) => v.directoryId).map((v) => [v.directoryId, v]));

  const rows = useMemo(() => city.venues.map((v) => {
    const est = venueEstimate(city, v, guests);
    return { v, est, fit: fitFor(est, target), fitsSize: v.seated >= guests && (!v.minGuests || v.minGuests <= guests) };
  }), [guests, target]);

  const filtered = rows.filter(({ v, fit, fitsSize }) =>
    (showSmall || fitsSize)
    && (type === 'all' || v.type === type)
    && (catering === 'all' || (catering === 'own' ? v.catering !== 'in-house' : v.catering === 'in-house'))
    && (!outdoor || v.setting !== 'indoor')
    && (!onlyFits || (fit && (fit.tone === 'green' || fit.tone === 'gold'))));
  const rank = { green: 0, gold: 1, warn: 2, danger: 3 };
  filtered.sort((a, b) => {
    if (sort === 'price') return a.est.allInLow - b.est.allInLow;
    if (sort === 'size') return b.v.seated - a.v.seated;
    return (rank[a.fit?.tone] ?? 9) - (rank[b.fit?.tone] ?? 9) || a.est.allInLow - b.est.allInLow;
  });
  const tooSmall = rows.filter((r) => !r.fitsSize).length;
  const types = [...new Set(city.venues.map((v) => v.type))];
  const open = openId && rows.find((r) => r.v.id === openId);

  return (
    <div className="stack">
      <div className="callout">
        <Info size={17} />
        <div className="small">
          <strong>{city.venues.length} {city.label} venues, researched {city.researched}.</strong> Prices come from venue packages and wedding directories, and some are a year or two old,
          so treat them as a starting point and confirm with the venue. Estimates are for venue plus food and drink{target ? `, compared with the ${money(target)} your budget sets aside for both` : ''}.
        </div>
      </div>

      <div className="card pad stack" style={{ gap: 12 }}>
        <div className="row wrap" style={{ gap: 14 }}>
          <label className="row small" style={{ gap: 8 }}>
            <Users size={15} className="muted" /> Guests
            <input type="number" className="input sm" style={{ width: 80 }} min={10} value={guests} onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 0))} />
          </label>
          <select className="select sm" style={{ width: 'auto' }} value={type} onChange={(e) => setType(e.target.value)} aria-label="Kind of venue">
            <option value="all">Any kind of venue</option>
            {types.map((t) => <option key={t} value={t}>{VENUE_TYPES[t].emoji} {VENUE_TYPES[t].label}</option>)}
          </select>
          <select className="select sm" style={{ width: 'auto' }} value={catering} onChange={(e) => setCatering(e.target.value)} aria-label="Catering">
            <option value="all">Any catering setup</option>
            <option value="in-house">Catering included</option>
            <option value="own">Choose or bring a caterer</option>
          </select>
          <label className="row small" style={{ gap: 6 }}><input type="checkbox" className="check" checked={outdoor} onChange={(e) => setOutdoor(e.target.checked)} /> Outdoor space</label>
          {target > 0 && <label className="row small" style={{ gap: 6 }}><input type="checkbox" className="check" checked={onlyFits} onChange={(e) => setOnlyFits(e.target.checked)} /> Within budget</label>}
          <span className="grow" />
          <Segmented value={sort} onChange={setSort} options={[{ value: 'fit', label: 'Best fit' }, { value: 'price', label: 'Price' }, { value: 'size', label: 'Size' }]} />
        </div>
        {tooSmall > 0 && (
          <div className="tiny muted">
            {showSmall ? 'Showing every venue, including ones that don’t fit your guest count.' : `${plural(tooSmall, 'venue')} hidden because ${tooSmall === 1 ? 'it doesn’t' : 'they don’t'} fit ${guests} guests.`}
            <button className="btn sm ghost" onClick={() => setShowSmall(!showSmall)}>{showSmall ? 'Hide them' : 'Show anyway'}</button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="muted" style={{ textAlign: 'center', padding: 30 }}>No venues match all of those. Try loosening a filter.</p>
      ) : (
        <div className="grid auto">
          {filtered.map(({ v, est, fit, fitsSize }) => (
            <article key={v.id} className={`card vendor-card venue-card ${fitsSize ? '' : 'passed'}`}>
              <button className="ph venue-ph" onClick={() => setOpenId(v.id)} aria-label={`More about ${v.name}`}>
                <VenuePhoto v={v} />
              </button>
              <div className="bd">
                <div className="row between top">
                  <button className="venue-name" onClick={() => setOpenId(v.id)}>{v.name}</button>
                  {added.has(v.id) && <span className="chip green"><Check size={12} /> Added</span>}
                </div>
                <div className="tiny muted row" style={{ gap: 4 }}><MapPin size={12} /> {v.area} · {VENUE_TYPES[v.type].label}</div>
                <p className="small ink2">{v.summary}</p>
                <div className="row wrap" style={{ gap: 5 }}>
                  <span className="chip">Seats {v.seated}</span>
                  <span className="chip">{CATERING_LABEL[v.catering]}</span>
                  {v.setting !== 'indoor' && <span className="chip">{SETTING_LABEL[v.setting]}</span>}
                </div>
                <div className="venue-est">
                  <div><span className="num" style={{ fontWeight: 650 }}>≈ {k(est.allInLow)}–{k(est.allInHigh)}</span> <span className="tiny muted">all-in for {guests}</span></div>
                  {fit && <span className={`chip ${fit.tone}`}>{fit.label}</span>}
                </div>
                <div className="row" style={{ marginTop: 2 }}>
                  {added.has(v.id)
                    ? <a className="btn sm" href={`#/vendor/${added.get(v.id).id}`}>Open</a>
                    : <button className="btn sm primary" onClick={() => addVenue(v)}><Plus size={14} /> Add to my options</button>}
                  <button className="btn sm ghost" onClick={() => setOpenId(v.id)}>Details</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {open && <VenueDetail row={open} guests={guests} target={target} added={added.get(open.v.id)} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function VenuePhoto({ v }) {
  if (!v.image) return <div className="venue-placeholder"><span>{VENUE_TYPES[v.type].emoji}</span></div>;
  return (
    <>
      <Photo url={v.image.url} alt={v.name} fallback={<div className="venue-placeholder"><span>{VENUE_TYPES[v.type].emoji}</span></div>} />
      <span className="photo-credit">Photo: {v.image.credit}</span>
    </>
  );
}

async function addVenue(v) {
  const city = TORONTO;
  const vendor = newVendor({
    category: 'venue', name: v.name, website: v.website, location: `${v.area}, ${city.label}`, summary: v.summary,
    startingPrice: v.price.text, imageUrl: v.image ? v.image.url : null, tags: v.styles, directoryId: v.id,
    details: [
      { label: 'Max guests', value: `${v.seated} seated${v.standing ? ` / ${v.standing} standing` : ''}` },
      { label: 'Catering', value: CATERING_LABEL[v.catering] },
      { label: 'Ceremony on site', value: v.ceremony ? 'Yes' : 'No' },
      { label: 'Setting', value: SETTING_LABEL[v.setting] },
      { label: 'Researched price', value: v.price.text },
    ],
    pros: v.highlights.join('\n'),
    cons: v.considerations.join('\n'),
    notes: `Added from Lovebird's ${city.label} venue research (${city.researched}). Prices are estimates: confirm with the venue.`,
  });
  update((s) => { s.vendors.push(vendor); });
  toast(`Added ${v.name} to your venue options`, { label: 'Open', run: () => go(`vendor/${vendor.id}`) });
  // Keep our own copy of the photo when running locally.
  if (v.image) {
    const imageId = await keepPhoto(v.image.url);
    if (imageId) update((s) => { const x = s.vendors.find((y) => y.id === vendor.id); if (x) x.imageId = imageId; });
  }
}

function VenueDetail({ row, guests, target, added, onClose }) {
  const { v, est, fit } = row;
  const city = TORONTO;
  const perGuest = (n) => money(n / guests);
  return (
    <Modal title={v.name} subtitle={`${v.area} · ${VENUE_TYPES[v.type].label} · ${SETTING_LABEL[v.setting]}`} onClose={onClose} wide
      footer={<>
        <a className="btn ghost" href={v.website} target="_blank" rel="noreferrer" style={{ marginRight: 'auto' }}><ExternalLink size={14} /> Venue website</a>
        <button className="btn ghost" onClick={() => { onClose(); openAssistant(`Tell us about ${v.name} in Toronto as a wedding venue for about ${guests} guests. Is it a good fit for our style and budget, and what should we ask them?`); }}><Sparkles size={14} /> Ask your planner</button>
        {added ? <a className="btn primary" href={`#/vendor/${added.id}`} onClick={onClose}>Open in my options</a>
          : <button className="btn primary" onClick={() => { addVenue(v); onClose(); }}><Plus size={15} /> Add to my options</button>}
      </>}>
      <div className="stack">
        <div className="venue-hero"><VenuePhoto v={v} /></div>
        <p className="ink2">{v.summary}</p>
        <div className="grid two">
          <div className="card flat pad stack tight">
            <div className="label">Capacity</div>
            <div>{v.seated} seated{v.standing ? ` · ${v.standing} standing` : ''}{v.minGuests ? ` · minimum about ${v.minGuests}` : ''}</div>
            <div className="label" style={{ marginTop: 6 }}>Catering</div>
            <div>{CATERING_LABEL[v.catering]}{v.ceremony ? ' · ceremony on site' : ''}</div>
          </div>
          <div className="card flat pad stack tight">
            <div className="label">What it costs</div>
            <div>{v.price.text}</div>
            <div className="label" style={{ marginTop: 6 }}>For {guests} guests</div>
            <div>
              <strong className="num">{money(est.allInLow)}–{money(est.allInHigh)}</strong> all-in ({perGuest(est.allInLow)}–{perGuest(est.allInHigh)} per guest)
              {fit && <span className={`chip ${fit.tone}`} style={{ marginLeft: 6 }}>{fit.label}</span>}
            </div>
            <div className="tiny muted">
              {money(est.low)}–{money(est.high)} before {v.price.inclusive ? 'anything else (tax and service included)' : 'tax and service'}.
              {!est.includesCatering && ` Includes about ${money(city.outsideCatering[0])}–${money(city.outsideCatering[1])} per guest for a caterer and bar.`}
              {target ? ` Your budget sets aside ${money(target)} for venue plus food and drink.` : ''}
            </div>
          </div>
        </div>
        <div className="grid two">
          <div><div className="label">Why couples pick it</div><ul className="small ink2" style={{ margin: '6px 0 0', paddingLeft: 18 }}>{v.highlights.map((h) => <li key={h}>{h}</li>)}</ul></div>
          <div><div className="label">Good to know</div><ul className="small ink2" style={{ margin: '6px 0 0', paddingLeft: 18 }}>{v.considerations.map((h) => <li key={h}>{h}</li>)}</ul></div>
        </div>
        <div className="row wrap" style={{ gap: 5 }}>{v.styles.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        <div className="tiny muted">
          Sources: {v.sources.map((s, i) => <span key={s.url}>{i ? ' · ' : ''}<a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></span>)}.
          {v.image && <> Photo: {v.image.creditUrl ? <a href={v.image.creditUrl} target="_blank" rel="noreferrer">{v.image.credit}</a> : v.image.credit}.</>} Researched {city.researched}.
        </div>
      </div>
    </Modal>
  );
}

export function cityHasDirectory() {
  return TORONTO.match.test(getState().wedding.city || '');
}
