import { useRef, useState } from 'react';
import { Plus, Wand2, Printer, Trash2, X, Search, AlertTriangle, Circle, RectangleHorizontal } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { seatableGuests, sideLabel } from '../lib/derive.js';
import { fullName, initials, newId, plural } from '../lib/util.js';
import { PageHead, Empty, Field, Text, Segmented, toast } from '../components/ui.jsx';

const SIDE_COLOR = { p1: 'av-0', p2: 'av-3', both: 'av-1' };
const SEAT_GAP = 22;

function tableSize(t) {
  if (t.shape === 'rect') {
    const perSide = Math.ceil(t.seats / 2);
    return { w: Math.max(130, perSide * 34 + 20), h: 64 };
  }
  const d = Math.max(84, 56 + t.seats * 6);
  return { w: d, h: d };
}

// Seat positions relative to the table's top-left corner (including the seat ring margin).
function seatPositions(t) {
  const { w, h } = tableSize(t);
  const m = SEAT_GAP;
  if (t.shape === 'rect') {
    const perSide = Math.ceil(t.seats / 2);
    const out = [];
    for (let i = 0; i < t.seats; i++) {
      const top = i < perSide;
      const idx = top ? i : i - perSide;
      const count = top ? perSide : t.seats - perSide;
      out.push({ x: m + (w / (count + 1)) * (idx + 1), y: top ? m - 13 : m + h + 13 });
    }
    return out;
  }
  const r = w / 2 + 14;
  return Array.from({ length: t.seats }, (_, i) => {
    const a = (i / t.seats) * Math.PI * 2 - Math.PI / 2;
    return { x: m + w / 2 + r * Math.cos(a), y: m + h / 2 + r * Math.sin(a) };
  });
}

function nextSpot(tables) {
  const i = tables.length;
  return { x: 30 + (i % 6) * 215, y: 30 + Math.floor(i / 6) * 200 };
}

function partyKey(g) {
  return g.party || g.plusOneOf || g.id;
}

export default function Seating() {
  const state = useAppState();
  const [selectedTable, setSelectedTable] = useState(null);
  const [picked, setPicked] = useState(new Set());
  const [q, setQ] = useState('');
  const [dropTarget, setDropTarget] = useState(null);

  const tableIds = new Set(state.tables.map((t) => t.id));
  const guests = seatableGuests(state);
  const unseated = guests.filter((g) => !g.tableId || !tableIds.has(g.tableId));
  const seatedCount = guests.length - unseated.length;
  const filtered = q ? unseated.filter((g) => `${g.first} ${g.last} ${g.party}`.toLowerCase().includes(q.toLowerCase())) : unseated;

  // Households split across tables.
  const splits = [];
  const byParty = new Map();
  for (const g of guests) if (g.party && g.tableId && tableIds.has(g.tableId)) {
    if (!byParty.has(g.party)) byParty.set(g.party, new Set());
    byParty.get(g.party).add(g.tableId);
  }
  for (const [party, set] of byParty) if (set.size > 1) splits.push(party);

  const addTable = (shape) => {
    const t = { id: newId('tb_'), name: `Table ${state.tables.length + 1}`, shape, seats: shape === 'rect' ? 10 : 8, ...nextSpot(state.tables) };
    update((s) => { s.tables.push(t); });
    setSelectedTable(t.id);
  };

  const seat = (ids, tableId) => {
    update((s) => { for (const g of s.guests) if (ids.includes(g.id)) g.tableId = tableId; });
    setPicked(new Set());
  };

  const autoArrange = () => {
    const parties = new Map();
    for (const g of unseated) {
      const k = partyKey(g);
      if (!parties.has(k)) parties.set(k, []);
      parties.get(k).push(g);
    }
    const list = [...parties.values()].sort((a, b) => `${a[0].side}${a[0].group}`.localeCompare(`${b[0].side}${b[0].group}`) || b.length - a.length);
    let placed = 0;
    update((s) => {
      const occupancy = (tid) => s.guests.filter((g) => g.tableId === tid && g.rsvp !== 'no').length;
      for (const members of list) {
        const groupOf = members[0].group;
        const sideOf = members[0].side;
        let best = null, bestScore = -1;
        for (const t of s.tables) {
          const free = t.seats - occupancy(t.id);
          if (free < members.length) continue;
          const at = s.guests.filter((g) => g.tableId === t.id);
          const score = at.filter((g) => g.group && g.group === groupOf).length * 3 + at.filter((g) => g.side === sideOf).length + (at.length ? 0.5 : 0);
          if (score > bestScore) { best = t; bestScore = score; }
        }
        if (!best) {
          best = { id: newId('tb_'), name: `Table ${s.tables.length + 1}`, shape: 'round', seats: Math.max(8, members.length), ...nextSpot(s.tables) };
          s.tables.push(best);
        }
        for (const m of members) { s.guests.find((g) => g.id === m.id).tableId = best.id; placed++; }
      }
    });
    toast(placed ? `Seated ${plural(placed, 'guest')}. Households are kept together; drag anyone to adjust.` : 'Everyone already has a seat.');
  };

  const onDragStartGuests = (e, ids) => {
    e.dataTransfer.setData('text/plain', ids.join(','));
    e.dataTransfer.effectAllowed = 'move';
  };
  const readDrop = (e) => (e.dataTransfer.getData('text/plain') || '').split(',').filter(Boolean);

  const sel = state.tables.find((t) => t.id === selectedTable);

  // Group the unseated list by household.
  const groups = [];
  const seen = new Map();
  for (const g of filtered) {
    const k = partyKey(g);
    if (!seen.has(k)) { seen.set(k, { key: k, label: g.party, members: [] }); groups.push(seen.get(k)); }
    seen.get(k).members.push(g);
  }

  if (!state.guests.length) {
    return (
      <div>
        <PageHead eyebrow="Seating" title="Seating chart" />
        <div className="card"><Empty emoji="🪑" title="Add guests first" action={<a className="btn primary" href="#/guests">Go to guest list</a>}>The seating chart uses your guest list. Most couples do this about two weeks out, once RSVPs are in.</Empty></div>
      </div>
    );
  }

  return (
    <div className="stack">
      <PageHead eyebrow="Seating" title="Seating chart" lede={`${seatedCount} of ${guests.length} guests seated at ${plural(state.tables.length, 'table')}. Drag a guest, or a whole household, onto a table. On a phone, tap guests and then tap a table.`}>
        <button className="btn" onClick={() => addTable('round')}><Circle size={15} /> Round table</button>
        <button className="btn" onClick={() => addTable('rect')}><RectangleHorizontal size={15} /> Long table</button>
        <button className="btn" onClick={autoArrange} disabled={!unseated.length}><Wand2 size={15} /> Seat everyone</button>
        <button className="btn" onClick={() => window.print()} disabled={!state.tables.length}><Printer size={15} /> Print</button>
      </PageHead>

      {splits.length > 0 && (
        <div className="callout no-print" style={{ padding: '10px 14px' }}><AlertTriangle size={17} /><span>Split across tables: {splits.join(', ')}. That's fine if it's on purpose.</span></div>
      )}

      <div className="seating no-print">
        <div className="stack">
          {sel && <TablePanel table={sel} state={state} onClose={() => setSelectedTable(null)} />}
          <div className="card seat-list"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); seat(readDrop(e), null); }}>
            <div style={{ padding: '14px 14px 8px' }} className="stack tight">
              <div className="row between"><h3>Needs a seat</h3><span className="chip">{unseated.length}</span></div>
              {unseated.length > 8 && (
                <div className="row" style={{ position: 'relative' }}>
                  <Search size={14} className="muted" style={{ position: 'absolute', left: 9 }} />
                  <input className="input sm" style={{ paddingLeft: 28 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a guest" />
                </div>
              )}
              {picked.size > 0 && <div className="tiny" style={{ color: 'var(--accent)' }}>{plural(picked.size, 'guest')} picked. Tap a table to seat them. <button className="btn sm ghost" onClick={() => setPicked(new Set())}>Clear</button></div>}
            </div>
            <div className="list">
              {unseated.length === 0 && <p className="small muted" style={{ padding: 8 }}>Everyone has a seat. 🎉</p>}
              {groups.map((grp) => (
                <div key={grp.key}>
                  {grp.members.length > 1 && (
                    <div className="party-head" draggable onDragStart={(e) => onDragStartGuests(e, grp.members.map((m) => m.id))}
                      onClick={() => setPicked((p) => { const n = new Set(p); const all = grp.members.every((m) => n.has(m.id)); grp.members.forEach((m) => (all ? n.delete(m.id) : n.add(m.id))); return n; })}>
                      {grp.label || 'Household'} · {grp.members.length}
                    </div>
                  )}
                  {grp.members.map((g) => (
                    <div key={g.id} className="guest-pill" draggable onDragStart={(e) => onDragStartGuests(e, [g.id])}
                      onClick={() => setPicked((p) => { const n = new Set(p); n.has(g.id) ? n.delete(g.id) : n.add(g.id); return n; })}
                      style={picked.has(g.id) ? { background: 'var(--accent-soft)' } : null}>
                      <span className={`av ${SIDE_COLOR[g.side]}`}>{initials(g)}</span>
                      <span className="grow ellipsis">{fullName(g)}</span>
                      {g.rsvp === 'yes' ? null : <span className="tiny muted">{g.rsvp === 'pending' ? 'no reply' : 'not invited'}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="tiny muted" style={{ padding: '8px 14px 12px', borderTop: '1px solid var(--line)' }}>
              <span className="row" style={{ gap: 10 }}>
                <span className="row" style={{ gap: 4 }}><span className="av av-0" style={{ width: 10, height: 10, borderRadius: 5, display: 'inline-block' }} /> {sideLabel(state, 'p1')}</span>
                <span className="row" style={{ gap: 4 }}><span className="av av-3" style={{ width: 10, height: 10, borderRadius: 5, display: 'inline-block' }} /> {sideLabel(state, 'p2')}</span>
                <span className="row" style={{ gap: 4 }}><span className="av av-1" style={{ width: 10, height: 10, borderRadius: 5, display: 'inline-block' }} /> Both</span>
              </span>
            </div>
          </div>
        </div>

        <div className="canvas" onClick={(e) => { if (e.target.classList.contains('canvas-inner')) setSelectedTable(null); }}>
          <div className="canvas-inner">
            {state.tables.length === 0 && (
              <div style={{ position: 'absolute', left: 40, top: 40, maxWidth: 380 }} className="stack">
                <h3>No tables yet</h3>
                <p className="ink2 small">Add tables one at a time, or press <strong>Seat everyone</strong> and Lovebird will create tables of eight and seat households together, grouped by side and circle. Then drag people around.</p>
              </div>
            )}
            {state.tables.map((t) => (
              <TableShape key={t.id} table={t} state={state} selected={t.id === selectedTable} drop={dropTarget === t.id}
                onSelect={() => { if (picked.size) seat([...picked], t.id); setSelectedTable(t.id); }}
                onDragOver={(e) => { e.preventDefault(); setDropTarget(t.id); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e) => { e.preventDefault(); setDropTarget(null); seat(readDrop(e), t.id); }} />
            ))}
          </div>
        </div>
      </div>

      <PrintView state={state} />
    </div>
  );
}

function TableShape({ table: t, state, selected, drop, onSelect, onDragOver, onDragLeave, onDrop }) {
  const { w, h } = tableSize(t);
  const seats = seatPositions(t);
  const at = state.guests.filter((g) => g.tableId === t.id && g.rsvp !== 'no');
  const drag = useRef(null);

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    drag.current = { sx: e.clientX, sy: e.clientY, x: t.x, y: t.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
    d.moved = true;
    update((s) => { const tb = s.tables.find((x) => x.id === t.id); tb.x = Math.max(0, Math.round(d.x + dx)); tb.y = Math.max(0, Math.round(d.y + dy)); });
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) onSelect();
  };

  return (
    <div className={`tbl ${t.shape} ${selected ? 'selected' : ''} ${drop ? 'drop' : ''} ${at.length === t.seats ? 'full' : ''} ${at.length > t.seats ? 'over' : ''}`}
      style={{ left: t.x, top: t.y, width: w + SEAT_GAP * 2, height: h + SEAT_GAP * 2 }}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className="top" style={{ width: w, height: h }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} role="button" tabIndex={0} aria-label={`${t.name}, ${at.length} of ${t.seats} seats`} onKeyDown={(e) => e.key === 'Enter' && onSelect()}>
        <div>
          <div className="tname">{t.name}</div>
          <div className={`tcount ${at.length > t.seats ? '' : ''}`} style={at.length > t.seats ? { color: 'var(--danger)', fontWeight: 650 } : null}>{at.length}/{t.seats}</div>
        </div>
      </div>
      {seats.map((p, i) => {
        const g = at[i];
        return <span key={i} className={`seat ${g ? `filled ${SIDE_COLOR[g.side]}` : ''}`} style={{ left: p.x, top: p.y }} title={g ? fullName(g) : 'Empty seat'}>{g ? initials(g) : ''}</span>;
      })}
    </div>
  );
}

function TablePanel({ table: t, state, onClose }) {
  const at = state.guests.filter((g) => g.tableId === t.id);
  const set = (patch) => update((s) => { Object.assign(s.tables.find((x) => x.id === t.id), patch); });
  return (
    <div className="card pad stack">
      <div className="row between">
        <Text className="input bare" style={{ fontFamily: 'var(--serif)', fontSize: 19 }} value={t.name} onChange={(name) => set({ name })} aria-label="Table name" />
        <button className="btn ghost icon sm" onClick={onClose} aria-label="Close"><X size={16} /></button>
      </div>
      <div className="row">
        <Field label="Seats"><input type="number" className="input sm" style={{ width: 70 }} min={1} max={30} value={t.seats} onChange={(e) => set({ seats: Math.max(1, Math.min(30, Number(e.target.value) || 1)) })} /></Field>
        <Field label="Shape"><Segmented value={t.shape} onChange={(shape) => set({ shape })} options={[{ value: 'round', label: 'Round' }, { value: 'rect', label: 'Long' }]} /></Field>
      </div>
      <div className="stack tight">
        {at.length === 0 && <p className="small muted">Drag guests here, or onto the table.</p>}
        {at.map((g) => (
          <div key={g.id} className="row small" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', g.id)} style={{ cursor: 'grab' }}>
            <span className={`av ${SIDE_COLOR[g.side]}`} style={{ width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>{initials(g)}</span>
            <span className="grow">{fullName(g)}{g.rsvp === 'no' ? <span className="muted"> (declined)</span> : ''}</span>
            {g.dietary && <span className="tiny muted">{g.dietary}</span>}
            <button className="btn ghost icon sm" aria-label={`Unseat ${fullName(g)}`} onClick={() => update((s) => { s.guests.find((x) => x.id === g.id).tableId = null; })}><X size={13} /></button>
          </div>
        ))}
      </div>
      <button className="btn sm ghost danger" style={{ alignSelf: 'flex-start' }} onClick={() => { update((s) => { s.tables = s.tables.filter((x) => x.id !== t.id); for (const g of s.guests) if (g.tableId === t.id) g.tableId = null; }); onClose(); }}><Trash2 size={14} /> Delete table</button>
    </div>
  );
}

function PrintView({ state }) {
  const byTable = state.tables.map((t) => ({ t, guests: state.guests.filter((g) => g.tableId === t.id && g.rsvp !== 'no') }));
  const alpha = state.guests.filter((g) => g.tableId && g.rsvp !== 'no').sort((a, b) => (a.last || a.first).localeCompare(b.last || b.first));
  const tableName = Object.fromEntries(state.tables.map((t) => [t.id, t.name]));
  return (
    <div className="print-only">
      <h1>Seating chart</h1>
      <div style={{ columns: 3, marginTop: 16 }}>
        {byTable.map(({ t, guests }) => (
          <div key={t.id} style={{ breakInside: 'avoid', marginBottom: 14 }}>
            <h3>{t.name}</h3>
            {guests.map((g) => <div key={g.id}>{fullName(g)}{g.meal ? ` — ${g.meal}` : ''}{g.dietary ? ` (${g.dietary})` : ''}</div>)}
          </div>
        ))}
      </div>
      <h2 style={{ marginTop: 24, breakBefore: 'page' }}>Escort cards (A–Z)</h2>
      <div style={{ columns: 3, marginTop: 10 }}>
        {alpha.map((g) => <div key={g.id}>{g.last ? `${g.last}, ${g.first}` : g.first} — {tableName[g.tableId]}</div>)}
      </div>
    </div>
  );
}
