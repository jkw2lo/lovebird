// Pasting a link: fetch its title and photo through the local server, and keep a copy of the photo.

import { putImage } from './db.js';
import { newId, normalizeUrl, hostOf } from './util.js';

export async function unfurl(rawUrl) {
  const url = normalizeUrl(rawUrl);
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
  if (!imageUrl) return null;
  try {
    const res = await fetch(`/api/image?url=${encodeURIComponent(imageUrl)}`);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;
    const id = newId('img_');
    await putImage({ id, blob, sourceUrl: imageUrl });
    return id;
  } catch {
    return null;
  }
}

// From a file the user picked or dropped.
export async function keepFile(file) {
  const id = newId('img_');
  await putImage({ id, blob: file, name: file.name });
  return id;
}
