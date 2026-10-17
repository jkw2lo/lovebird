import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VENUE_COORDS } from '../data/venues/coords.js';

// The venue directory as a map. Pins are coloured by budget fit; click one to
// open its details. Standard OpenStreetMap tiles (no API key needed), toned down
// with CSS to suit the app, and inverted in dark mode.

const TONE_COLOR = { green: 'var(--accent-2)', gold: 'var(--gold)', warn: 'var(--warn)', danger: 'var(--danger)' };
const k = (n) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);

export default function VenueMap({ rows, added, guests, currency, onOpen }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);

  useEffect(() => {
    map.current = L.map(el.current, { scrollWheelZoom: false, zoomControl: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    // Scroll-zoom only once the map has been clicked, so the page still scrolls normally.
    map.current.on('click', () => map.current.scrollWheelZoom.enable());
    map.current.on('mouseout', () => map.current.scrollWheelZoom.disable());
    return () => map.current.remove();
  }, []);

  useEffect(() => {
    const group = layer.current;
    group.clearLayers();
    const points = [];
    for (const { v, est, fit } of rows) {
      const pos = VENUE_COORDS[v.id];
      if (!pos) continue;
      points.push(pos);
      const color = fit ? TONE_COLOR[fit.tone] : 'var(--muted)';
      const isAdded = added.has(v.id);
      const icon = L.divIcon({
        className: '',
        html: `<span class="map-pin${isAdded ? ' added' : ''}" style="--pin:${color}"></span>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const price = est ? `≈ ${k(est.allInLow)}–${k(est.allInHigh)} ${currency} for ${guests}` : 'Pricing on request';
      const safe = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      L.marker(pos, { icon, title: v.name, keyboard: true })
        .bindTooltip(`<strong>${safe(v.name)}</strong><br>${safe(v.area)} · seats ${v.seated}<br>${safe(price)}${fit ? ` · ${safe(fit.label)}` : ''}${isAdded ? '<br>✓ In your options' : ''}`, { direction: 'top', offset: [0, -10] })
        .on('click', () => onOpen(v.id))
        .addTo(group);
    }
    if (points.length === 1) map.current.setView(points[0], 14);
    else if (points.length) map.current.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
  }, [rows, added, guests, currency, onOpen]);

  return (
    <div className="stack tight">
      <div ref={el} className="venue-map" role="region" aria-label="Map of venues" />
      <div className="row wrap tiny muted" style={{ gap: 12 }}>
        <span className="row" style={{ gap: 5 }}><span className="map-pin legend" style={{ '--pin': 'var(--accent-2)' }} /> Fits your budget</span>
        <span className="row" style={{ gap: 5 }}><span className="map-pin legend" style={{ '--pin': 'var(--gold)' }} /> Could fit</span>
        <span className="row" style={{ gap: 5 }}><span className="map-pin legend" style={{ '--pin': 'var(--warn)' }} /> A stretch</span>
        <span className="row" style={{ gap: 5 }}><span className="map-pin legend" style={{ '--pin': 'var(--danger)' }} /> Over budget</span>
        <span className="row" style={{ gap: 5 }}><span className="map-pin legend added" style={{ '--pin': 'var(--muted)' }} /> In your options</span>
        <span>Click a pin for details. Click the map to zoom with your scroll wheel.</span>
      </div>
    </div>
  );
}
