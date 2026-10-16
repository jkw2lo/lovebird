// App state: a single plain object, updated with immer and saved to IndexedDB
// a moment after each change.

import { useSyncExternalStore, useEffect, useState } from 'react';
import { produce } from 'immer';
import { loadState, saveState, getImage } from './db.js';

export const DEFAULT_MODEL = 'claude-opus-5';

export function initialState() {
  return {
    version: 1,
    onboarded: false,
    wedding: {
      partner1: '', partner2: '', date: '', dateIdeas: '', city: '',
      guestEstimate: 120, budget: 35000, style: '', priorities: [], notes: '',
    },
    tasks: {},
    customTasks: [],
    vendors: [],
    payments: [],
    budget: { allocations: {}, extras: [] },
    guests: [],
    tables: [],
    saves: [],
    boards: [{ id: 'b_inspo', name: 'Inspiration', emoji: '✨' }],
    dayof: [],
    chat: [],
    settings: { apiKey: '', model: DEFAULT_MODEL },
    imports: [],
  };
}

let state = null;
const listeners = new Set();
let saveTimer = null;

export async function boot() {
  const saved = await loadState();
  // Fill in any keys added since the plan was first saved.
  const base = initialState();
  state = saved ? { ...base, ...saved, wedding: { ...base.wedding, ...saved.wedding }, settings: { ...base.settings, ...saved.settings }, budget: { ...base.budget, ...saved.budget } } : base;
  window.addEventListener('beforeunload', flush);
  return state;
}

function flush() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    saveState(state);
  }
}

export function getState() {
  return state;
}

export function update(recipe) {
  state = produce(state, recipe);
  listeners.forEach((fn) => fn());
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveState(state);
  }, 300);
}

export function replaceState(next) {
  state = next;
  listeners.forEach((fn) => fn());
  return saveState(state);
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
  const record = await getImage(id);
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
