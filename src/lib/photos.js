// Photos live in two places: the browser (fast) and data/photos on disk (durable).
// Big photos are shrunk before saving; a phone photo goes from ~5 MB to ~300 KB.

import { putImage, getImage, getAllImages } from './db.js';
import { newId } from './util.js';

const MAX_EDGE = 1600;

export async function shrink(blob) {
  if (!blob || !blob.type.startsWith('image/') || blob.type === 'image/gif' || blob.type === 'image/svg+xml') return blob;
  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && blob.size < 400_000) return blob;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const encode = (type) => new Promise((resolve) => canvas.toBlob(resolve, type, 0.85));
    let out = await encode('image/webp');
    if (!out || out.type !== 'image/webp') out = await encode('image/jpeg');
    return out && out.size < blob.size ? out : blob;
  } catch {
    return blob;
  }
}

async function upload(id, blob) {
  try {
    const res = await fetch(`/api/photos/${encodeURIComponent(id)}`, { method: 'PUT', body: blob });
    return res.ok;
  } catch {
    return false;
  }
}

/** Saves a photo in both places and returns its id. */
export async function storePhoto(blob, { id = newId('img_'), resize = true, ...meta } = {}) {
  const small = resize ? await shrink(blob) : blob;
  await putImage({ ...meta, id, blob: small, type: small.type });
  upload(id, small);
  return id;
}

/** Reads a photo from the browser, falling back to the copy on disk. */
export async function getPhoto(id) {
  const record = await getImage(id);
  if (record) return record;
  try {
    const res = await fetch(`/api/photos/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const blob = new Blob([await res.arrayBuffer()], { type: 'image/jpeg' });
    const restored = { id, blob };
    await putImage(restored);
    return restored;
  } catch {
    return null;
  }
}

/** Copies any photos that are only in the browser onto disk. */
export async function syncPhotosToDisk() {
  let onDisk;
  try {
    const res = await fetch('/api/photos');
    if (!res.ok) return;
    onDisk = new Set(await res.json());
  } catch {
    return;
  }
  for (const img of await getAllImages()) if (!onDisk.has(img.id)) await upload(img.id, img.blob);
}
