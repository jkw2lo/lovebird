// Optional Claude features: the "Ask your planner" chat, and reading a pasted
// quote or vendor email into quote fields. Both need an API key in Settings.

import Anthropic from '@anthropic-ai/sdk';
import { CATEGORY_BY_KEY } from '../data/categories.js';
import { allTasks, taskStatus, budgetSummary, guestStats, vendorCost, coupleName, daysToGo, currentPhase, upcomingPayments } from './derive.js';
import { fmtDate, dayString, today } from './util.js';

export { MODELS } from './models.js';

function client(apiKey) {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 });
}

function withModelOptions(params, model, effort) {
  params.model = model;
  // Haiku 4.5 doesn't take an effort setting; the newer models do.
  if (model !== 'claude-haiku-4-5') params.output_config = { ...(params.output_config || {}), effort };
  if (model === 'claude-opus-5') {
    // If a safety classifier declines, let the API retry on a suitable fallback model.
    params.betas = ['server-side-fallback-2026-07-01'];
    params.fallbacks = 'default';
  }
  return params;
}

export function friendlyError(err) {
  if (err instanceof Anthropic.AuthenticationError) return 'Your Anthropic API key was rejected. Check it in Settings.';
  if (err instanceof Anthropic.PermissionDeniedError) return 'This API key does not have access to the selected model.';
  if (err instanceof Anthropic.RateLimitError) return 'Hit the API rate limit. Try again in a minute.';
  if (err instanceof Anthropic.BadRequestError) return `The API rejected the request: ${err.message}`;
  if (err instanceof Anthropic.APIConnectionError) return 'Could not reach the Anthropic API. Check your connection.';
  if (err instanceof Anthropic.APIError) return `Anthropic API error (${err.status ?? 'unknown'}): ${err.message}`;
  return err && err.message ? err.message : String(err);
}

// ---------- the planner chat

const PLANNER_PROMPT = `You are the wedding planner inside Lovebird, a planning app a couple uses to run their whole wedding. Think of yourself as an experienced, warm, practical planner who has done hundreds of weddings: you know what order things happen in, what things really cost, what vendors' contracts hide, and how to keep a couple calm.

You can see a snapshot of their plan below: their details, where they are in the plan, vendors they are considering or have booked, their budget, and their guest list numbers. Use it. Refer to their actual vendors, numbers and dates rather than giving generic advice, and point out anything that looks off (a hold about to expire, a payment due, a budget line running over, a step that is overdue).

How to answer:
- Lead with the answer or the recommendation, then the reasoning in a sentence or two.
- Be specific and concrete. Prefer "Book the photographer next; your two best options are X and Y, and Y is holding your date until Mar 3" over a list of general considerations.
- Keep it short: a few sentences, or a short list when there are genuinely several items. Use **bold** sparingly and simple "- " bullets. No headings.
- Typical costs are US averages unless they say otherwise; say so when quoting them and note that it varies a lot by region.
- If something depends on local law (marriage licenses, officiants), say what is typical and tell them to check their county or country.
- You cannot change their plan yourself. When something should be done in the app, tell them where (Plan, Vendors, Budget, Guests, Seating, Saves, Day-of).`;

export function planSnapshot(state) {
  const w = state.wedding;
  const lines = [];
  lines.push(`Today: ${fmtDate(today())}`);
  lines.push(`Couple: ${coupleName(state)}`);
  const dtg = daysToGo(state);
  lines.push(w.date ? `Wedding date: ${fmtDate(w.date)} (${dtg} days away)` : `Wedding date: not set yet${w.dateIdeas ? ` (thinking: ${w.dateIdeas})` : ''}`);
  if (w.city) lines.push(`Location: ${w.city}`);
  lines.push(`Estimated guests: ${w.guestEstimate}; total budget: $${Number(w.budget || 0).toLocaleString()}`);
  if (w.style) lines.push(`Style: ${w.style}`);
  if (w.priorities && w.priorities.length) lines.push(`Top priorities: ${w.priorities.join(', ')}`);
  if (w.hobbies && w.hobbies.length) lines.push(`Their hobbies: ${w.hobbies.join(', ')} (see the Extras page for hobby ideas)`);
  if (w.notes) lines.push(`Notes: ${w.notes}`);

  const phase = currentPhase(state);
  lines.push('', `Current phase: ${phase.label} (${phase.when})`);
  const tasks = allTasks(state).map((t) => ({ t, s: taskStatus(state, t) }));
  const open = tasks.filter((x) => !x.s.done && !x.s.skipped).slice(0, 12);
  lines.push('Next open steps:');
  for (const { t, s } of open) lines.push(`- ${t.title}${s.due ? ` (due ${fmtDate(s.due)}${s.daysLeft < 0 ? ', OVERDUE' : ''})` : ''}${t.optional ? ' [optional]' : ''}`);
  const done = tasks.filter((x) => x.s.done).map((x) => x.t.title);
  if (done.length) lines.push(`Done: ${done.join('; ')}`);

  lines.push('', 'Vendors:');
  if (!state.vendors.length) lines.push('- none added yet');
  for (const v of state.vendors) {
    const cat = CATEGORY_BY_KEY[v.category];
    const cost = vendorCost(v);
    const bits = [cat ? cat.label : v.category, v.status];
    if (v.availability !== 'unknown') bits.push(`availability: ${v.availability}${v.availability === 'hold' && v.holdUntil ? ` until ${v.holdUntil}` : ''}`);
    if (cost) bits.push(`quote $${cost.toLocaleString()}`);
    else if (v.startingPrice) bits.push(`listed ${v.startingPrice}`);
    if (v.rating) bits.push(`${v.rating}/5`);
    lines.push(`- ${v.name || 'Unnamed'} (${bits.join(', ')})${v.notes ? ` — ${v.notes.slice(0, 160)}` : ''}`);
  }

  const b = budgetSummary(state);
  lines.push('', `Budget: $${b.total.toLocaleString()} total, $${b.committed.toLocaleString()} committed, $${b.paid.toLocaleString()} paid`);
  for (const l of b.lines) if (l.committed || state.budget.allocations[l.key] !== undefined) lines.push(`- ${l.label}: target $${l.allocated.toLocaleString()}, committed $${l.committed.toLocaleString()}`);
  const due = upcomingPayments(state, 90);
  if (due.length) {
    lines.push('Payments due soon:');
    for (const p of due) lines.push(`- ${p.label}${p.vendor ? ` (${p.vendor.name})` : ''}: $${Number(p.amount).toLocaleString()} on ${p.due}`);
  }

  const g = guestStats(state);
  lines.push('', `Guests: ${g.total} on the list (${g.aList} A-list, ${g.bList} B-list), ${g.invited} invited, ${g.yes} yes, ${g.no} no, ${g.pending} awaiting reply; expected turnout about ${g.expected}`);
  if (state.tables.length) {
    const seated = state.guests.filter((x) => x.tableId).length;
    lines.push(`Seating: ${state.tables.length} tables, ${seated} guests seated`);
  }
  if (state.dayof.length) lines.push(`Day-of timeline has ${state.dayof.length} entries`);
  return lines.join('\n');
}

/**
 * Streams a reply. `history` is [{ role: 'user'|'assistant', content: string }].
 * Calls onText with the growing reply; resolves to the final text.
 */
export async function askPlanner({ state, history, onText, signal }) {
  const { apiKey, model } = state.settings;
  const params = withModelOptions({
    max_tokens: 16000,
    system: [
      { type: 'text', text: PLANNER_PROMPT },
      { type: 'text', text: `<plan_snapshot>\n${planSnapshot(state)}\n</plan_snapshot>` },
    ],
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  }, model, 'medium');

  let text = '';
  try {
    const stream = client(apiKey).beta.messages.stream(params, { signal });
    stream.on('text', (delta) => {
      text += delta;
      onText(text);
    });
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') throw new Error('Claude declined to answer that one.');
    return text;
  } catch (err) {
    if (signal && signal.aborted) return text;
    throw new Error(friendlyError(err));
  }
}

// ---------- reading a quote

const nullable = (schema) => ({ anyOf: [schema, { type: 'null' }] });

const QUOTE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['vendor_name', 'package_name', 'total', 'deposit', 'deposit_due', 'balance_due', 'includes', 'availability', 'hold_until', 'contact', 'fields', 'notes'],
  properties: {
    vendor_name: nullable({ type: 'string' }),
    package_name: nullable({ type: 'string' }),
    total: nullable({ type: 'number' }),
    deposit: nullable({ type: 'number' }),
    deposit_due: nullable({ type: 'string' }),
    balance_due: nullable({ type: 'string' }),
    includes: { type: 'string' },
    availability: { type: 'string', enum: ['unknown', 'available', 'hold', 'unavailable'] },
    hold_until: nullable({ type: 'string' }),
    contact: {
      type: 'object', additionalProperties: false, required: ['name', 'email', 'phone'],
      properties: { name: nullable({ type: 'string' }), email: nullable({ type: 'string' }), phone: nullable({ type: 'string' }) },
    },
    fields: {
      type: 'array',
      items: { type: 'object', additionalProperties: false, required: ['label', 'value'], properties: { label: { type: 'string' }, value: { type: 'string' } } },
    },
    notes: { type: 'string' },
  },
};

export async function readQuote({ state, text, category }) {
  const { apiKey, model } = state.settings;
  const cat = CATEGORY_BY_KEY[category];
  const prompt = `A couple planning their wedding pasted this from a ${cat ? cat.label.toLowerCase() : 'wedding vendor'} (a quote, proposal, price sheet or email). Pull out the pricing so they can compare it against other vendors.

Their wedding date: ${state.wedding.date || 'not set'}. Estimated guests: ${state.wedding.guestEstimate}. Today is ${dayString(today())}.

Rules:
- Only use what the text supports; use null when something isn't stated. Don't guess prices.
- total: the full price for what is being quoted, in dollars, including any service charges or fees the text adds up, as a plain number. If several packages are offered, use the one the text recommends or the middle one, put its name in package_name, and mention the others in notes.
- deposit: the amount due to book, as a number. If given as a percentage, work out the amount.
- deposit_due and balance_due: dates as YYYY-MM-DD. Work out relative dates ("balance due 30 days before the wedding") from the wedding date when you can; otherwise null.
- includes: one or two plain sentences on what is included.
- availability: "available" if they say the date is open, "hold" if they are holding it (with hold_until as YYYY-MM-DD if stated), "unavailable" if it's taken, otherwise "unknown".
- fields: values for these comparison labels when the text supports them, using these exact labels: ${cat ? cat.fields.join(', ') : 'none'}. Keep each value short (under 50 characters). Skip labels the text doesn't cover.
- notes: anything else worth knowing before signing (overtime rates, travel fees, cancellation terms, what's extra), in a sentence or two. Empty string if nothing.

<pasted>
${text}
</pasted>`;

  const params = withModelOptions({
    max_tokens: 16000,
    messages: [{ role: 'user', content: prompt }],
    output_config: { format: { type: 'json_schema', schema: QUOTE_SCHEMA } },
  }, model, 'low');

  let response;
  try {
    response = await client(apiKey).beta.messages.create(params);
  } catch (err) {
    throw new Error(friendlyError(err));
  }
  if (response.stop_reason === 'refusal') throw new Error('Claude declined to read this one.');
  if (response.stop_reason === 'max_tokens') throw new Error('The response was cut off before it finished.');
  const block = response.content.find((b) => b.type === 'text');
  if (!block) throw new Error('Claude returned nothing.');
  return JSON.parse(block.text);
}
