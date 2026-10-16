import { useEffect, useRef, useSyncExternalStore } from 'react';
import { getState, update, useAppState } from '../lib/store.js';
import { phaseProgress } from '../lib/derive.js';
import { CATEGORY_BY_KEY } from '../data/categories.js';

// A burst of confetti and a big message for the moments worth marking:
// booking a vendor, finishing a phase, everyone RSVP'd.

let current = null;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

export function celebrate(title, subtitle = '', emoji = '🎉') {
  current = { title, subtitle, emoji, id: Date.now() };
  emit();
}

// Celebrate something only the first time it happens.
export function celebrateOnce(key, title, subtitle, emoji) {
  const state = getState();
  if (state.celebrated.includes(key)) return;
  update((s) => { s.celebrated.push(key); });
  celebrate(title, subtitle, emoji);
}

const COLORS = ['#a24f5a', '#d77f89', '#b48a4e', '#7f9273', '#f4e3e2', '#e9c46a'];

export function Celebrations() {
  const c = useSyncExternalStore((fn) => { listeners.add(fn); return () => listeners.delete(fn); }, () => current);
  const canvas = useRef(null);

  useEffect(() => {
    if (!c) return;
    const done = setTimeout(() => { current = null; emit(); }, 3200);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = canvas.current;
    if (!el || reduced) return () => clearTimeout(done);
    const ctx = el.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    el.width = window.innerWidth * dpr;
    el.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const w = window.innerWidth;
    const pieces = Array.from({ length: 160 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 16 - 6,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      round: Math.random() < 0.3,
    }));
    let frame;
    const start = performance.now();
    const tick = (t) => {
      ctx.clearRect(0, 0, w, window.innerHeight);
      const fade = Math.max(0, 1 - (t - start) / 2800);
      for (const p of pieces) {
        p.vy += 0.42;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (fade > 0) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); clearTimeout(done); };
  }, [c]);

  if (!c) return null;
  return (
    <div className="celebrate" onClick={() => { current = null; emit(); }} role="status">
      <canvas ref={canvas} />
      <div className="celebrate-card">
        <div className="celebrate-emoji">{c.emoji}</div>
        <h2>{c.title}</h2>
        {c.subtitle && <p className="ink2">{c.subtitle}</p>}
      </div>
    </div>
  );
}

// Watches the plan and celebrates milestones as they happen, wherever they happen.
export function Milestones() {
  const state = useAppState();
  const booked = useRef(null);

  useEffect(() => {
    // Booking a vendor: celebrate each new one (not the ones already booked when the app opened).
    const now = new Set(state.vendors.filter((v) => v.status === 'booked').map((v) => v.id));
    if (booked.current) {
      for (const id of now) {
        if (!booked.current.has(id)) {
          const v = state.vendors.find((x) => x.id === id);
          const cat = CATEGORY_BY_KEY[v.category];
          const total = state.vendors.filter((x) => x.status === 'booked').length;
          celebrate(`${v.name} is booked!`, `${cat.label} ✓ · that's ${total} vendor${total === 1 ? '' : 's'} on your team.`, cat.emoji);
        }
      }
    }
    booked.current = now;

    // Finishing a phase of the plan.
    for (const p of phaseProgress(state)) {
      if (p.total > 0 && p.done === p.total) celebrateOnce(`phase:${p.key}`, `${p.label}: done!`, 'One whole phase of your plan, finished.', '🌿');
    }

    // Every RSVP in.
    const g = state.guests;
    if (g.length >= 5 && g.every((x) => x.rsvp === 'yes' || x.rsvp === 'no')) {
      celebrateOnce('rsvps-all-in', 'Every RSVP is in!', `${g.filter((x) => x.rsvp === 'yes').length} people are coming. Time for the seating chart.`, '💌');
    }

    // Everyone attending has a seat.
    const coming = g.filter((x) => x.rsvp === 'yes');
    if (coming.length >= 5 && state.tables.length && coming.every((x) => x.tableId)) {
      celebrateOnce('all-seated', 'Everyone has a seat', 'The seating chart is done. Print it from Seating.', '🪑');
    }
  }, [state]);

  return null;
}
