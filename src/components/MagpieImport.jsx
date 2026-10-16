import { useState } from 'react';
import { Upload } from 'lucide-react';
import { readBackup, applyImport } from '../lib/magpie.js';
import { CATEGORIES } from '../data/categories.js';
import { plural } from '../lib/util.js';

// Pick a Magpie backup, choose where each collection goes, import.
export default function MagpieImport({ onDone, compact }) {
  const [parsed, setParsed] = useState(null);
  const [choices, setChoices] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState(null);

  async function pick(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    try {
      const p = await readBackup(file);
      setParsed(p);
      setFileName(file.name);
      setChoices(Object.fromEntries(p.collections.map((c) => [c.id, c.suggested])));
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  async function run() {
    setBusy(true);
    try {
      const counts = await applyImport(parsed.backup, choices, fileName);
      setResult(counts);
      setParsed(null);
      onDone && onDone(counts);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return (
      <div className="callout green">
        <div>
          <strong>Imported.</strong> {plural(result.saves, 'save')} added to your boards, {plural(result.vendors, 'vendor option')} added under Vendors
          {result.updated ? `, and ${plural(result.updated, 'earlier import')} updated` : ''}.
          <div style={{ marginTop: 8 }}><button className="btn sm" onClick={() => setResult(null)}>Import another file</button></div>
        </div>
      </div>
    );
  }

  if (!parsed) {
    return (
      <div className="stack">
        {!compact && (
          <p className="ink2">
            In Magpie, open your board, go to <strong>Settings → Export backup</strong>, then choose that file here. Collections of vendors
            (venues, photographers, florists…) become options you can compare; everything else becomes an inspiration board.
          </p>
        )}
        <label className="btn" style={{ alignSelf: 'flex-start' }}>
          <Upload size={16} /> Choose Magpie backup…
          <input type="file" accept=".json,application/json" onChange={pick} hidden />
        </label>
        {error && <p className="small" style={{ color: 'var(--danger)' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="stack">
      <p className="ink2 small">Found {plural(parsed.collections.length, 'collection')} in <strong>{fileName}</strong>. Choose where each one should go.</p>
      <div className="stack tight">
        {parsed.collections.map((c) => (
          <div key={c.id} className="row" style={{ padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 10 }}>
            <span style={{ fontSize: 20 }}>{c.emoji}</span>
            <div className="grow">
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div className="tiny muted">{plural(c.count, 'save')}</div>
            </div>
            <select className="select sm" style={{ width: 210 }} value={choices[c.id]} onChange={(e) => setChoices({ ...choices, [c.id]: e.target.value })}>
              <option value="board">Inspiration board</option>
              <optgroup label="Vendor options for…">
                {CATEGORIES.map((cat) => <option key={cat.key} value={`vendor:${cat.key}`}>{cat.emoji} {cat.label}</option>)}
              </optgroup>
              <option value="skip">Don't import</option>
            </select>
          </div>
        ))}
      </div>
      {error && <p className="small" style={{ color: 'var(--danger)' }}>{error}</p>}
      <div className="row">
        <button className="btn primary" onClick={run} disabled={busy}>{busy ? 'Importing…' : 'Import'}</button>
        <button className="btn ghost" onClick={() => setParsed(null)}>Cancel</button>
      </div>
    </div>
  );
}
