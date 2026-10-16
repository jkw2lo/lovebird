import { Plus, Trash2, Printer, Sparkles, Wand2 } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { DAYOF_TEMPLATE } from '../data/dayof.js';
import { CATEGORY_BY_KEY } from '../data/categories.js';
import { newId, fmtDate, fmtTime } from '../lib/util.js';
import { PageHead, Text, Empty } from '../components/ui.jsx';
import { openAssistant } from '../components/Assistant.jsx';

export default function DayOf() {
  const state = useAppState();
  const rows = [...state.dayof].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));
  const set = (id, patch) => update((s) => { Object.assign(s.dayof.find((r) => r.id === id), patch); });
  const contacts = state.vendors.filter((v) => v.status === 'booked');

  const add = () => {
    const last = rows[rows.length - 1];
    let time = '17:00';
    if (last && last.time) {
      const [h, m] = last.time.split(':').map(Number);
      const t = h * 60 + m + 30;
      time = `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    }
    update((s) => { s.dayof.push({ id: newId('d_'), time, title: '', who: '', notes: '' }); });
  };

  return (
    <div className="stack loose">
      <PageHead eyebrow="Day-of" title="The day, hour by hour" lede={`${state.wedding.date ? fmtDate(state.wedding.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + '. ' : ''}Share this with your vendors, your wedding party and whoever is running the day, so everyone knows where to be.`}>
        <button className="btn ghost" onClick={() => openAssistant('Look over our day-of timeline. Is anything too tight or missing?')} disabled={!rows.length}><Sparkles size={15} /> Check it with your planner</button>
        <button className="btn" onClick={() => window.print()} disabled={!rows.length}><Printer size={15} /> Print</button>
        <button className="btn primary" onClick={add}><Plus size={16} /> Add</button>
      </PageHead>

      {rows.length === 0 ? (
        <div className="card">
          <Empty emoji="🕰️" title="Start with a typical day" action={
            <div className="row" style={{ justifyContent: 'center' }}>
              <button className="btn primary" onClick={() => update((s) => { s.dayof = DAYOF_TEMPLATE.map((r) => ({ id: newId('d_'), notes: '', ...r })); })}><Wand2 size={15} /> Use the template</button>
              <button className="btn" onClick={add}>Start blank</button>
            </div>
          }>The template is built around a 5pm ceremony with a first look. Shift the times to fit your day.</Empty>
        </div>
      ) : (
        <section className="timeline">
          {rows.map((r) => (
            <div key={r.id} className="tl-row">
              <div style={{ paddingTop: 6 }}>
                <input type="time" className="input sm" value={r.time} onChange={(e) => set(r.id, { time: e.target.value })} aria-label="Time" />
                <div className="tiny muted print-only">{fmtTime(r.time)}</div>
              </div>
              <span className="dot" />
              <div className="tl-card">
                <div className="stack tight">
                  <Text className="input bare" style={{ fontWeight: 600, padding: '2px 0' }} value={r.title} onChange={(title) => set(r.id, { title })} placeholder="What happens" />
                  <Text className="input bare small" style={{ padding: 0 }} value={r.notes} onChange={(notes) => set(r.id, { notes })} placeholder="Notes, location…" />
                </div>
                <Text className="input sm" value={r.who} onChange={(who) => set(r.id, { who })} placeholder="Who" />
                <button className="btn ghost icon sm no-print" aria-label="Delete" onClick={() => update((s) => { s.dayof = s.dayof.filter((x) => x.id !== r.id); })}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="card">
        <div className="card-head"><h2>Day-of contacts</h2></div>
        <div className="card-body">
          {contacts.length === 0 ? <p className="small muted">Your booked vendors will show up here with their contact details, ready to print.</p> : (
            <table className="data">
              <thead><tr><th>Vendor</th><th>Contact</th><th>Phone</th><th className="hide-mobile">Email</th></tr></thead>
              <tbody>
                {contacts.map((v) => (
                  <tr key={v.id}>
                    <td><a href={`#/vendor/${v.id}`}>{CATEGORY_BY_KEY[v.category].emoji} {v.name}</a></td>
                    <td className="small">{v.contactName}</td>
                    <td className="small nowrap">{v.phone ? <a href={`tel:${v.phone}`}>{v.phone}</a> : <span className="muted">add on their page</span>}</td>
                    <td className="small hide-mobile">{v.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
