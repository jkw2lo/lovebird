// Bringing collections in from a Magpie backup (Magpie board → Settings → Export backup).
//
// Each Magpie collection becomes either an inspiration board here, or a set of
// vendor options in one category (a "Photographers" collection lands under
// Photographer, ready to compare). Importing the same backup again updates
// what came from it instead of adding duplicates.

import { guessCategory, CATEGORY_BY_KEY } from '../data/categories.js';
import { putImage } from './db.js';
import { update, getState } from './store.js';
import { newId } from './util.js';

export async function readBackup(file) {
  const backup = JSON.parse(await file.text());
  if (backup.app !== 'magpie') throw new Error('That file is not a Magpie backup. In Magpie, open the board, then Settings → Export backup.');
  const items = backup.items || [];
  const collections = (backup.collections || []).map((c) => {
    const inside = items.filter((i) => i.collectionId === c.id);
    return { ...c, count: inside.length, suggested: suggestDestination(c, inside) };
  }).filter((c) => c.count > 0);
  return { backup, collections };
}

// 'board' or 'vendor:<category>'
function suggestDestination(collection, items) {
  const fromName = guessCategory(collection.name);
  const vendorish = items.filter((i) => ['venue', 'vendor'].includes(i.ai && i.ai.category)).length;
  if (fromName && (vendorish >= items.length / 2 || ['venue', 'photography', 'videography', 'catering', 'music', 'florals', 'planner', 'beauty', 'cake', 'officiant', 'stationery', 'rentals', 'transport', 'hotel'].includes(fromName))) {
    return `vendor:${fromName}`;
  }
  if (vendorish >= items.length / 2) {
    const fromItems = items.map((i) => guessCategory(serviceOf(i))).find(Boolean);
    if (fromItems) return `vendor:${fromItems}`;
    if (items.some((i) => i.ai && i.ai.category === 'venue')) return 'vendor:venue';
  }
  return 'board';
}

function serviceOf(item) {
  const ai = item.ai || {};
  const service = (ai.details || []).find((d) => /service|type/i.test(d.label));
  return [service && service.value, ai.title, item.title].filter(Boolean).join(' ');
}

function titleOf(item) {
  const ai = item.ai || {};
  return item.customTitle || ai.title || item.title || item.url;
}

async function dataUrlToBlob(dataUrl) {
  return (await fetch(dataUrl)).blob();
}

/**
 * @param {object} backup the parsed Magpie file
 * @param {Record<string, string>} choices collectionId → 'skip' | 'board' | 'vendor:<category>'
 */
export async function applyImport(backup, choices, fileName = '') {
  const images = new Map((backup.images || []).map((img) => [img.id, img]));
  const items = backup.items || [];
  const stored = new Set();
  const counts = { saves: 0, vendors: 0, updated: 0 };

  // Copy cover photos first (async), then make all state changes in one go.
  const coverFor = {};
  for (const item of items) {
    const dest = choices[item.collectionId];
    if (!dest || dest === 'skip') continue;
    const imgId = item.coverImageId || (item.imageIds || [])[0];
    const img = imgId && images.get(imgId);
    if (!img || !img.dataUrl) continue;
    if (!stored.has(imgId)) {
      await putImage({ id: `mg_${imgId}`, blob: await dataUrlToBlob(img.dataUrl), width: img.width, height: img.height, from: 'magpie' });
      stored.add(imgId);
    }
    coverFor[item.id] = `mg_${imgId}`;
  }

  update((s) => {
    const boardFor = {};
    for (const c of backup.collections || []) {
      if (choices[c.id] !== 'board') continue;
      let board = s.boards.find((b) => b.magpieId === c.id) || s.boards.find((b) => b.name.toLowerCase() === c.name.toLowerCase());
      if (!board) {
        board = { id: newId('b_'), name: c.name, emoji: c.emoji || '📌', magpieId: c.id };
        s.boards.push(board);
      }
      boardFor[c.id] = board.id;
    }

    for (const item of items) {
      const dest = choices[item.collectionId];
      if (!dest || dest === 'skip') continue;
      const ai = item.ai || {};
      const imageId = coverFor[item.id] || null;
      const tags = [...new Set([...(ai.tags || []), ...(item.userTags || [])])];

      if (dest === 'board') {
        const existing = s.saves.find((x) => x.magpieId === item.id);
        const fields = {
          url: item.url, title: titleOf(item), description: ai.summary || item.description || '',
          siteName: item.siteName || '', price: (ai.price && ai.price.display) || (item.price && item.price.display) || '',
          details: ai.details || [], tags, boardId: boardFor[item.collectionId], favorite: !!item.favorite,
          imageId: imageId || (existing && existing.imageId) || null, imageUrl: (item.imageUrls || [])[0] || null,
        };
        if (existing) { Object.assign(existing, fields); counts.updated++; }
        else { s.saves.unshift({ id: newId('s_'), source: 'magpie', magpieId: item.id, notes: item.notes || '', createdAt: item.createdAt || Date.now(), ...fields }); counts.saves++; }
      } else {
        const category = dest.slice('vendor:'.length);
        if (!CATEGORY_BY_KEY[category]) continue;
        const existing = s.vendors.find((v) => v.magpieId === item.id);
        const fields = {
          category,
          name: existing ? existing.name : (ai.brand && ai.category !== 'venue' ? ai.brand : titleOf(item)),
          website: item.url, location: ai.location || '', summary: ai.summary || '',
          details: ai.details || [], startingPrice: (ai.price && ai.price.display) || (item.price && item.price.display) || '',
          imageId: imageId || (existing && existing.imageId) || null, imageUrl: (item.imageUrls || [])[0] || null, tags,
        };
        if (existing) { Object.assign(existing, fields); counts.updated++; }
        else { s.vendors.push(newVendor({ ...fields, magpieId: item.id, notes: item.notes || '', favorite: !!item.favorite })); counts.vendors++; }
      }
    }
    s.imports.push({ at: Date.now(), file: fileName, ...counts });
  });
  return counts;
}

export function newVendor(fields) {
  return {
    id: newId('v_'), category: 'venue', name: '', website: '', email: '', phone: '', instagram: '', contactName: '',
    location: '', status: 'idea', availability: 'unknown', holdUntil: '', rating: 0, notes: '', pros: '', cons: '',
    summary: '', details: [], startingPrice: '', imageId: null, imageUrl: null, quotes: [], chosenQuoteId: null,
    answers: {}, tags: [], favorite: false, createdAt: Date.now(),
    ...fields,
  };
}

export function hasImports() {
  return getState().imports.length > 0;
}
