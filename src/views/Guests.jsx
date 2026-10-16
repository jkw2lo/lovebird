import { useMemo, useState, Fragment } from 'react';
import { Plus, Download, Upload, Search, Trash2, X, UserPlus, Send } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { guestStats, sideLabel } from '../lib/derive.js';
import { newGuest, parseGuestLines, guestsFromCsv, guestsToCsv } from '../lib/guests.js';
import { fullName, plural, download, dayString, today } from '../lib/util.js';
import { PageHead, Modal, Drawer, Field, Text, Segmented, Empty, toast } from '../components/ui.jsx';

export const RSVP = [
  { key: 'not_sent', label: 'Not invited yet' },
  { key: 'pending', label: 'Awaiting reply' },
  { key: 'yes', label: 'Attending' },
  { key: 'no', label: 'Declined' },
];
const RSVP_CHIP = { not_sent: '', pending: 'gold', yes: 'green', no: 'danger' };
export const GROUPS = ['Family', 'Friends', 'Work', 'Family friends', 'Plus-ones'];

function setGuest(id, patch) {
  update((s) => { const g = s.guests.find((x) => x.id === id); if (g) Object.assign(g, patch); });
}

export default function Guests() {
  const state = useAppState();
  const stats = guestStats(state);
  const [q, setQ] = useState('');
  const [rsvp, setRsvp] = useState('all');
  const [side, setSide] = useState('all');
  const [list, setList] = useState('all');
  const [byParty, setByParty] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const groups = useMemo(() => [...new Set([...GROUPS, ...state.guests.map((g) => g.group).filter(Boolean)])], [state.guests]);
  const meals = useMemo(() => [...new Set(state.guests.map((g) => g.meal).filter(Boolean))], [state.guests]);
  const tables = state.tables;

  const shown = state.guests.filter((g) => {
    if (rsvp !== 'all' && g.rsvp !== rsvp) return false;
    if (side !== 'all' && g.side !== side) return false;
    if (list !== 'all' && (g.list || 'A') !== list) return false;
    if (q) {
      const hay = `${g.first} ${g.last} ${g.party} ${g.group} ${g.email} ${g.notes}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  // Keep households together: group by party (or by the person themselves).
  const rows = [];
  if (byParty) {
    const order = [];
    const byKey = new Map();
    for (const g of shown) {
      const key = g.party || (g.plusOneOf ? state.guests.find((x) => x.id === g.plusOneOf)?.party || g.plusOneOf : g.id);
      if (!byKey.has(key)) { byKey.set(key, []); order.push(key); }
      byKey.get(key).push(g);
    }
    for (const key of order) {
      const members = byKey.get(key);
      rows.push({ party: members.length > 1 || members[0].party ? members[0].party || fullName(members[0]) : null, members });
    }
  } else rows.push({ party: null, members: shown });

  const allSelected = shown.length > 0 && shown.every((g) => selected.has(g.id));
  const toggleSel = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulk = (fn, msg) => { update((s) => { for (const g of s.guests) if (selected.has(g.id)) fn(g); }); toast(msg); setSelected(new Set()); };

  return (
    <div className="stack loose">
      <PageHead eyebrow="Guests" title="Guest list" lede="Add households, track who's invited and who's coming, and keep meals and dietary needs in one place. Seat them in Seating.">
        <button className="btn" onClick={() => download(`guest-list-${dayString(today())}.csv`, guestsToCsv(state), 'text/csv')} disabled={!state.guests.length}><Download size={15} /> Export CSV</button>
        <button className="btn primary" onClick={() => setAdding(true)}><Plus size={16} /> Add guests</button>
      </PageHead>

      <section className="grid four">
        <div className="card stat"><div className="k">On the list</div><div className="v num">{stats.total}<small> / {state.wedding.guestEstimate} planned</small></div><div className="s">{stats.aList} A list · {stats.bList} B list{stats.kids ? ` · ${stats.kids} kids` : ''}</div></div>
        <div className="card stat"><div className="k">Invited</div><div className="v num">{stats.invited}</div><div className="s">{stats.pending} awaiting a reply</div></div>
        <div className="card stat"><div className="k">Attending</div><div className="v num" style={{ color: 'var(--accent-2)' }}>{stats.yes}</div><div className="s">{stats.no} declined{stats.dietary ? ` · ${stats.dietary} with dietary needs` : ''}</div></div>
        <div className="card stat"><div className="k">Expected turnout</div><div className="v num">~{stats.expected}</div><div className="s">Confirmed plus about 85% of the rest</div></div>
      </section>

      {Object.keys(stats.meals).length > 0 && (
        <div className="row wrap" style={{ gap: 6 }}><span className="small muted">Meals so far:</span>{Object.entries(stats.meals).map(([m, n]) => <span key={m} className="chip">{m}: {n}</span>)}</div>
      )}

      {state.guests.length === 0 ? (
        <div className="card"><Empty emoji="💌" title="Start your guest list" action={<button className="btn primary" onClick={() => setAdding(true)}><Plus size={16} /> Add guests</button>}>
          Type everyone in at once, one household per line, or import a spreadsheet. Don't worry about addresses or meals yet.
        </Empty></div>
      ) : (
        <section className="card">
          <div className="card-body stack" style={{ paddingTop: 16 }}>
            <div className="row wrap" style={{ gap: 8 }}>
              <div className="row" style={{ flex: '1 1 220px', position: 'relative' }}>
                <Search size={15} className="muted" style={{ position: 'absolute', left: 10 }} />
                <input className="input" style={{ paddingLeft: 32 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guests" />
              </div>
              <select className="select" style={{ width: 'auto' }} value={rsvp} onChange={(e) => setRsvp(e.target.value)} aria-label="RSVP">
                <option value="all">Any RSVP</option>
                {RSVP.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
              <select className="select" style={{ width: 'auto' }} value={side} onChange={(e) => setSide(e.target.value)} aria-label="Side">
                <option value="all">Both sides</option>
                <option value="p1">{sideLabel(state, 'p1')}'s side</option>
                <option value="p2">{sideLabel(state, 'p2')}'s side</option>
                <option value="both">Shared</option>
              </select>
              <Segmented value={list} onChange={setList} options={[{ value: 'all', label: 'All' }, { value: 'A', label: 'A list' }, { value: 'B', label: 'B list' }]} />
              <label className="row small" style={{ gap: 6 }}><input type="checkbox" className="check" checked={byParty} onChange={(e) => setByParty(e.target.checked)} /> Group households</label>
            </div>

            {selected.size > 0 && (
              <div className="row wrap callout" style={{ padding: '8px 12px' }}>
                <strong className="small">{plural(selected.size, 'guest')} selected</strong>
                <button className="btn sm" onClick={() => bulk((g) => { if (g.rsvp === 'not_sent') g.rsvp = 'pending'; }, 'Marked as invited')}><Send size={14} /> Mark invited</button>
                <button className="btn sm" onClick={() => bulk((g) => { g.list = 'A'; }, 'Moved to the A list')}>A list</button>
                <button className="btn sm" onClick={() => bulk((g) => { g.list = 'B'; }, 'Moved to the B list')}>B list</button>
                <select className="select sm" style={{ width: 'auto' }} value="" onChange={(e) => e.target.value && bulk((g) => { g.side = e.target.value; }, 'Side updated')}>
                  <option value="">Set side…</option>
                  <option value="p1">{sideLabel(state, 'p1')}</option><option value="p2">{sideLabel(state, 'p2')}</option><option value="both">Both</option>
                </select>
                <span className="grow" />
                <button className="btn sm danger" onClick={() => { const n = selected.size; update((s) => { s.guests = s.guests.filter((g) => !selected.has(g.id)); }); setSelected(new Set()); toast(`Removed ${plural(n, 'guest')}`); }}><Trash2 size={14} /> Remove</button>
                <button className="btn sm ghost icon" aria-label="Clear selection" onClick={() => setSelected(new Set())}><X size={14} /></button>
              </div>
            )}

            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}><input type="checkbox" className="check" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(shown.map((g) => g.id)))} aria-label="Select all" /></th>
                    <th>Name</th><th className="hide-mobile">Side</th><th className="hide-mobile">Group</th><th>RSVP</th><th className="hide-mobile">Meal</th><th className="hide-mobile">Table</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <Fragment key={i}>
                      {byParty && r.party && r.members.length > 1 && (
                        <tr className="party-row"><td /><td colSpan={6}>{r.party} <span className="muted" style={{ fontWeight: 500 }}>· {r.members.length}</span></td></tr>
                      )}
                      {r.members.map((g) => (
                        <tr key={g.id} className="clickable" onClick={() => setEditing(g.id)}>
                          <td onClick={(e) => e.stopPropagation()}><input type="checkbox" className="check" checked={selected.has(g.id)} onChange={() => toggleSel(g.id)} aria-label={`Select ${fullName(g)}`} /></td>
                          <td>
                            <span style={{ fontWeight: 550 }}>{fullName(g)}</span>
                            {g.list === 'B' && <span className="chip" style={{ marginLeft: 6, padding: '0 7px', fontSize: 11 }}>B</span>}
                            {g.child && <span className="chip" style={{ marginLeft: 6, padding: '0 7px', fontSize: 11 }}>child</span>}
                            {g.dietary && <span className="tiny muted" style={{ marginLeft: 6 }}>· {g.dietary}</span>}
                          </td>
                          <td className="small hide-mobile">{sideLabel(state, g.side)}</td>
                          <td className="small hide-mobile">{g.group}</td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select className={`select sm`} value={g.rsvp} onChange={(e) => setGuest(g.id, { rsvp: e.target.value })} aria-label="RSVP" style={{ background: RSVP_CHIP[g.rsvp] ? `var(--${RSVP_CHIP[g.rsvp] === 'green' ? 'accent-2' : RSVP_CHIP[g.rsvp]}-soft)` : undefined }}>
                              {RSVP.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                            </select>
                          </td>
                          <td className="small hide-mobile">{g.meal}</td>
                          <td className="small hide-mobile" onClick={(e) => e.stopPropagation()}>
                            <select className="select sm" value={g.tableId || ''} onChange={(e) => setGuest(g.id, { tableId: e.target.value || null })} aria-label="Table" disabled={!tables.length}>
                              <option value="">{tables.length ? '—' : 'No tables'}</option>
                              {tables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {shown.length === 0 && <p className="muted small" style={{ textAlign: 'center', padding: 20 }}>No guests match those filters.</p>}
          </div>
        </section>
      )}

      {adding && <AddGuestsModal state={state} groups={groups} onClose={() => setAdding(false)} />}
      {editing && <GuestDrawer id={editing} state={state} groups={groups} meals={meals} onClose={() => setEditing(null)} />}
    </div>
  );
}

function AddGuestsModal({ state, groups, onClose }) {
  const [mode, setMode] = useState('list');
  const [text, setText] = useState('');
  const [side, setSide] = useState('both');
  const [group, setGroup] = useState('');
  const [listTier, setListTier] = useState('A');
  const [csvGuests, setCsvGuests] = useState(null);
  const [error, setError] = useState('');
  const defaults = { side, group, list: listTier };
  const preview = mode === 'list' ? parseGuestLines(text, defaults) : csvGuests || [];

  const pickCsv = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const guests = guestsFromCsv(await file.text(), { p1: state.wedding.partner1, p2: state.wedding.partner2 });
      if (!guests.length) throw new Error("Couldn't find any names. Make sure the first row has column headers like First name, Last name, Email.");
      setCsvGuests(guests);
      setError('');
    } catch (err) { setError(err.message); }
  };

  const save = () => {
    update((s) => { s.guests.push(...preview); });
    toast(`Added ${plural(preview.length, 'guest')}`);
    onClose();
  };

  return (
    <Modal title="Add guests" onClose={onClose} wide
      footer={<><span className="grow small muted">{preview.length ? `${plural(preview.length, 'guest')} ready to add` : ''}</span><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!preview.length} onClick={save}>Add {preview.length || ''}</button></>}>
      <div className="stack">
        <Segmented value={mode} onChange={setMode} options={[{ value: 'list', label: 'Type a list' }, { value: 'csv', label: 'Import a spreadsheet' }]} />
        {mode === 'list' ? (
          <>
            <Field label="One household per line" hint={'"Jane & John Smith" adds two Smiths together. Add "+1" for a plus-one. Commas work too: "Ana Ruiz, Ben Ortiz, Leo".'}>
              <textarea className="textarea" rows={9} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={'Jane & John Smith\nAunt Carol\nPriya Patel +1\nThe Nguyens: Minh, Lan, Bao Nguyen'} />
            </Field>
            <div className="grid three">
              <Field label="Side">
                <select className="select" value={side} onChange={(e) => setSide(e.target.value)}>
                  <option value="p1">{sideLabel(state, 'p1')}</option><option value="p2">{sideLabel(state, 'p2')}</option><option value="both">Both / shared</option>
                </select>
              </Field>
              <Field label="Group">
                <input className="input" list="guest-groups" value={group} onChange={(e) => setGroup(e.target.value)} placeholder="Family, Friends…" />
                <datalist id="guest-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
              </Field>
              <Field label="List"><Segmented value={listTier} onChange={setListTier} options={[{ value: 'A', label: 'A list' }, { value: 'B', label: 'B list' }]} /></Field>
            </div>
          </>
        ) : (
          <div className="stack">
            <p className="ink2 small">Export from Google Sheets, Excel, Zola, The Knot or anywhere else as CSV. Lovebird recognizes columns like First name, Last name, Name, Household, Email, Phone, Address, Side, Group, RSVP, Meal and Dietary.</p>
            <label className="btn" style={{ alignSelf: 'flex-start' }}><Upload size={15} /> Choose CSV file…<input type="file" accept=".csv,text/csv" hidden onChange={pickCsv} /></label>
            {error && <p className="small" style={{ color: 'var(--danger)' }}>{error}</p>}
          </div>
        )}
        {preview.length > 0 && (
          <div className="row wrap" style={{ gap: 5, maxHeight: 120, overflow: 'auto' }}>
            {preview.slice(0, 60).map((g) => <span key={g.id} className="chip">{fullName(g)}</span>)}
            {preview.length > 60 && <span className="chip">+{preview.length - 60} more</span>}
          </div>
        )}
      </div>
    </Modal>
  );
}

function GuestDrawer({ id, state, groups, meals, onClose }) {
  const g = state.guests.find((x) => x.id === id);
  if (!g) return null;
  const set = (patch) => setGuest(g.id, patch);
  const plusOne = state.guests.find((x) => x.plusOneOf === g.id);
  const household = g.party ? state.guests.filter((x) => x.party === g.party && x.id !== g.id) : [];

  return (
    <Drawer onClose={onClose} label="Guest details">
      <div className="modal-head" style={{ paddingBottom: 10 }}>
        <div><h2>{fullName(g)}</h2>{g.party && <p className="small muted">{g.party}</p>}</div>
        <button className="btn ghost icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
      </div>
      <div className="stack" style={{ padding: '4px 22px 22px', overflowY: 'auto', flex: 1 }}>
        <div className="grid two">
          <Field label="First name"><Text value={g.first} onChange={(first) => set({ first })} /></Field>
          <Field label="Last name"><Text value={g.last} onChange={(last) => set({ last })} /></Field>
        </div>
        <Field label="Household / party" hint="Guests with the same household are invited and seated together.">
          <Text value={g.party} onChange={(party) => set({ party })} placeholder="e.g. The Smith family" />
        </Field>
        <Field label="RSVP">
          <select className="select" value={g.rsvp} onChange={(e) => set({ rsvp: e.target.value })}>{RSVP.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</select>
        </Field>
        <div className="grid two">
          <Field label="Side">
            <select className="select" value={g.side} onChange={(e) => set({ side: e.target.value })}>
              <option value="p1">{sideLabel(state, 'p1')}</option><option value="p2">{sideLabel(state, 'p2')}</option><option value="both">Both</option>
            </select>
          </Field>
          <Field label="Group">
            <Text value={g.group} onChange={(group) => set({ group })} list="drawer-groups" />
            <datalist id="drawer-groups">{groups.map((x) => <option key={x} value={x} />)}</datalist>
          </Field>
          <Field label="List"><Segmented value={g.list || 'A'} onChange={(list) => set({ list })} options={[{ value: 'A', label: 'A list' }, { value: 'B', label: 'B list' }]} /></Field>
          <Field label="Table">
            <select className="select" value={g.tableId || ''} onChange={(e) => set({ tableId: e.target.value || null })}>
              <option value="">Not seated</option>{state.tables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid two">
          <Field label="Meal"><Text value={g.meal} onChange={(meal) => set({ meal })} list="drawer-meals" placeholder="e.g. Fish" /><datalist id="drawer-meals">{meals.map((m) => <option key={m} value={m} />)}</datalist></Field>
          <Field label="Dietary needs"><Text value={g.dietary} onChange={(dietary) => set({ dietary })} placeholder="e.g. Nut allergy" /></Field>
        </div>
        <label className="row small"><input type="checkbox" className="check" checked={!!g.child} onChange={(e) => set({ child: e.target.checked })} /> Child</label>
        <div className="divider" style={{ margin: '2px 0' }} />
        <Field label="Email"><Text type="email" value={g.email} onChange={(email) => set({ email })} /></Field>
        <Field label="Phone"><Text type="tel" value={g.phone} onChange={(phone) => set({ phone })} /></Field>
        <Field label="Mailing address"><Text multiline className="textarea" rows={2} value={g.address} onChange={(address) => set({ address })} /></Field>
        <div className="divider" style={{ margin: '2px 0' }} />
        <Field label="Gift received"><Text value={g.gift} onChange={(gift) => set({ gift })} placeholder="For thank-you notes" /></Field>
        <label className="row small"><input type="checkbox" className="check" checked={!!g.thanked} onChange={(e) => set({ thanked: e.target.checked })} /> Thank-you note sent</label>
        <Field label="Notes"><Text multiline className="textarea" rows={2} value={g.notes} onChange={(notes) => set({ notes })} /></Field>

        {household.length > 0 && <p className="small muted">Also in this household: {household.map(fullName).join(', ')}</p>}
        <div className="row wrap">
          {!plusOne && !g.plusOneOf && (
            <button className="btn sm" onClick={() => update((s) => { const party = g.party || fullName(g); s.guests.find((x) => x.id === g.id).party = party; s.guests.push(newGuest({ first: 'Guest of', last: g.first, party, side: g.side, group: g.group, list: g.list, rsvp: g.rsvp, plusOneOf: g.id })); })}>
              <UserPlus size={14} /> Give a plus-one
            </button>
          )}
          <span className="grow" />
          <button className="btn sm danger" onClick={() => { const snap = { ...g }; update((s) => { s.guests = s.guests.filter((x) => x.id !== g.id); }); onClose(); toast(`Removed ${fullName(g)}`, { label: 'Undo', run: () => update((s) => { s.guests.push(snap); }) }); }}><Trash2 size={14} /> Remove</button>
        </div>
      </div>
    </Drawer>
  );
}
