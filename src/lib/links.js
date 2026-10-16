// Pasting a link: fetch its title and photo through the local server, and keep a copy of the photo.

import { storePhoto } from './photos.js';
import { update, getState } from './store.js';
import { newId, normalizeUrl, hostOf, HAS_SERVER } from './util.js';

export async function unfurl(rawUrl) {
  const url = normalizeUrl(rawUrl);
  if (!HAS_SERVER) return { url, title: '', description: '', image: '', siteName: hostOf(url), error: 'link previews only work when Lovebird runs on your computer' };
  try {
    const res = await fetch(`/api/unfurl?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (data.error) return { url, title: '', description: '', image: '', siteName: hostOf(url), error: data.error };
    return data;
  } catch {
    // Opened as a static file without the server: just keep the link.
    return { url, title: '', description: '', image: '', siteName: hostOf(url) };
  }
}

// Returns a stored image id, or null if the photo couldn't be fetched.
export async function keepPhoto(imageUrl) {
  if (!imageUrl || !HAS_SERVER) return null;
  try {
    const res = await fetch(`/api/image?url=${encodeURIComponent(imageUrl)}`);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;
    return await storePhoto(blob, { sourceUrl: imageUrl });
  } catch {
    return null;
  }
}

// From a file the user picked or dropped.
export async function keepFile(file) {
  return storePhoto(file, { name: file.name });
}

// Saves a link to a board: fetches its title and photo, keeps a copy of the photo.
export async function saveLink(rawUrl, boardId) {
  const meta = await unfurl(rawUrl);
  const imageId = await keepPhoto(meta.image);
  const save = {
    id: newId('s_'), url: meta.url, title: meta.title || hostOf(meta.url) || meta.url, description: meta.description || '',
    siteName: meta.siteName || hostOf(meta.url), price: meta.price ? `$${meta.price}` : '', imageId, imageUrl: meta.image || null,
    boardId: boardId || getState().boards[0].id, tags: [], notes: '', details: [], source: 'link', createdAt: Date.now(),
  };
  update((s) => { s.saves.unshift(save); });
  return save;
}

// Saves a picture (a dropped file or a pasted screenshot) as its own card.
export async function savePicture(file, boardId) {
  const imageId = await keepFile(file);
  const name = file.name && !/^image\.\w+$/i.test(file.name) ? file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') : 'Screenshot';
  const save = {
    id: newId('s_'), url: '', title: name, description: '', siteName: '', price: '', imageId, imageUrl: null,
    boardId: boardId || getState().boards[0].id, tags: [], notes: '', details: [], source: 'picture', createdAt: Date.now(),
  };
  update((s) => { s.saves.unshift(save); });
  return save;
}
