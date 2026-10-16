// App state: a single plain object, updated with immer.
//
// Every change is saved twice: to the browser (IndexedDB) right away, and to
// data/plan.json through the local server. On startup whichever copy is newer
// wins, so clearing the browser, switching browsers or a missed save never loses
// the plan. The API key stays in the browser only.

import { useSyncExternalStore, useEffect, useState } from 'react';
import { produce } from 'immer';
import { loadState, saveState } from './db.js';
import { getPhoto, syncPhotosToDisk } from './photos.js';
import { HAS_SERVER } from './util.js';

export const DEFAULT_MODEL = 'claude-opus-5';
export const SCHEMA_VERSION = 2;

export function initialState() {
  return {
    version: SCHEMA_VERSION,
    onboarded: false,
    wedding: {
      partner1: '', partner2: '', date: '', dateIdeas: '', city: '',
      guestEstimate: 120, budget: 35000, style: '', priorities: [], notes: '',
    },
    tasks: {},
    customTasks: [],
    vendors: [],
    payments: [],
    budget: { allocations: {}, extras: [], contributors: [] },
    guests: [],
    tables: [],
    saves: [],
    boards: [{ id: 'b_inspo', name: 'Inspiration', emoji: '✨' }],
    dayof: [],
    chat: [],
    settings: { apiKey: '', model: DEFAULT_MODEL },
    imports: [],
    celebrated: [],
  };
}

// Brings a saved plan from any older version up to date. Add a step here
// whenever the shape of the data changes, so old plans keep loading.
function migrate(saved) {
  const base = initialState();
  const s = {
    ...base, ...saved,
    wedding: { ...base.wedding, ...saved.wedding },
    settings: { ...base.settings, ...saved.settings },
    budget: { ...base.budget, ...saved.budget },
  };
  // v1 → v2: budget contributors and celebrations were added (defaults above cover it).
  s.version = SCHEMA_VERSION;
  return s;
}

let state = null;
const listeners = new Set();
let saveTimer = null;

// ---------- save status, for the little indicator in the sidebar

let saveStatus = 'idle'; // 'idle' | 'saving' | 'saved' | 'browser-only'
const statusListeners = new Set();
function setStatus(next) {
  if (next === saveStatus) return;
  saveStatus = next;
  statusListeners.forEach((fn) => fn());
}
export function useSaveStatus() {
  return useSyncExternalStore((fn) => { statusListeners.add(fn); return () => statusListeners.delete(fn); }, () => saveStatus);
}

async function loadDisk() {
  if (!HAS_SERVER) return null;
  try {
    const res = await fetch('/api/plan', { cache: 'no-store' });
    if (!res.ok) return null;
    const plan = await res.json();
    return plan && plan.version ? plan : null;
  } catch {
    return null;
  }
}

async function saveDisk(snapshot) {
  if (!HAS_SERVER) return false;
  const { settings, ...rest } = snapshot;
  const body = JSON.stringify({ ...rest, settings: { ...settings, apiKey: '' } });
  try {
    const res = await fetch('/api/plan', { method: 'PUT', body, headers: { 'Content-Type': 'application/json' } });
    return res.ok;
  } catch {
    return false;
  }
}

async function persist() {
  const snapshot = { ...state, savedAt: Date.now() };
  setStatus('saving');
  await saveState(snapshot);
  setStatus((await saveDisk(snapshot)) ? 'saved' : 'browser-only');
}

export async function boot() {
  const [local, disk] = await Promise.all([loadState(), loadDisk()]);
  let chosen = local;
  if (disk && (!local || (disk.savedAt || 0) > (local.savedAt || 0))) {
    chosen = { ...disk, settings: { ...disk.settings, apiKey: (local && local.settings && local.settings.apiKey) || '' } };
  }
  state = chosen ? migrate(chosen) : initialState();
  window.addEventListener('beforeunload', flush);
  // Ask the browser not to clear our storage when disk space runs low.
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  // Bring both copies in line: write the winner everywhere, and copy photos to disk.
  if (chosen) persist();
  syncPhotosToDisk();
  return state;
}

function flush() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    persist();
  }
}

export function getState() {
  return state;
}

export function update(recipe) {
  state = produce(state, recipe);
  listeners.forEach((fn) => fn());
  clearTimeout(saveTimer);
  setStatus('saving');
  saveTimer = setTimeout(() => {
    saveTimer = null;
    persist();
  }, 400);
}

export async function replaceState(next) {
  state = migrate(next);
  listeners.forEach((fn) => fn());
  await persist();
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useAppState() {
  return useSyncExternalStore(subscribe, () => state);
}

// ---------- photos

const urlCache = new Map();

export async function imageUrl(id) {
  if (!id) return null;
  if (urlCache.has(id)) return urlCache.get(id);
  const record = await getPhoto(id);
  const url = record ? URL.createObjectURL(record.blob) : null;
  urlCache.set(id, url);
  return url;
}

export function forgetImageUrl(id) {
  const url = urlCache.get(id);
  if (url) URL.revokeObjectURL(url);
  urlCache.delete(id);
}

// A stored photo by id, or a remote photo URL as a fallback.
export function useImage(imageId, fallbackUrl) {
  const [url, setUrl] = useState(() => (imageId && urlCache.get(imageId)) || null);
  useEffect(() => {
    let live = true;
    if (imageId) imageUrl(imageId).then((u) => live && setUrl(u));
    else setUrl(null);
    return () => { live = false; };
  }, [imageId]);
  return url || fallbackUrl || null;
}
