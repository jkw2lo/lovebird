// Every kind of vendor a wedding might need, with what a good planner would
// tell you about each: its usual share of the budget, the details worth
// comparing between quotes, and the questions to ask before signing.
//
// budgetPct values are typical US splits and add up to 100 with the cushion line.

export const CATEGORIES = [
  {
    key: 'venue', label: 'Venue', emoji: '🏛️', budgetPct: 20, essential: true,
    blurb: 'Where the ceremony and reception happen. It sets your date, capacity, and often your caterer.',
    fields: ['Max guests', 'Hours included', 'Catering', 'Ceremony on site', 'Rain plan', 'Minimum spend', 'End time / curfew', 'Getting-ready rooms'],
    questions: [
      'Is our date available, and can you hold it while we decide? For how long?',
      'What exactly is included: tables, chairs, linens, staff, setup and cleanup?',
      'Do we have to use your caterer, or a list of approved ones? Is there an outside-catering fee?',
      'What is the food and drink minimum, and what is the service charge and tax on top?',
      'What is the rain or weather backup plan, and when do we have to decide on it?',
      'What time can vendors arrive, and when does everything need to be out?',
      'Is there a day-of coordinator included, or do we need our own?',
      'What does the cancellation and postponement policy say?',
    ],
  },
  {
    key: 'catering', label: 'Catering & bar', emoji: '🍽️', budgetPct: 21, essential: true,
    blurb: 'Food, drinks and the people serving them. Often the biggest line after the venue, and sometimes bundled with it.',
    fields: ['Price per person', 'Service style', 'Bar package', 'Service charge & tax', 'Tasting', 'Staff included', 'Cake cutting fee'],
    questions: [
      'What is the per-person price, and what does that include (appetizers, courses, coffee)?',
      'What service charge, gratuity and tax get added? Is the service charge the staff tip?',
      'How many servers and bartenders per guest?',
      'When is the tasting, and is it included?',
      'How do you handle allergies and dietary needs (vegetarian, gluten-free, kids)?',
      'Is the bar priced per person or by consumption? Can we bring our own alcohol?',
      'Do you provide plates, glassware and linens, or do we rent them?',
      'When do you need the final headcount?',
    ],
  },
  {
    key: 'photography', label: 'Photographer', emoji: '📷', budgetPct: 10, essential: true,
    blurb: 'The photos are what you keep. The best photographers book a year or more ahead.',
    fields: ['Hours of coverage', 'Second shooter', 'Engagement session', 'Edited photos', 'Delivery time', 'Album'],
    questions: [
      'Can we see two or three complete wedding galleries, not just highlights?',
      'How many hours of coverage are included, and what is the overtime rate?',
      'Is a second shooter included?',
      'How many edited photos should we expect, and how long until we get them?',
      'Do we get full printing rights?',
      'What do you need from us: a shot list, a timeline, a point person for family photos?',
      'Will you be the one shooting, or an associate?',
    ],
  },
  {
    key: 'videography', label: 'Videographer', emoji: '🎥', budgetPct: 4, essential: false,
    blurb: 'Optional, but couples who skip it often say it is their biggest regret.',
    fields: ['Hours of coverage', 'Final film length', 'Raw footage', 'Drone', 'Delivery time'],
    questions: [
      'Can we see a full-length film, not only the teaser?',
      'How long is the final film, and do we get the full ceremony and speeches?',
      'Do you record audio from the officiant and speeches directly?',
      'Do we get the raw footage?',
      'How long until delivery?',
    ],
  },
  {
    key: 'planner', label: 'Planner / coordinator', emoji: '📋', budgetPct: 6, essential: false,
    blurb: 'A full planner runs the whole process. A day-of coordinator takes over in the final weeks so you can be a guest at your own wedding.',
    fields: ['Level of service', 'When they start', 'Day-of hours', 'Assistants', 'Vendor recommendations'],
    questions: [
      'Is this full planning, partial planning, or day-of (month-of) coordination?',
      'How many meetings or calls are included?',
      'How many weddings do you take on the same weekend?',
      'Who will be there on the day, and for how many hours?',
      'Do you get vendor discounts or take commissions from vendors you recommend?',
    ],
  },
  {
    key: 'florals', label: 'Florals & decor', emoji: '💐', budgetPct: 8, essential: true,
    blurb: 'Bouquets, ceremony arrangements, centerpieces, and often candles and other decor.',
    fields: ['Bouquets & boutonnieres', 'Centerpieces', 'Ceremony pieces', 'Setup & breakdown', 'Delivery fee'],
    questions: [
      'What will be in season for our date?',
      'Can ceremony arrangements be moved to the reception?',
      'Do you provide vases, candles and other decor, or just flowers?',
      'Are delivery, setup and breakdown included?',
      'What happens if a flower we chose is not available?',
    ],
  },
  {
    key: 'music', label: 'Band / DJ', emoji: '🎶', budgetPct: 6, essential: true,
    blurb: 'Music for the ceremony, cocktail hour and dancing, plus someone to make announcements.',
    fields: ['Type', 'Hours', 'Ceremony & cocktail sound', 'MC duties', 'Overtime rate', 'Lighting'],
    questions: [
      'Can we see video of you performing at a wedding?',
      'Do you cover the ceremony and cocktail hour too, with separate sound?',
      'Will you act as MC and handle announcements?',
      'Do you take must-play and do-not-play lists?',
      'What do you need from the venue (power, space, load-in time)?',
      'What is the overtime rate if the party runs late?',
    ],
  },
  {
    key: 'attire', label: 'Attire', emoji: '👗', budgetPct: 6, essential: true,
    blurb: 'What you both wear. Gowns can take four to six months to arrive, plus alterations.',
    fields: ['Designer / style', 'Alterations', 'Lead time', 'Fittings'],
    questions: [
      'How long does it take to arrive once ordered?',
      'Are alterations done in-house, and roughly what do they cost?',
      'How many fittings should we plan for?',
      'What is the return or exchange policy?',
    ],
  },
  {
    key: 'beauty', label: 'Hair & makeup', emoji: '💄', budgetPct: 2, essential: false,
    blurb: 'Usually booked six to eight months out, with a trial two to three months before.',
    fields: ['Services', 'People included', 'Trial', 'Travel fee', 'Touch-ups'],
    questions: [
      'Can we see photos of your work on people with similar hair and skin?',
      'Is a trial included, and when should we do it?',
      'How many people can you get ready, and how long does each take?',
      'Do you come to us? Is there a travel or early-start fee?',
      'Do you stay for touch-ups?',
    ],
  },
  {
    key: 'cake', label: 'Cake & desserts', emoji: '🎂', budgetPct: 2, essential: false,
    blurb: 'A cake, a dessert table, or both.',
    fields: ['Servings', 'Flavors', 'Tasting', 'Delivery & setup', 'Price per slice'],
    questions: [
      'What is the price per slice, and is there a minimum?',
      'Can we taste before booking?',
      'Are delivery and setup included? Will it hold up outdoors?',
      'Do you need anything from the venue (table, fridge, knife)?',
    ],
  },
  {
    key: 'stationery', label: 'Stationery', emoji: '✉️', budgetPct: 2, essential: true,
    blurb: 'Save-the-dates, invitations, menus, place cards and signage.',
    fields: ['Pieces included', 'Quantity', 'Printing method', 'Turnaround', 'Addressing'],
    questions: [
      'What is the turnaround from approved proof to printed pieces?',
      'Can you address envelopes, or recommend a calligrapher?',
      'How much are extras if we need more later?',
      'Can the same design carry through to menus, signs and place cards?',
    ],
  },
  {
    key: 'rentals', label: 'Rentals', emoji: '🪑', budgetPct: 3, essential: false,
    blurb: 'Tables, chairs, linens, tableware, tents or lounge furniture the venue does not provide.',
    fields: ['Items', 'Delivery & pickup', 'Damage waiver'],
    questions: [
      'Are delivery, setup and pickup included, and at what times?',
      'Is there a damage waiver?',
      'Do dishes need to be rinsed before return?',
      'When do you need final quantities?',
    ],
  },
  {
    key: 'officiant', label: 'Officiant', emoji: '📜', budgetPct: 1, essential: true,
    blurb: 'Whoever marries you. A friend can often get ordained online; check your local rules.',
    fields: ['Ceremony style', 'Meetings', 'Rehearsal', 'Files the license'],
    questions: [
      'Can we personalize the ceremony, readings and vows?',
      'How many times will we meet beforehand?',
      'Will you attend the rehearsal?',
      'Will you sign and file the marriage license?',
    ],
  },
  {
    key: 'transport', label: 'Transportation', emoji: '🚐', budgetPct: 2, essential: false,
    blurb: 'Getting you, your wedding party, and maybe your guests between places.',
    fields: ['Vehicle type', 'Passengers', 'Hours', 'Minimum hours'],
    questions: [
      'Is there a minimum number of hours?',
      'Is gratuity included?',
      'What happens if the vehicle breaks down?',
    ],
  },
  {
    key: 'rings', label: 'Rings', emoji: '💍', budgetPct: 2, essential: true,
    blurb: 'Wedding bands. Leave two to three months for sizing and engraving.',
    fields: ['Metal', 'Width / style', 'Sizing', 'Engraving', 'Lead time'],
    questions: [
      'How long does sizing or a custom order take?',
      'Is resizing included later?',
      'Is there a warranty or cleaning plan?',
    ],
  },
  {
    key: 'favors', label: 'Favors & gifts', emoji: '🎁', budgetPct: 1, essential: false,
    blurb: 'Guest favors, welcome bags, and thank-you gifts for your wedding party and parents.',
    fields: ['Item', 'Quantity', 'Price per piece'],
    questions: ['How long does production and shipping take?', 'Is there a minimum order?'],
  },
  {
    key: 'extras', label: 'Extras & experiences', emoji: '🎉', budgetPct: 2, essential: false,
    blurb: 'Food stations, games, keepsakes and traditions: bubble tea, a claw machine, a photo booth, a lion dance. Browse ideas under Extras.',
    fields: ['What it is', 'Hours', 'Guests served', 'Delivery & setup'],
    questions: [
      'What\u2019s included: staff, supplies, delivery, setup and pickup?',
      'How much space and power do you need, and how early do you arrive?',
      'Do you carry liability insurance? (Many venues require a certificate.)',
      'How many guests can you serve per hour?',
      'What happens if something breaks or runs out during the event?',
    ],
  },
  {
    key: 'hotel', label: 'Hotel blocks', emoji: '🏨', budgetPct: 0, essential: false,
    blurb: 'Discounted rooms held for your guests. Guests usually pay for their own rooms.',
    fields: ['Rooms held', 'Group rate', 'Cutoff date', 'Attrition', 'Shuttle'],
    questions: [
      'Is this a courtesy block (no penalty for unbooked rooms) or are we on the hook?',
      'When is the cutoff date for the group rate?',
      'Is there a shuttle to the venue?',
      'Can guests book online with a link?',
    ],
  },
];

export const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

// The budget is split across these lines: every vendor category plus a cushion.
export const BUDGET_LINES = [
  ...CATEGORIES.filter((c) => c.budgetPct > 0).map(({ key, label, emoji, budgetPct }) => ({ key, label, emoji, budgetPct })),
  { key: 'other', label: 'Cushion', emoji: '🧾', budgetPct: 2 },
];

export const VENDOR_STATUSES = [
  { key: 'idea', label: 'Saved', hint: 'Just a link for now' },
  { key: 'contacted', label: 'Contacted', hint: 'Reached out, waiting to hear back' },
  { key: 'quoted', label: 'Quote in', hint: 'You have pricing' },
  { key: 'meeting', label: 'Meeting', hint: 'Call, tour or tasting scheduled' },
  { key: 'booked', label: 'Booked', hint: 'Contract signed' },
  { key: 'passed', label: 'Passed', hint: 'Not for you' },
];

export const AVAILABILITY = [
  { key: 'unknown', label: 'Not asked yet' },
  { key: 'available', label: 'Available' },
  { key: 'hold', label: 'Holding our date' },
  { key: 'unavailable', label: 'Not available' },
];

// Map free-text names (Magpie collection names, page categories) onto a vendor category.
const NAME_HINTS = [
  [/venue|barn|estate|vineyard|winery|ballroom|loft|chapel/i, 'venue'],
  [/cater|food|menu|chef|bar\b|drinks|cocktail/i, 'catering'],
  [/photo/i, 'photography'],
  [/video|film/i, 'videography'],
  [/planner|coordinat/i, 'planner'],
  [/flor|flower|bouquet|decor|centerpiece/i, 'florals'],
  [/\bring|wedding band|jewel/i, 'rings'],
  [/\bband\b|\bdj\b|music|quartet/i, 'music'],
  [/dress|gown|suit|tux|attire|veil|shoe|outfit|bridesmaid/i, 'attire'],
  [/hair|makeup|beauty|mua/i, 'beauty'],
  [/cake|dessert|bakery|pastry/i, 'cake'],
  [/invit|stationer|save.the.date|paper|calligraph/i, 'stationery'],
  [/rental|tent|chairs|linen/i, 'rentals'],
  [/officiant|celebrant/i, 'officiant'],
  [/transport|limo|shuttle|car\b|bus\b/i, 'transport'],
  [/favor|gift|welcome bag/i, 'favors'],
  [/hotel|room block|accommodation|stay/i, 'hotel'],
];

export function guessCategory(text) {
  if (!text) return null;
  for (const [re, key] of NAME_HINTS) if (re.test(text)) return key;
  return null;
}

// What each "top priority" means for the budget: those categories get a bigger share.
export const PRIORITY_CATEGORIES = {
  'Food & drink': ['catering', 'cake'],
  'Photos & video': ['photography', 'videography'],
  'Music & dancing': ['music'],
  'The venue': ['venue', 'rentals'],
  'Outfits': ['attire', 'beauty', 'rings'],
  'Flowers & decor': ['florals', 'rentals'],
  'Guest experience': ['catering', 'transport', 'favors'],
  'Keeping costs down': ['other'],
};

// Splits a total across budget lines, giving priority categories about 40% more,
// rounded to the nearest $50 and adjusted so it adds up exactly.
export function suggestSplit(total, priorities = []) {
  const boosted = new Set(priorities.flatMap((p) => PRIORITY_CATEGORIES[p] || []));
  const weights = BUDGET_LINES.map((l) => l.budgetPct * (boosted.has(l.key) ? (l.key === 'other' ? 2 : 1.4) : 1));
  const sum = weights.reduce((a, b) => a + b, 0);
  const amounts = weights.map((w) => Math.round(((total * w) / sum) / 50) * 50);
  const drift = total - amounts.reduce((a, b) => a + b, 0);
  amounts[amounts.length - 1] += drift;
  return Object.fromEntries(BUDGET_LINES.map((l, i) => [l.key, amounts[i]]));
}
