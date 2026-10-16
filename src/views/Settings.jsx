import { useState, useEffect } from 'react';
import { Download, Upload, KeyRound, Trash2 } from 'lucide-react';
import { useAppState, update, useSaveStatus } from '../lib/store.js';
import { MODELS } from '../lib/ai.js';
import { exportBackup, importBackup, resetEverything } from '../lib/backup.js';
import { PageHead, Field, Text, MoneyInput, toast } from '../components/ui.jsx';
import MagpieImport from '../components/MagpieImport.jsx';
import { STYLES, PRIORITIES } from './Onboarding.jsx';
import { fmtDate, HAS_SERVER } from '../lib/util.js';

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
        <h2>Where your plan is saved</h2>
        <StorageInfo />
        <div className="divider" style={{ margin: '4px 0' }} />
        <p className="ink2 small">A backup file is one JSON file with everything, photos included (not your API key). Handy for moving to another computer or keeping a copy somewhere safe.</p>
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

function StorageInfo() {
  const status = useSaveStatus();
  const [info, setInfo] = useState(null);
  useEffect(() => {
    (async () => {
      const persisted = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : null;
      const estimate = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null;
      setInfo({ persisted, used: estimate ? estimate.usage : null });
    })();
  }, [status]);
  const mb = (n) => (n / 1024 / 1024).toFixed(n > 10 * 1024 * 1024 ? 0 : 1);
  if (!HAS_SERVER) {
    return (
      <div className="stack tight small">
        <div className="callout"><div>
          <strong>This is the online copy of Lovebird.</strong> Your plan is saved only in this browser, on this device. It isn't shared with anyone
          (the site is just the app; your details never leave your browser), but it also isn't backed up. Export a backup now and then.
          Link previews and saving to the data folder only work when Lovebird runs on your computer.
        </div></div>
        {info && info.persisted !== null && <div><span className={`chip ${info.persisted ? 'green' : ''}`}>{info.persisted ? 'Browser storage: protected' : 'Browser storage: may be cleared if disk is full'}</span></div>}
      </div>
    );
  }
  return (
    <div className="stack tight small">
      <p className="ink2">
        Every change is saved in two places: in this browser, and as files in the <code>data</code> folder inside the Lovebird project
        (<code>data/plan.json</code> and <code>data/photos</code>), with a copy of the plan from each of the last 30 days in <code>data/history</code>.
        That folder is never uploaded to GitHub. If either copy is lost, the other one fills it back in the next time you open Lovebird.
      </p>
      <div className="row wrap" style={{ gap: 6 }}>
        <span className={`chip ${status === 'browser-only' ? 'warn' : 'green'}`}>{status === 'browser-only' ? 'Data folder not reachable: browser only' : 'Data folder: saving'}</span>
        {info && info.persisted !== null && <span className={`chip ${info.persisted ? 'green' : ''}`}>{info.persisted ? 'Browser storage: protected' : 'Browser storage: may be cleared if disk is full'}</span>}
        {info && info.used !== null && <span className="chip">{mb(info.used)} MB used in this browser</span>}
      </div>
    </div>
  );
}
