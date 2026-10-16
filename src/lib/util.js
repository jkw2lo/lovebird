export function newId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- money

export function money(amount, { cents = false } = {}) {
  if (amount === null || amount === undefined || amount === '' || Number.isNaN(Number(amount))) return '—';
  return Number(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents ? 2 : 0, minimumFractionDigits: cents ? 2 : 0 });
}

export function toNumber(v) {
  if (typeof v === 'number') return v;
  if (!v) return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

// ---------- dates (all plain YYYY-MM-DD strings, read as local dates)

export function parseDay(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function dayString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function today() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

export function fmtDate(s, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  const d = typeof s === 'string' ? parseDay(s) : s;
  return d ? d.toLocaleDateString('en-US', opts) : '';
}

export function relDays(n) {
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  if (n > 0) return n < 14 ? `in ${n} days` : n < 60 ? `in ${Math.round(n / 7)} weeks` : `in ${Math.round(n / 30.4)} months`;
  const a = -n;
  return a < 14 ? `${a} days ago` : a < 60 ? `${Math.round(a / 7)} weeks ago` : `${Math.round(a / 30.4)} months ago`;
}

export function fmtTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')}${suffix}` : `${hour}${suffix}`;
}

// ---------- misc

export function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

export function normalizeUrl(raw) {
  const s = (raw || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[\w-]+(\.[\w-]+)+(\/|$)/.test(s)) return 'https://' + s;
  return s;
}

export function fullName(g) {
  return [g.first, g.last].filter(Boolean).join(' ') || 'Unnamed guest';
}

export function initials(g) {
  return ((g.first || '?')[0] + (g.last ? g.last[0] : '')).toUpperCase();
}

export function plural(n, one, many = one + 's') {
  return `${n} ${n === 1 ? one : many}`;
}

export function download(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
