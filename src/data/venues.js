// Researched wedding venues, by city: Toronto, New York City and Jersey City,
// researched October 2026. Each city lives in its own file under ./venues/.
//
// Prices come from the venues' own packages where published, otherwise from
// wedding directories (WeddingWire, EventSource, WeddingHero and similar), and
// some are a year or two old. Treat every number as a starting estimate and
// confirm with the venue. Each venue lists its sources.
//
// price.model:
//   'per-person'  food, drink and venue priced per guest (plus any siteFee)
//   'rental'      venue rental only; you bring a caterer (estimated separately)
//   'minimum'     a food-and-drink minimum spend: you pay the minimum or the
//                 per-guest cost (price.perPerson, else typical catering), whichever is higher
//   'quote'       pricing not published; no estimate shown
// view: a short note when the venue has a great view; foodie: known for its food.
// price.inclusive: the per-person price already includes tax and service.
//
// Photos are links, never copies: the venue's own preview image, or a freely
// licensed photo from Wikimedia Commons (credited).

import { TORONTO } from './venues/toronto.js';
import { NEW_YORK } from './venues/new-york.js';
import { JERSEY_CITY } from './venues/jersey-city.js';

export { TORONTO, NEW_YORK, JERSEY_CITY };

export const VENUE_CITIES = [TORONTO, NEW_YORK, JERSEY_CITY];

export const VENUE_TYPES = {
  historic: { label: 'Historic', emoji: '🏛️' },
  industrial: { label: 'Industrial', emoji: '🧱' },
  garden: { label: 'Garden', emoji: '🌿' },
  estate: { label: 'Estate', emoji: '🏡' },
  hotel: { label: 'Hotel', emoji: '🏨' },
  museum: { label: 'Museum', emoji: '🖼️' },
  ballroom: { label: 'Ballroom', emoji: '💃' },
  restaurant: { label: 'Restaurant', emoji: '🍽️' },
  rooftop: { label: 'Rooftop', emoji: '🌇' },
  waterfront: { label: 'Waterfront', emoji: '🌊' },
  park: { label: 'Park', emoji: '🌳' },
  winery: { label: 'Winery', emoji: '🍷' },
};

export const CATERING_LABEL = {
  'in-house': 'In-house catering',
  'approved list': 'Choose from their caterers',
  exclusive: 'Their exclusive caterer',
  outside: 'Bring your own caterer',
};

/**
 * Rough venue + food & drink estimate for a guest count, as [low, high] before
 * tax and service, plus an all-in [low, high]. Rental venues add typical
 * outside catering.
 */
export function venueEstimate(city, venue, guests) {
  const p = venue.price;
  if (p.model === 'quote') return null;
  const fee = p.siteFee || [0, 0];
  let low, high, minimumApplies = false;
  if (p.model === 'minimum') {
    const pp = p.perPerson || city.outsideCatering;
    low = Math.max(p.minimum[0], pp[0] * guests) + fee[0];
    high = Math.max(p.minimum[1], pp[1] * guests) + fee[1];
    minimumApplies = p.minimum[0] > pp[0] * guests || p.minimum[1] > pp[1] * guests;
  } else if (p.model === 'per-person') {
    low = p.low * guests + fee[0];
    high = p.high * guests + fee[1];
  } else {
    low = p.low + city.outsideCatering[0] * guests;
    high = p.high + city.outsideCatering[1] * guests;
  }
  const factor = p.inclusive ? 1 : city.allInFactor;
  const round = (n) => Math.round(n / 500) * 500;
  return { low: round(low), high: round(high), allInLow: round(low * factor), allInHigh: round(high * factor), includesCatering: p.model !== 'rental', minimumApplies };
}

export function cityFor(text) {
  return VENUE_CITIES.find((c) => c.match.test(text || '')) || null;
}
