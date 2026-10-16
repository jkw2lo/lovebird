import { useState, useEffect } from 'react';
import { Link2, Plus, Trash2, ExternalLink, Handshake, Pencil, Download, Heart, Search, ImagePlus } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { CATEGORIES, CATEGORY_BY_KEY, guessCategory } from '../data/categories.js';
import { newId, hostOf, plural, normalizeUrl } from '../lib/util.js';
import { saveLink, savePicture } from '../lib/links.js';
import { PageHead, Modal, Field, Text, Photo, Empty, go, toast } from '../components/ui.jsx';
import MagpieImport from '../components/MagpieImport.jsx';
import { newVendor } from '../lib/magpie.js';

export default function Saves({ board }) {
  const state = useAppState();
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toVendor, setToVendor] = useState(null);
  const [q, setQ] = useState('');
  const current = board && state.boards.find((b) => b.id === board) ? board : 'all';

  const saves = state.saves.filter((s) => (current === 'all' || s.boardId === current) && (!q || `${s.title} ${s.notes} ${s.siteName} ${(s.tags || []).join(' ')}`.toLowerCase().includes(q.toLowerCase())));

  const targetBoard = current === 'all' ? state.boards[0].id : current;
  const [dragging, setDragging] = useState(false);

  async function addLink(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    await saveLink(url, targetBoard);
    setBusy(false);
    setUrl('');
    toast('Saved');
  }

  async function addFiles(files) {
    const images = [...files].filter((f) => f.type.startsWith('image/'));
    if (!images.length) return false;
    for (const f of images) await savePicture(f, targetBoard);
    toast(images.length === 1 ? 'Picture saved' : `${images.length} pictures saved`);
    return true;
  }

  // Paste a screenshot or a link anywhere on this page (outside a text box) to save it.
  useEffect(() => {
    const onPaste = async (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (['input', 'textarea'].includes(tag) || document.querySelector('.overlay')) return;
      if (e.clipboardData.files.length && (await addFiles(e.clipboardData.files))) return;
      const text = e.clipboardData.getData('text').trim();
      if (/^(https?:\/\/|www\.)\S+$/i.test(text)) {
        toast('Saving link…');
        await saveLink(normalizeUrl(text), targetBoard);
        toast('Saved');
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  });

  const onDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length && (await addFiles(e.dataTransfer.files))) return;
    const link = (e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain') || '').split('\n')[0].trim();
    if (/^https?:\/\//i.test(link)) { toast('Saving link…'); await saveLink(link, targetBoard); toast('Saved'); }
  };

  const addBoard = () => {
    const name = window.prompt('Name the new board (e.g. Florals, Dresses, Honeymoon)');
    if (!name || !name.trim()) return;
    const b = { id: newId('b_'), name: name.trim(), emoji: '📌' };
    update((s) => { s.boards.push(b); });
    go(`saves/${b.id}`);
  };

  return (
    <div className="stack" onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }} onDrop={onDrop} style={{ position: 'relative' }}>
      {dragging && <div className="drop-zone" onDragLeave={() => setDragging(false)}>Drop to save it here</div>}
      <PageHead eyebrow="Saves" title="Links & inspiration" lede="Everything you find while planning: ideas, dresses, decor, the honeymoon. Turn any save into a vendor option when you're ready to get a quote.">
        <button className="btn" onClick={() => setImporting(true)}><Download size={15} /> Import from Magpie</button>
      </PageHead>

      <form className="add-link" onSubmit={addLink}>
        <Link2 size={18} className="muted" style={{ margin: '0 2px 0 10px', alignSelf: 'center' }} />
        <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a link, or drop a picture or screenshot anywhere here…" aria-label="Link to save" />
        <label className="btn ghost" title="Add pictures from your computer" style={{ alignSelf: 'center' }}><ImagePlus size={16} /><input type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} /></label>
        <button className="btn primary" disabled={busy || !url.trim()}>{busy ? 'Saving…' : 'Save'}</button>
      </form>

      <div className="row wrap" style={{ gap: 6, marginTop: 4 }}>
        <a href="#/saves" className={`chip ${current === 'all' ? 'on' : ''}`} style={{ textDecoration: 'none', ...(current === 'all' ? { background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}) }}>All · {state.saves.length}</a>
        {state.boards.map((b) => {
          const n = state.saves.filter((s) => s.boardId === b.id).length;
          const on = current === b.id;
          return <a key={b.id} href={`#/saves/${b.id}`} className="chip" style={{ textDecoration: 'none', ...(on ? { background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}) }}>{b.emoji} {b.name} · {n}</a>;
        })}
        <button className="chip" onClick={addBoard}><Plus size={12} /> Board</button>
        <span className="grow" />
        {state.saves.length > 8 && (
          <div className="row" style={{ position: 'relative', width: 220 }}>
            <Search size={14} className="muted" style={{ position: 'absolute', left: 9 }} />
            <input className="input sm" style={{ paddingLeft: 28 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search saves" />
          </div>
        )}
      </div>

      {current !== 'all' && <BoardTools board={state.boards.find((b) => b.id === current)} count={saves.length} isOnly={state.boards.length === 1} />}

      {saves.length === 0 ? (
        <div className="card"><Empty emoji="🔖" title={state.saves.length ? 'Nothing on this board yet' : 'Nothing saved yet'} action={!state.saves.length && <button className="btn" onClick={() => setImporting(true)}><Download size={15} /> Import from Magpie</button>}>
          Paste any link above, or drop in pictures and screenshots (Instagram and Pinterest finds included). Lovebird keeps a copy of every photo.
        </Empty></div>
      ) : (
        <div className="masonry">
          {saves.map((s) => (
            <div key={s.id} className="card save-card">
              <a href={s.url || undefined} target="_blank" rel="noreferrer" style={{ display: 'block' }} onClick={(e) => { if (!s.url) { e.preventDefault(); setEditing(s.id); } }}>
                {s.imageId || s.imageUrl ? <Photo imageId={s.imageId} url={s.imageUrl} alt="" fallback={<div className="noimg">🔖</div>} /> : <div className="noimg">🔖</div>}
              </a>
              <div className="actions">
                <button className="btn sm icon" title="Edit" onClick={() => setEditing(s.id)}><Pencil size={14} /></button>
                <button className="btn sm icon" title="Make this a vendor option" onClick={() => setToVendor(s)}><Handshake size={14} /></button>
              </div>
              <div className="bd">
                {s.url ? <a className="title" href={s.url} target="_blank" rel="noreferrer">{s.title}</a> : <button className="title" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer' }} onClick={() => setEditing(s.id)}>{s.title}</button>}
                <div className="row tiny muted" style={{ gap: 6 }}>
                  {s.favorite && <Heart size={12} fill="currentColor" style={{ color: 'var(--accent)' }} />}
                  <span className="ellipsis">{s.siteName || hostOf(s.url)}</span>
                  {s.price && <span className="chip" style={{ padding: '0 7px', fontSize: 11.5 }}>{s.price}</span>}
                </div>
                {s.notes && <p className="small ink2" style={{ whiteSpace: 'pre-line' }}>{s.notes}</p>}
                {!s.notes && s.description && <p className="tiny muted">{s.description.slice(0, 140)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {importing && (
        <Modal title="Import from Magpie" onClose={() => setImporting(false)} wide>
          <MagpieImport />
        </Modal>
      )}
      {editing && <EditSave id={editing} state={state} onClose={() => setEditing(null)} />}
      {toVendor && <MakeVendor save={toVendor} onClose={() => setToVendor(null)} />}
    </div>
  );
}

function BoardTools({ board, count, isOnly }) {
  if (!board) return null;
  return (
    <div className="row small muted" style={{ gap: 6 }}>
      <span>{board.emoji}</span>
      <Text className="input bare" style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--ink)', width: 'auto', flex: '0 1 320px' }} value={board.name} onChange={(name) => update((s) => { s.boards.find((b) => b.id === board.id).name = name || board.name; })} aria-label="Board name" />
      <span>{plural(count, 'save')}</span>
      {!isOnly && (
        <button className="btn sm ghost danger" onClick={() => {
          if (!window.confirm(`Delete the "${board.name}" board? Its saves move to your first board.`)) return;
          update((s) => { s.boards = s.boards.filter((b) => b.id !== board.id); for (const x of s.saves) if (x.boardId === board.id) x.boardId = s.boards[0].id; });
          go('saves');
        }}><Trash2 size={14} /> Delete board</button>
      )}
    </div>
  );
}

function EditSave({ id, state, onClose }) {
  const s = state.saves.find((x) => x.id === id);
  if (!s) return null;
  const set = (patch) => update((st) => { Object.assign(st.saves.find((x) => x.id === id), patch); });
  return (
    <Modal title="Edit save" onClose={onClose}
      footer={<>
        <button className="btn ghost danger" style={{ marginRight: 'auto' }} onClick={() => { const snap = { ...s }; update((st) => { st.saves = st.saves.filter((x) => x.id !== id); }); onClose(); toast('Deleted', { label: 'Undo', run: () => update((st) => { st.saves.unshift(snap); }) }); }}><Trash2 size={14} /> Delete</button>
        {s.url && <a className="btn" href={s.url} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Open link</a>}
        <button className="btn primary" onClick={onClose}>Done</button>
      </>}>
      <div className="stack">
        <Field label="Title"><Text value={s.title} onChange={(title) => set({ title })} /></Field>
        <Field label="Board">
          <select className="select" value={s.boardId} onChange={(e) => set({ boardId: e.target.value })}>{state.boards.map((b) => <option key={b.id} value={b.id}>{b.emoji} {b.name}</option>)}</select>
        </Field>
        <Field label="Notes"><Text multiline className="textarea" rows={3} value={s.notes} onChange={(notes) => set({ notes })} placeholder="What you like about it" /></Field>
        <Field label="Price"><Text value={s.price} onChange={(price) => set({ price })} /></Field>
        {s.details && s.details.length > 0 && <div className="small muted">{s.details.map((d) => `${d.label}: ${d.value}`).join(' · ')}</div>}
      </div>
    </Modal>
  );
}

function MakeVendor({ save, onClose }) {
  const [category, setCategory] = useState(guessCategory(`${save.title} ${save.description}`) || 'venue');
  const make = () => {
    const v = newVendor({ category, name: save.title, website: save.url, summary: save.description, notes: save.notes, imageId: save.imageId, imageUrl: save.imageUrl, startingPrice: save.price, details: save.details || [], tags: save.tags || [] });
    update((s) => { s.vendors.push(v); });
    toast(`Added to ${CATEGORY_BY_KEY[category].label}`);
    onClose();
    go(`vendor/${v.id}`);
  };
  return (
    <Modal title="Make this a vendor option" subtitle={save.title} onClose={onClose}
      footer={<><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn primary" onClick={make}>Add vendor</button></>}>
      <Field label="What kind of vendor?">
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}</select>
      </Field>
    </Modal>
  );
}
