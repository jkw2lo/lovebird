// Whole-plan backups: one JSON file with everything, photos included.
// The API key is left out.

import { getAllImages, clearAll } from './db.js';
import { storePhoto } from './photos.js';
import { getState, replaceState, initialState } from './store.js';
import { download, dayString, today } from './util.js';

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function exportBackup() {
  const state = getState();
  const images = [];
  for (const img of await getAllImages()) images.push({ ...img, blob: undefined, dataUrl: await blobToDataUrl(img.blob) });
  const { apiKey, ...settings } = state.settings;
  const backup = { app: 'lovebird', version: 1, exportedAt: new Date().toISOString(), state: { ...state, settings: { ...settings, apiKey: '' } }, images };
  download(`lovebird-backup-${dayString(today())}.json`, JSON.stringify(backup));
}

export async function importBackup(file) {
  const backup = JSON.parse(await file.text());
  if (backup.app === 'magpie') throw new Error('That is a Magpie backup. Use “Import from Magpie” instead.');
  if (backup.app !== 'lovebird' || !backup.state) throw new Error('That file is not a Lovebird backup.');
  for (const img of backup.images || []) {
    const blob = await (await fetch(img.dataUrl)).blob();
    const { dataUrl, blob: _, ...rest } = img;
    await storePhoto(blob, { ...rest, resize: false });
  }
  const apiKey = getState().settings.apiKey;
  await replaceState({ ...initialState(), ...backup.state, settings: { ...backup.state.settings, apiKey } });
}

export async function resetEverything() {
  await clearAll();
  await replaceState(initialState());
}
