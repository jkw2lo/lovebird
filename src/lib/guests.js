// Adding guests quickly: typed lists, CSV in and out, and plus-ones.

import { newId } from './util.js';

export function newGuest(fields = {}) {
  return {
    id: newId('g_'), first: '', last: '', party: '', side: 'both', group: '', list: 'A', rsvp: 'not_sent',
    meal: '', dietary: '', email: '', phone: '', address: '', child: false, plusOneOf: null,
    tableId: null, gift: '', thanked: false, notes: '',
    ...fields,
  };
}

// "Aunt Lily" is a first name with a title; "Dad Chen" is a title with a last name.
const BEFORE_FIRST_NAME = /^(aunt|auntie|uncle|cousin|great-aunt|great-uncle|grandma|grandpa|nana|nanna|granny|sister|brother)$/i;

function splitName(full) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  if (parts.length === 2 && BEFORE_FIRST_NAME.test(parts[0])) return { first: parts.join(' '), last: '' };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

/**
 * One household per line:
 *   "Jane Smith"                 → one guest
 *   "Jane & John Smith"          → two guests, both Smith, same party
 *   "Ana Ruiz, Ben Ortiz, Leo"   → three guests in one party
 *   "Sam Lee +1"                 → Sam plus a placeholder guest
 */
export function parseGuestLines(text, defaults = {}) {
  const out = [];
  for (const raw of text.split('\n')) {
    let line = raw.trim();
    if (!line) continue;
    let plusOne = false;
    if (/\s*(\+\s*1|\+\s*guest|and guest|& guest)\s*$/i.test(line)) {
      plusOne = true;
      line = line.replace(/\s*(\+\s*1|\+\s*guest|and guest|& guest)\s*$/i, '');
    }
    // "The Nguyens: Minh, Lan, Bao Nguyen" names the household explicitly.
    let label = '';
    const colon = line.indexOf(':');
    if (colon > 0) { label = line.slice(0, colon).trim(); line = line.slice(colon + 1).trim(); }
    const names = line.split(/\s*(?:&|,|\band\b|\+)\s*/i).filter(Boolean);
    const people = names.map(splitName);
    // "Jane & John Smith": give single-word names the shared last name.
    const sharedLast = people.length > 1 ? people[people.length - 1].last : '';
    for (const p of people) if (!p.last && sharedLast) p.last = sharedLast;
    const party = label || raw.trim().replace(/\s*(\+\s*1|\+\s*guest|and guest|& guest)\s*$/i, '');
    const group = people.map((p) => newGuest({ ...defaults, ...p, party: people.length > 1 || plusOne || label ? party : '' }));
    out.push(...group);
    if (plusOne && group[0]) out.push(newGuest({ ...defaults, first: 'Guest of', last: group[0].first, party, plusOneOf: group[0].id }));
  }
  return out;
}

// ---------- CSV

export function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim()));
}

const COLUMN_HINTS = [
  ['first', /^first|given/i], ['last', /^last|surname|family name/i], ['name', /^(full )?name$|^guest/i],
  ['party', /party|household|family$|invitation|group name/i], ['email', /e-?mail/i], ['phone', /phone|mobile|cell/i],
  ['address', /address|street/i], ['side', /side/i], ['group', /^group|category|relationship|circle/i],
  ['rsvp', /rsvp|attending|status/i], ['meal', /meal|entree|entrée|menu/i], ['dietary', /diet|allerg/i],
  ['list', /^list|tier|priority/i], ['notes', /note/i],
];

export function guestsFromCsv(text, sideNames = {}) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  const map = header.map((h) => (COLUMN_HINTS.find(([, re]) => re.test(h)) || [null])[0]);
  const guests = [];
  for (const r of rows.slice(1)) {
    const g = newGuest();
    map.forEach((key, i) => {
      const v = (r[i] || '').trim();
      if (!key || !v) return;
      if (key === 'name') Object.assign(g, splitName(v));
      else if (key === 'rsvp') g.rsvp = /^(y|yes|attending|accept)/i.test(v) ? 'yes' : /^(n|no|decline|regret)/i.test(v) ? 'no' : /invited|sent|pending|awaiting/i.test(v) ? 'pending' : 'not_sent';
      else if (key === 'side') {
        const low = v.toLowerCase();
        g.side = low === (sideNames.p1 || '').toLowerCase() || /^(1|bride|partner 1)/.test(low) ? 'p1' : low === (sideNames.p2 || '').toLowerCase() || /^(2|groom|partner 2)/.test(low) ? 'p2' : 'both';
      } else if (key === 'list') g.list = /b/i.test(v) ? 'B' : 'A';
      else g[key] = v;
    });
    if (g.first || g.last) guests.push(g);
  }
  return guests;
}

const esc = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function guestsToCsv(state) {
  const tables = Object.fromEntries(state.tables.map((t) => [t.id, t.name]));
  const side = (s) => (s === 'p1' ? state.wedding.partner1 || 'Partner 1' : s === 'p2' ? state.wedding.partner2 || 'Partner 2' : 'Both');
  const rsvp = { not_sent: 'Not invited yet', pending: 'Awaiting reply', yes: 'Yes', no: 'No' };
  const header = ['First name', 'Last name', 'Party', 'Side', 'Group', 'List', 'RSVP', 'Meal', 'Dietary', 'Child', 'Table', 'Email', 'Phone', 'Address', 'Gift', 'Thank-you sent', 'Notes'];
  const rows = state.guests.map((g) => [g.first, g.last, g.party, side(g.side), g.group, g.list, rsvp[g.rsvp], g.meal, g.dietary, g.child ? 'Yes' : '', tables[g.tableId] || '', g.email, g.phone, g.address, g.gift, g.thanked ? 'Yes' : '', g.notes]);
  return [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
}
