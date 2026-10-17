import { useState } from 'react';
import { Heart, Check, ExternalLink, Sparkles, ArrowRight, Hammer } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { EXTRAS, EXTRA_GROUPS, HOBBIES, extraEstimate } from '../data/extras.js';
import { newVendor } from '../lib/magpie.js';
import { money, newId } from '../lib/util.js';
import { PageHead, go, toast } from '../components/ui.jsx';
import { openAssistant } from '../components/Assistant.jsx';

// Ideas for the extras that make a wedding feel like yours: food stations,
// games, keepsakes, traditions, and ideas built around your hobbies.
// Things you hire become vendors (quotes, compare, book); things you make
// yourself become a dated step in your plan.

const k = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : `$${Math.round(n)}`);

export default function Extras() {
  const state = useAppState();
  const [group, setGroup] = useState('all');
  const guests = state.wedding.guestEstimate || 100;
  const hobbies = state.wedding.hobbies || [];
  const city = state.wedding.city ? state.wedding.city.split(',')[0] : '';

  // What you've picked: vendors for hired extras, plan steps for DIY ones.
  const pickedVendors = new Map(state.vendors.filter((v) => v.extraId).map((v) => [v.extraId, v]));
  const pickedTasks = new Map(state.customTasks.filter((t) => t.extraId).map((t) => [t.extraId, t]));
  const isPicked = (id) => pickedVendors.has(id) || pickedTasks.has(id);

  // Hobby ideas show only for the hobbies you've chosen (all of them if none chosen yet).
  const matchesHobbies = (e) => !e.hobbies || !hobbies.length || e.hobbies.some((h) => hobbies.includes(h));
  const shown = EXTRAS.filter((e) => (group === 'all' || e.group === group) && matchesHobbies(e));
  const groups = EXTRA_GROUPS.filter((g) => EXTRAS.some((e) => e.group === g.key && matchesHobbies(e)));

  const pickedIdeas = EXTRAS.filter((e) => isPicked(e.id));
  const totals = pickedIdeas.map((e) => extraEstimate(e, guests)).filter(Boolean);
  const low = totals.reduce((s, r) => s + r[0], 0);
  const high = totals.reduce((s, r) => s + r[1], 0);

  const toggleHobby = (key) => update((s) => {
    const cur = s.wedding.hobbies || [];
    s.wedding.hobbies = cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key];
  });

  const add = (e) => {
    if (e.diy) {
      const task = { id: newId('t_'), extraId: e.id, phase: e.diyPhase || 'finish', before: e.diyBefore || 90, title: `Make: ${e.name}`, notes: [e.blurb, ...e.tips].join('\n'), done: false };
      update((s) => { s.customTasks.push(task); });
      toast(`Added "${e.name}" to your plan`, { label: 'Open', run: () => go(`plan/${task.id}`) });
      return;
    }
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
    const t = pickedTasks.get(e.id);
    if (t) {
      if (t.done) { go(`plan/${t.id}`); return; }
      update((s) => { s.customTasks = s.customTasks.filter((x) => x.id !== t.id); });
      toast(`Removed ${e.name}`);
      return;
    }
    const v = pickedVendors.get(e.id);
    if (v.status === 'booked' || v.quotes.length) { go(`vendor/${v.id}`); return; }
    update((s) => { s.vendors = s.vendors.filter((x) => x.id !== v.id); });
    toast(`Removed ${e.name}`);
  };

  const openHref = (e) => (pickedTasks.has(e.id) ? `#/plan/${pickedTasks.get(e.id).id}` : pickedVendors.has(e.id) ? `#/vendor/${pickedVendors.get(e.id).id}` : null);

  return (
    <div className="stack loose">
      <PageHead eyebrow="Extras & experiences" title="The things guests remember"
        lede="Food stations, games, keepsakes, traditions, and ideas built around your hobbies. Things you hire become vendors you can get quotes for; things you make yourself become steps in your plan.">
        <button className="btn ghost" onClick={() => openAssistant(`Suggest two or three extras or experiences that would suit our wedding for about ${guests} guests${hobbies.length ? `, especially ideas that use our hobbies (${hobbies.map((h) => HOBBIES.find((x) => x.key === h)?.label).join(', ')})` : ''}, and roughly what they'd cost.`)}><Sparkles size={15} /> Ask your planner</button>
      </PageHead>

      <section className="card pad stack" style={{ gap: 10 }}>
        <div style={{ fontWeight: 650 }}>Your hobbies</div>
        <p className="small muted" style={{ marginTop: -4 }}>Pick yours and we’ll put ideas built around them first.</p>
        <div className="row wrap" style={{ gap: 6 }}>
          {HOBBIES.map((h) => <button key={h.key} className={`chip ${hobbies.includes(h.key) ? 'on' : ''}`} onClick={() => toggleHobby(h.key)}>{h.emoji} {h.label}</button>)}
        </div>
      </section>

      <section className="card pad row wrap" style={{ gap: 16 }}>
        <div className="grow" style={{ minWidth: 220 }}>
          <div style={{ fontWeight: 650 }}>{pickedIdeas.length ? `${pickedIdeas.length} extra${pickedIdeas.length === 1 ? '' : 's'} picked` : 'Nothing picked yet'}</div>
          <div className="small muted">
            {totals.length ? <>Roughly {money(low)}–{money(high)} for {guests} guests{totals.length < pickedIdeas.length ? ' (plus a few that depend on what you choose)' : ''}. Costs are mostly Toronto prices; budget a little more in New York.</> : 'Tap the heart on anything you like. Estimates use your guest count.'}
          </div>
        </div>
        {pickedVendors.size > 0 && <a className="btn" href="#/vendors/extras">Hired extras in Vendors <ArrowRight size={14} /></a>}
        {pickedTasks.size > 0 && <a className="btn" href="#/plan">DIY steps in your plan <ArrowRight size={14} /></a>}
      </section>

      <div className="row wrap" style={{ gap: 6 }}>
        <button className={`chip ${group === 'all' ? 'on' : ''}`} onClick={() => setGroup('all')}>All</button>
        {groups.map((g) => <button key={g.key} className={`chip ${group === g.key ? 'on' : ''}`} onClick={() => setGroup(g.key)}>{g.emoji} {g.label}</button>)}
      </div>

      {groups.filter((g) => group === 'all' || g.key === group).map((g) => {
        const items = shown.filter((e) => e.group === g.key);
        if (!items.length) return null;
        return (
          <section key={g.key} className="stack">
            <h2 style={{ fontSize: 20 }}>{g.emoji} {g.label}</h2>
            {g.key === 'yours' && !hobbies.length && <p className="small muted" style={{ marginTop: -6 }}>Showing ideas for every hobby. Pick yours above to narrow these down.</p>}
            <div className="grid auto">
              {items.map((e) => {
                const est = extraEstimate(e, guests);
                const picked = isPicked(e.id);
                const href = openHref(e);
                return (
                  <article key={e.id} className={`card extra-card ${picked ? 'picked' : ''}`}>
                    <div className="row between top">
                      <span className="extra-emoji" aria-hidden>{e.emoji}</span>
                      <button className={`btn icon ${picked ? 'primary' : 'ghost'}`} aria-pressed={picked} aria-label={picked ? `Remove ${e.name}` : `Add ${e.name}`} title={picked ? 'Picked' : e.diy ? 'Add to my plan' : 'Add to my extras'} onClick={() => (picked ? remove(e) : add(e))}>
                        {picked ? <Check size={17} /> : <Heart size={17} />}
                      </button>
                    </div>
                    <h3>{e.name}</h3>
                    {(e.diy || e.hobbies) && (
                      <div className="row wrap" style={{ gap: 4 }}>
                        {e.diy && <span className="chip gold"><Hammer size={11} /> You make it</span>}
                        {e.hobbies && e.hobbies.map((h) => { const hb = HOBBIES.find((x) => x.key === h); return <span key={h} className="chip">{hb.emoji} {hb.label}</span>; })}
                      </div>
                    )}
                    <p className="small ink2">{e.blurb}</p>
                    <div className="extra-cost">
                      {est ? <span className="num" style={{ fontWeight: 650 }}>≈ {k(est[0])}{est[1] !== est[0] ? `–${k(est[1])}` : ''}</span> : <span className="small muted">Cost depends</span>}
                      <span className="chip">{e.lead}</span>
                    </div>
                    <p className="tiny muted">{e.cost ? e.cost.text : e.costNote}</p>
                    {e.tips[0] && <p className="tiny ink2">💡 {e.tips[0]}</p>}
                    <div className="row wrap" style={{ gap: 6, marginTop: 'auto' }}>
                      {href && <a className="btn sm" href={href}>{pickedTasks.has(e.id) ? 'Open in plan' : 'Open'}</a>}
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
          </section>
        );
      })}
    </div>
  );
}
