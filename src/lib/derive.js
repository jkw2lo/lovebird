// Everything computed from the plan: due dates, what's next, budget totals, headcounts.

import { TASKS, PHASES } from '../data/plan.js';
import { CATEGORIES, BUDGET_LINES } from '../data/categories.js';
import { parseDay, addDays, today, daysBetween, dayString } from './util.js';

// ---------- tasks

export function allTasks(state) {
  const custom = state.customTasks.map((t) => ({ ...t, custom: true, tips: [], why: '' }));
  const order = Object.fromEntries(PHASES.map((p, i) => [p.key, i]));
  return [...TASKS, ...custom].sort((a, b) => order[a.phase] - order[b.phase] || b.before - a.before);
}

export function bookedVendor(state, category) {
  return state.vendors.find((v) => v.category === category && v.status === 'booked') || null;
}

export function taskDue(state, task) {
  const wedding = parseDay(state.wedding.date);
  if (!wedding) return null;
  return addDays(wedding, -task.before);
}

// Steps the app can see are finished from your data, so you don't have to tick them.
const AUTO_DONE = {
  setDate: (s) => !!s.wedding.date,
  dateRange: (s) => !!s.wedding.date,
  guestDraft: (s) => s.guests.length >= Math.max(10, s.wedding.guestEstimate * 0.6),
  addresses: (s) => s.guests.length > 0 && s.guests.filter((g) => g.address).length >= s.guests.length * 0.9,
  mailInvites: (s) => s.guests.length > 0 && s.guests.filter((g) => g.rsvp !== 'not_sent').length >= s.guests.length * 0.9,
  chaseRsvps: (s) => s.guests.length > 0 && s.guests.every((g) => g.rsvp === 'yes' || g.rsvp === 'no'),
  seating: (s) => s.tables.length > 0 && s.guests.some((g) => g.rsvp === 'yes') && s.guests.filter((g) => g.rsvp === 'yes').every((g) => g.tableId),
  timelineDraft: (s) => s.dayof.length >= 5,
};

export function taskStatus(state, task) {
  const record = (task.custom ? task : state.tasks[task.id]) || {};
  const autoVendor = task.books ? bookedVendor(state, task.books) : null;
  const autoDone = !!(AUTO_DONE[task.id] && AUTO_DONE[task.id](state));
  let done = !!record.done || !!autoVendor || autoDone;
  const skipped = !done && !!record.skipped;
  const due = taskDue(state, task);
  const daysLeft = due ? daysBetween(today(), due) : null;
  return { done, skipped, autoVendor, autoDone: autoDone && !record.done, due, daysLeft, notes: record.notes || '' };
}

// When there's no date yet, pretend the wedding is 13 months out so the order still makes sense.
function effectiveDaysLeft(state, task) {
  const s = taskStatus(state, task);
  if (s.daysLeft !== null) return s.daysLeft;
  return 395 - task.before;
}

// The handful of steps to focus on now: overdue or coming due, in plan order.
export function focusTasks(state, limit = 4) {
  const open = allTasks(state).filter((t) => {
    const s = taskStatus(state, t);
    return !s.done && !s.skipped;
  });
  // Anything due in the next ~10 weeks (or overdue), and always at least the next few in order.
  const soon = open.filter((t) => effectiveDaysLeft(state, t) <= 70);
  const list = soon.length >= limit ? soon : [...soon, ...open.filter((t) => !soon.includes(t))];
  return list.slice(0, limit);
}

export function phaseProgress(state) {
  const tasks = allTasks(state);
  return PHASES.map((phase) => {
    const items = tasks.filter((t) => t.phase === phase.key);
    const statuses = items.map((t) => taskStatus(state, t));
    const relevant = statuses.filter((s) => !s.skipped);
    return { ...phase, total: relevant.length, done: relevant.filter((s) => s.done).length, items };
  });
}

export function overallProgress(state) {
  const statuses = allTasks(state).map((t) => taskStatus(state, t)).filter((s) => !s.skipped);
  return { done: statuses.filter((s) => s.done).length, total: statuses.length };
}

// The phase you're currently in, by date (or by first unfinished phase without one).
export function currentPhase(state) {
  const progress = phaseProgress(state);
  return progress.find((p) => p.done < p.total) || progress[progress.length - 1];
}

// ---------- vendors & quotes

export function chosenQuote(vendor) {
  if (!vendor.quotes || !vendor.quotes.length) return null;
  return vendor.quotes.find((q) => q.id === vendor.chosenQuoteId) || vendor.quotes[0];
}

export function vendorCost(vendor) {
  const q = chosenQuote(vendor);
  return q && q.total ? Number(q.total) : null;
}

export function vendorsIn(state, category) {
  return state.vendors.filter((v) => v.category === category);
}

// ---------- budget

export function budgetSummary(state) {
  const total = Number(state.wedding.budget) || 0;
  const lines = BUDGET_LINES.map((line) => {
    const allocated = state.budget.allocations[line.key] ?? Math.round((total * line.budgetPct) / 100);
    const booked = state.vendors.filter((v) => v.category === line.key && v.status === 'booked');
    const vendorCommitted = booked.reduce((sum, v) => sum + (vendorCost(v) || 0), 0);
    const extras = state.budget.extras.filter((e) => (e.category || 'other') === line.key);
    const extrasCommitted = extras.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const vendorIds = new Set(booked.map((v) => v.id));
    const paid = state.payments.filter((p) => p.paid && ((p.vendorId && vendorIds.has(p.vendorId)) || (!p.vendorId && (p.category || 'other') === line.key))).reduce((s, p) => s + (Number(p.amount) || 0), 0)
      + extras.filter((e) => e.paid).reduce((s, e) => s + (Number(e.amount) || 0), 0);
    return { ...line, allocated, committed: vendorCommitted + extrasCommitted, paid, booked, extras };
  });
  const allocated = lines.reduce((s, l) => s + l.allocated, 0);
  const committed = lines.reduce((s, l) => s + l.committed, 0);
  const paid = lines.reduce((s, l) => s + l.paid, 0);
  return { total, lines, allocated, committed, paid, remaining: total - committed };
}

export function upcomingPayments(state, days = 60) {
  const now = today();
  return state.payments
    .filter((p) => !p.paid && p.due)
    .map((p) => ({ ...p, daysLeft: daysBetween(now, parseDay(p.due)), vendor: state.vendors.find((v) => v.id === p.vendorId) }))
    .filter((p) => p.daysLeft <= days)
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

// ---------- guests

export function guestStats(state) {
  const g = state.guests;
  const invited = g.filter((x) => x.rsvp !== 'not_sent');
  const yes = g.filter((x) => x.rsvp === 'yes');
  const meals = {};
  for (const x of yes) if (x.meal) meals[x.meal] = (meals[x.meal] || 0) + 1;
  return {
    total: g.length,
    invited: invited.length,
    planning: g.length - invited.length,
    yes: yes.length,
    no: g.filter((x) => x.rsvp === 'no').length,
    pending: g.filter((x) => x.rsvp === 'pending').length,
    kids: g.filter((x) => x.child).length,
    aList: g.filter((x) => x.list !== 'B').length,
    bList: g.filter((x) => x.list === 'B').length,
    p1: g.filter((x) => x.side === 'p1').length,
    p2: g.filter((x) => x.side === 'p2').length,
    both: g.filter((x) => x.side === 'both').length,
    meals,
    dietary: yes.filter((x) => x.dietary).length,
    // Rough expected turnout: confirmed + 85% of pending + 85% of not-yet-sent.
    expected: Math.round(yes.length + 0.85 * g.filter((x) => x.rsvp === 'pending' || x.rsvp === 'not_sent').length),
  };
}

// People who should get a seat: everyone except declines.
export function seatableGuests(state) {
  return state.guests.filter((g) => g.rsvp !== 'no');
}

export function sideLabel(state, side) {
  const { partner1, partner2 } = state.wedding;
  if (side === 'p1') return partner1 || 'Partner 1';
  if (side === 'p2') return partner2 || 'Partner 2';
  return 'Both';
}

export function coupleName(state) {
  const { partner1, partner2 } = state.wedding;
  if (partner1 && partner2) return `${partner1} & ${partner2}`;
  return partner1 || partner2 || 'Your wedding';
}

export function daysToGo(state) {
  const d = parseDay(state.wedding.date);
  return d ? daysBetween(today(), d) : null;
}

export { CATEGORIES, dayString };
