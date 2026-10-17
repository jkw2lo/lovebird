import { useState } from 'react';
import { Heart, Check, ExternalLink, Sparkles, ArrowRight } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { EXTRAS, EXTRA_GROUPS, extraEstimate } from '../data/extras.js';
import { newVendor } from '../lib/magpie.js';
import { money } from '../lib/util.js';
import { PageHead, go, toast } from '../components/ui.jsx';
import { openAssistant } from '../components/Assistant.jsx';

// Ideas for the extras that make a wedding feel like yours: food stations,
// games, keepsakes and traditions. Picking one adds it as a vendor so you can
// get quotes, compare and book it like anything else.

const k = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : `$${Math.round(n)}`);

export default function Extras() {
  const state = useAppState();
  const [group, setGroup] = useState('all');
  const guests = state.wedding.guestEstimate || 100;
  const picked = new Map(state.vendors.filter((v) => v.extraId).map((v) => [v.extraId, v]));
  const shown = EXTRAS.filter((e) => group === 'all' || e.group === group);

  const totals = [...picked.keys()].map((id) => EXTRAS.find((e) => e.id === id)).filter(Boolean).map((e) => extraEstimate(e, guests)).filter(Boolean);
  const low = totals.reduce((s, r) => s + r[0], 0);
  const high = totals.reduce((s, r) => s + r[1], 0);
  const city = state.wedding.city ? state.wedding.city.split(',')[0] : '';

  const add = (e) => {
    const v = newVendor({
      category: 'extras', name: e.name, summary: e.blurb, extraId: e.id,
      startingPrice: e.cost ? e.cost.text : e.costNote || '',
      notes: e.tips.join('\n'),
      details: [{ label: 'Book', value: e.lead }],
    });
    update((s) => { s.vendors.push(v); });
    toast(`Added ${e.name} to your extras`, { label: 'Open', run: () => go(`vendor/${v.id}`) });
  };
  const remove = (e) => {
    const v = picked.get(e.id);
    if (v.status === 'booked' || v.quotes.length) { go(`vendor/${v.id}`); return; }
    update((s) => { s.vendors = s.vendors.filter((x) => x.id !== v.id); });
    toast(`Removed ${e.name}`);
  };

  return (
    <div className="stack loose">
      <PageHead eyebrow="Extras & experiences" title="The things guests remember"
        lede="Food stations, games, keepsakes and traditions. Pick the ones that feel like you: each becomes a vendor you can get quotes for, compare and book.">
        <button className="btn ghost" onClick={() => openAssistant(`Suggest two or three extras or experiences that would suit our wedding (our style and priorities are in the plan) for about ${guests} guests, and roughly what they'd cost.`)}><Sparkles size={15} /> Ask your planner</button>
      </PageHead>

      <section className="card pad row wrap" style={{ gap: 16 }}>
        <div className="grow" style={{ minWidth: 220 }}>
          <div style={{ fontWeight: 650 }}>{picked.size ? `${picked.size} extra${picked.size === 1 ? '' : 's'} picked` : 'Nothing picked yet'}</div>
          <div className="small muted">
            {totals.length ? <>Roughly {money(low)}–{money(high)} for {guests} guests{totals.length < picked.size ? ' (plus a few that depend on what you choose)' : ''}. Costs are mostly Toronto prices; budget a little more in New York.</> : 'Tap the heart on anything you like. Estimates use your guest count.'}
          </div>
        </div>
        {picked.size > 0 && <a className="btn" href="#/vendors/extras">See them in Vendors <ArrowRight size={14} /></a>}
      </section>

      <div className="row wrap" style={{ gap: 6 }}>
        <button className={`chip ${group === 'all' ? 'on' : ''}`} onClick={() => setGroup('all')}>All · {EXTRAS.length}</button>
        {EXTRA_GROUPS.map((g) => <button key={g.key} className={`chip ${group === g.key ? 'on' : ''}`} onClick={() => setGroup(g.key)}>{g.emoji} {g.label}</button>)}
      </div>

      <div className="grid auto">
        {shown.map((e) => {
          const est = extraEstimate(e, guests);
          const v = picked.get(e.id);
          return (
            <article key={e.id} className={`card extra-card ${v ? 'picked' : ''}`}>
              <div className="row between top">
                <span className="extra-emoji" aria-hidden>{e.emoji}</span>
                <button className={`btn icon ${v ? 'primary' : 'ghost'}`} aria-pressed={!!v} aria-label={v ? `Remove ${e.name}` : `Add ${e.name}`} title={v ? 'In your extras' : 'Add to my extras'} onClick={() => (v ? remove(e) : add(e))}>
                  {v ? <Check size={17} /> : <Heart size={17} />}
                </button>
              </div>
              <h3>{e.name}</h3>
              <p className="small ink2">{e.blurb}</p>
              <div className="extra-cost">
                {est ? <span className="num" style={{ fontWeight: 650 }}>≈ {k(est[0])}–{k(est[1])}</span> : <span className="small muted">Cost depends</span>}
                <span className="chip">{e.lead}</span>
              </div>
              <p className="tiny muted">{e.cost ? e.cost.text : e.costNote}</p>
              {e.tips[0] && <p className="tiny ink2">💡 {e.tips[0]}</p>}
              <div className="row wrap" style={{ gap: 6, marginTop: 'auto' }}>
                {v && <a className="btn sm" href={`#/vendor/${v.id}`}>Open</a>}
                {e.search && (
                  <a className="btn sm ghost" target="_blank" rel="noreferrer" href={`https://www.google.com/search?q=${encodeURIComponent(`${e.search} ${city}`.trim())}`}>
                    <ExternalLink size={13} /> Find vendors{city ? ` in ${city}` : ''}
                  </a>
                )}
              </div>
              {e.sources.length > 0 && (
                <div className="tiny muted">Sources: {e.sources.map((s, i) => <span key={s.url}>{i ? ' · ' : ''}<a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></span>)}</div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
