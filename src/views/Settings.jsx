import { useState } from 'react';
import { Download, Upload, KeyRound, Trash2 } from 'lucide-react';
import { useAppState, update } from '../lib/store.js';
import { MODELS } from '../lib/ai.js';
import { exportBackup, importBackup, resetEverything } from '../lib/backup.js';
import { PageHead, Field, Text, MoneyInput, toast } from '../components/ui.jsx';
import MagpieImport from '../components/MagpieImport.jsx';
import { STYLES, PRIORITIES } from './Onboarding.jsx';
import { fmtDate } from '../lib/util.js';

export default function Settings() {
  const state = useAppState();
  const w = state.wedding;
  const set = (patch) => update((s) => { Object.assign(s.wedding, patch); });
  const [status, setStatus] = useState('');
  const styles = w.style ? w.style.split(', ').filter(Boolean) : [];

  return (
    <div className="stack loose" style={{ maxWidth: 820 }}>
      <PageHead eyebrow="Settings" title="Your wedding" />

      <section className="card pad stack">
        <h2>The details</h2>
        <div className="grid two">
          <Field label="Your name"><Text value={w.partner1} onChange={(partner1) => set({ partner1 })} /></Field>
          <Field label="Partner's name"><Text value={w.partner2} onChange={(partner2) => set({ partner2 })} /></Field>
          <Field label="Wedding date" hint="Every step in your plan gets a deadline from this."><input type="date" className="input" value={w.date} onChange={(e) => set({ date: e.target.value })} /></Field>
          <Field label="Or roughly when"><Text value={w.dateIdeas} onChange={(dateIdeas) => set({ dateIdeas })} placeholder="e.g. Fall 2027" /></Field>
          <Field label="Where"><Text value={w.city} onChange={(city) => set({ city })} /></Field>
          <Field label="Estimated guests"><input type="number" className="input" min={1} value={w.guestEstimate} onChange={(e) => set({ guestEstimate: Number(e.target.value) || 0 })} /></Field>
          <Field label="Total budget"><MoneyInput value={w.budget} onChange={(v) => set({ budget: v || 0 })} /></Field>
        </div>
        <div className="stack tight">
          <span className="label">Style</span>
          <div className="choice-grid">{STYLES.map((st) => <button key={st} type="button" className={`chip ${styles.includes(st) ? 'on' : ''}`} onClick={() => set({ style: (styles.includes(st) ? styles.filter((x) => x !== st) : [...styles, st]).join(', ') })}>{st}</button>)}</div>
        </div>
        <div className="stack tight">
          <span className="label">Top priorities (up to 3)</span>
          <div className="choice-grid">{PRIORITIES.map((p) => <button key={p} type="button" className={`chip ${w.priorities.includes(p) ? 'on' : ''}`} onClick={() => set({ priorities: w.priorities.includes(p) ? w.priorities.filter((x) => x !== p) : w.priorities.length >= 3 ? w.priorities : [...w.priorities, p] })}>{p}</button>)}</div>
        </div>
        <Field label="Anything else your planner should know" hint="Traditions, family situations, must-haves, things you definitely don't want.">
          <Text multiline className="textarea" rows={3} value={w.notes} onChange={(notes) => set({ notes })} />
        </Field>
      </section>

      <section className="card pad stack">
        <h2><KeyRound size={18} style={{ verticalAlign: -2 }} /> Claude (optional)</h2>
        <p className="ink2 small">With an Anthropic API key, you can chat with your planner (it sees a summary of your plan, vendors, budget and guest numbers) and paste vendor emails or quotes to fill them in automatically. Get a key at <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a>. Most questions cost a few cents.</p>
        <div className="grid two">
          <Field label="API key" hint="Stored only in this browser. Not included in backups.">
            <input type="password" className="input" value={state.settings.apiKey} onChange={(e) => update((s) => { s.settings.apiKey = e.target.value.trim(); })} placeholder="sk-ant-…" autoComplete="off" />
          </Field>
          <Field label="Model">
            <select className="select" value={state.settings.model} onChange={(e) => update((s) => { s.settings.model = e.target.value; })}>
              {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </Field>
        </div>
        <p className="tiny muted">When you use these features, the text you send and a summary of your plan go to api.anthropic.com. Nothing else leaves this browser.</p>
      </section>

      <section className="card pad stack">
        <h2>Import from Magpie</h2>
        <MagpieImport />
        {state.imports.length > 0 && <p className="tiny muted">Last import: {fmtDate(new Date(state.imports[state.imports.length - 1].at))}. Importing the same backup again updates those saves instead of duplicating them.</p>}
      </section>

      <section className="card pad stack">
        <h2>Backups</h2>
        <p className="ink2 small">Your plan lives in this browser on this computer. Export a backup now and then, and keep it somewhere safe (it includes photos, but not your API key). You can also use it to move your plan to another computer.</p>
        <div className="row wrap">
          <button className="btn" onClick={async () => { await exportBackup(); setStatus('Backup downloaded.'); }}><Download size={15} /> Export backup</button>
          <label className="btn"><Upload size={15} /> Restore from backup…<input type="file" accept=".json,application/json" hidden onChange={async (e) => {
            const file = e.target.files[0];
            e.target.value = '';
            if (!file) return;
            if (!window.confirm('Restoring replaces everything in Lovebird with the backup. Continue?')) return;
            try { await importBackup(file); toast('Restored from backup'); setStatus(''); } catch (err) { setStatus(err.message); }
          }} /></label>
          <span className="grow" />
          <button className="btn ghost danger" onClick={async () => {
            if (!window.confirm('Delete your whole plan from this browser? Export a backup first if you might want it back.')) return;
            await resetEverything();
            window.location.hash = '#/';
          }}><Trash2 size={15} /> Start over</button>
        </div>
        {status && <p className="small muted">{status}</p>}
      </section>
    </div>
  );
}
