// Extras & experiences: the things guests remember. Researched October 2026.
//
// Costs are mostly Toronto/GTA prices (CAD) unless a note says US; New York and
// New Jersey are usually similar or a little higher in USD. They're starting
// points for budgeting, not quotes. cost is null where it depends too much on
// what you choose to give a fair range.
//
// cost.unit: 'flat' (one price for the event), 'per-guest', or 'per-hour' (with hours).

export const EXTRA_GROUPS = [
  { key: 'treats', label: 'Food & drink stations', emoji: '🍡' },
  { key: 'fun', label: 'Games & entertainment', emoji: '🎮' },
  { key: 'keepsakes', label: 'Keepsakes', emoji: '📸' },
  { key: 'moments', label: 'Big moments & traditions', emoji: '✨' },
  { key: 'comfort', label: 'Guest comfort', emoji: '🧺' },
];

export const EXTRAS = [
  // ---------- food & drink
  {
    id: 'bubble-tea', group: 'treats', emoji: '🧋', name: 'Bubble tea bar',
    blurb: 'A live boba bar with a few flavours and toppings, made to order.',
    cost: { low: 625, high: 950, unit: 'flat', text: 'Packages about $625–$950 in the GTA; premium flavours about $2 more per drink' },
    lead: '1–2 months ahead',
    tips: ['Great at cocktail hour or as a late-night pick-me-up.', 'Ask how many drinks the package covers and the cup size.'],
    search: 'bubble tea catering wedding',
    sources: [{ label: 'Boba Girl packages', url: 'https://www.bobagirl.ca/bubble-tea-catering-packages' }, { label: 'Chafor Tea catering', url: 'https://www.chafortea.com/catering' }],
  },
  {
    id: 'fondue', group: 'treats', emoji: '🫕', name: 'Fondue or chocolate fountain',
    blurb: 'Chocolate fountain with fruit, marshmallows and pretzels, or a warm cheese fondue station.',
    cost: { low: 650, high: 900, unit: 'flat', text: 'Chocolate fountain with dippers and an attendant about $650–$900 for 100 guests (US pricing); cheese fondue as a food station runs more like $50–$75 per person' },
    lead: '1–2 months ahead',
    tips: ['Ask your caterer first; many can add a fondue station to the menu.', 'Put it away from the dance floor (and white dresses).'],
    search: 'chocolate fountain fondue station wedding',
    sources: [{ label: 'The Knot: chocolate fountains', url: 'https://www.theknot.com/content/wedding-chocolate-fountains' }, { label: 'ART Catering', url: 'https://www.artcateringevents.com/weddings/menus/chocolate-fountain' }],
  },
  {
    id: 'late-night', group: 'treats', emoji: '🍟', name: 'Late-night food truck',
    blurb: 'Poutine, pizza, tacos or dumplings rolling up around 10pm, right when everyone’s hungry again.',
    cost: { low: 18, high: 45, unit: 'per-guest', min: 1200, text: 'About $18–$45 per guest in Toronto, with minimums around $1,200–$1,500; poutine and pizza are the crowd favourites' },
    lead: '2–3 months ahead',
    tips: ['Check the venue allows a truck and has somewhere for it to park.', 'You don’t need to feed everyone; plan for about 70% of guests.'],
    search: 'food truck wedding catering',
    sources: [{ label: 'Roaming Hunger: Toronto', url: 'https://roaminghunger.com/blog/19941/toronto-food-truck-rentals' }, { label: 'Food truck wedding costs', url: 'https://app.foodtruckclub.com/curbside/food-truck-wedding-cost' }],
  },
  {
    id: 'gelato', group: 'treats', emoji: '🍨', name: 'Gelato or ice cream cart',
    blurb: 'A cart with a few flavours scooped by staff, perfect for summer weddings.',
    cost: { low: 1500, high: 3000, unit: 'flat', text: 'Toronto gelato carts start around a $1,500 minimum; most single-station weddings land at $1,500–$3,000' },
    lead: '1–2 months ahead',
    tips: ['Pairs well with (or replaces) the wedding cake.', 'Ask about dairy-free flavours for guests who need them.'],
    search: 'gelato cart wedding',
    sources: [{ label: 'Wedding dessert stations in Toronto', url: 'https://lalufunfoods.com/blog/wedding-dessert-stations-toronto' }, { label: 'Cocoa40 gelato cart', url: 'https://www.cocoa40.com/en-us/products/gelato-cart-rental' }],
  },
  {
    id: 'espresso', group: 'treats', emoji: '☕', name: 'Espresso & coffee cart',
    blurb: 'A barista making lattes and espresso, with dessert or before the late-night push.',
    cost: { low: 400, high: 800, unit: 'flat', text: 'Roughly $400–$700 for 150–300 guests (US averages); a Toronto French-style coffee cart rents for about $800' },
    lead: '1–2 months ahead',
    tips: ['Espresso martinis are a fun upgrade if the bar can join in.', 'Check what power the machine needs.'],
    search: 'espresso cart wedding',
    sources: [{ label: 'CostHelper: espresso carts', url: 'https://weddings.costhelper.com/espresso-cart-rental.html' }, { label: 'Toronto Event Rentals', url: 'https://www.torontoeventrentals.com/Coffee-Cart-Rentals/' }],
  },
  {
    id: 'signature-drinks', group: 'treats', emoji: '🍸', name: 'Signature cocktail & mocktail',
    blurb: 'One drink for each of you, named after something personal, with a non-alcoholic version.',
    cost: null, costNote: 'Often free within your bar package; ask your bartender or caterer.',
    lead: 'Decide 1 month ahead',
    tips: ['Use them on the bar sign and menus.', 'Pick ones that can be batched so the line moves.'],
    search: null, sources: [],
  },

  // ---------- games & entertainment
  {
    id: 'claw-machine', group: 'fun', emoji: '🕹️', name: 'Claw machine',
    blurb: 'An arcade claw machine filled with prizes you pick: plushies, mini bottles, custom pins, candy.',
    cost: { low: 900, high: 1200, unit: 'flat', text: 'About $900–$1,200 per machine for the day in the GTA, delivery and setup included; prizes often extra (candy versions from about $500)' },
    lead: '2–3 months ahead',
    tips: ['Fill it with something personal, like tiny versions of your pets or favourite snacks.', 'Make sure the venue has a spot near power with a flat floor.'],
    search: 'claw machine rental wedding',
    sources: [{ label: 'Claw Social (GTA)', url: 'https://clawsocial.ca/' }, { label: 'Superior Events', url: 'https://superiorevents.ca/rentals/arcade-game-rentals/claw-machine/' }, { label: 'Luxury Statues', url: 'https://luxurystatues.com/catalog/sweet-treat-claw-machine-rental/' }],
  },
  {
    id: 'booth-360', group: 'fun', emoji: '🎥', name: '360 video booth',
    blurb: 'A platform with a spinning camera that makes slow-motion videos guests can share right away.',
    cost: { low: 550, high: 800, unit: 'flat', text: '$550 (3 hours) to $800 (5 hours) in Toronto' },
    lead: '2–3 months ahead',
    tips: ['Open it after dinner when energy is high.', 'Needs a 10×10 ft space.'],
    search: '360 photo booth rental wedding',
    sources: [{ label: 'GTA Booth 360 pricing', url: 'https://www.gtabooth360.com/blog/360-photo-booth-rental-cost-toronto' }],
  },
  {
    id: 'caricature', group: 'fun', emoji: '✏️', name: 'Caricature artist',
    blurb: 'Quick, funny portraits of guests during cocktail hour that double as favours.',
    cost: { low: 125, high: 250, unit: 'per-hour', hours: 2, text: '$125–$250 per hour, usually with a 2–3 hour minimum; draws about 12–15 guests an hour' },
    lead: '2–3 months ahead',
    tips: ['Best during cocktail hour, when guests are waiting around.', 'Ask for frames or sleeves so drawings survive the night.'],
    search: 'caricature artist wedding',
    sources: [{ label: 'Caricatures by Kathy', url: 'https://www.caricaturesbykathy.com/post/how-much-does-it-cost-to-hire-a-caricature-artist' }, { label: 'Goofy Faces pricing', url: 'https://goofyfaces.com/pricing/' }],
  },
  {
    id: 'tarot', group: 'fun', emoji: '🔮', name: 'Tarot reader',
    blurb: 'Short, lighthearted readings at a table off to the side.',
    cost: { low: 100, high: 400, unit: 'per-hour', hours: 2, text: '$100–$400 per hour with a 2-hour minimum; a typical booking lands at $250–$700' },
    lead: '1–2 months ahead',
    tips: ['Keep readings short (5 minutes) so more people get one.', 'Ask them to keep it upbeat.'],
    search: 'tarot reader for events',
    sources: [{ label: 'The Knot: tarot at weddings', url: 'https://www.theknot.com/content/tarot-card-reader-wedding' }, { label: 'Event tarot costs', url: 'https://eventtarot.com/tarot-reader-cost-statistics' }],
  },
  {
    id: 'lawn-games', group: 'fun', emoji: '🎯', name: 'Lawn games',
    blurb: 'Giant Jenga, cornhole, croquet or bocce for an outdoor cocktail hour.',
    cost: null, costNote: 'Usually an inexpensive add-on from rental companies, or borrow from friends.',
    lead: '1 month ahead',
    tips: ['Only works with outdoor space and good weather; have a plan B.'],
    search: 'lawn games rental wedding', sources: [],
  },

  // ---------- keepsakes
  {
    id: 'photo-booth', group: 'keepsakes', emoji: '📸', name: 'Photo booth',
    blurb: 'Classic print booth, magic mirror or glam booth with props and instant prints.',
    cost: { low: 400, high: 1500, unit: 'flat', text: 'Most GTA couples pay $400–$1,500 for 3–4 hours; premium booths up to $2,000+' },
    lead: '2–3 months ahead',
    tips: ['Put a copy of each print in a guest book for a ready-made keepsake.', 'Ask if digital copies are included.'],
    search: 'wedding photo booth rental',
    sources: [{ label: 'Toronto photo booth pricing', url: 'https://photoboothto.ca/blog/toronto-wedding-photo-booth-pricing-guide/' }, { label: 'GTA Booth 360', url: 'https://www.gtabooth360.com/blog/how-much-does-a-photo-booth-rental-cost-in-toronto' }],
  },
  {
    id: 'audio-guestbook', group: 'keepsakes', emoji: '☎️', name: 'Audio guest book',
    blurb: 'A vintage phone where guests leave you voice messages.',
    cost: { low: 299, high: 399, unit: 'flat', text: 'From about $299 in Toronto; video guest books from about $399' },
    lead: '1–2 months ahead',
    tips: ['Put a little sign with prompts ("advice for the newlyweds…").', 'Some photo booth packages include one.'],
    search: 'audio guest book rental',
    sources: [{ label: 'Toronto photo booth pricing', url: 'https://photoboothto.ca/blog/photo-booth-rental-toronto-pricing-types-terms-glossary/' }],
  },
  {
    id: 'live-painter', group: 'keepsakes', emoji: '🎨', name: 'Live painter',
    blurb: 'An artist paints a scene from your day while it happens, finished by the end of the night.',
    cost: { low: 1500, high: 4000, unit: 'flat', text: '$1,500–$2,500 for a simple painting of the two of you; $2,500–$4,000 for more detail (up to $8,000 for elaborate scenes)' },
    lead: '4–6 months ahead',
    tips: ['Decide the moment you want painted: first dance, ceremony, or the room.', 'Guests love watching it come together.'],
    search: 'live wedding painter',
    sources: [{ label: 'Live wedding painter costs', url: 'https://fash.com/costs/live-wedding-painter-cost' }],
  },

  // ---------- big moments & traditions
  {
    id: 'cold-sparks', group: 'moments', emoji: '🎇', name: 'Cold sparks',
    blurb: 'Fountains of cool-to-the-touch sparks for the first dance or grand exit, safe indoors.',
    cost: { low: 250, high: 800, unit: 'flat', text: 'About $250–$300 per machine in Toronto; 4-machine packages $600–$750; full service with a technician $800–$2,000' },
    lead: '1–2 months ahead',
    tips: ['Ask your venue first; most allow cold sparks but not real sparklers.', 'Get the vendor’s insurance certificate for the venue.'],
    search: 'cold spark machine rental wedding',
    sources: [{ label: 'Toronto Event Rentals', url: 'https://torontoeventrentals.com/Sparks-Machines-Rentals/' }, { label: 'Abbey Road Entertainment', url: 'https://www.abbeyroadentertainment.com/rentals-and-services/cold-sparkler/' }, { label: 'Cold sparks: safety & cost', url: 'https://sifient.com/blog/cold-sparks-weddings-safety-cost/' }],
  },
  {
    id: 'lion-dance', group: 'moments', emoji: '🦁', name: 'Lion dance',
    blurb: 'A lion dance troupe with drums for good luck, often at the grand entrance or tea ceremony.',
    cost: { low: 400, high: 980, unit: 'flat', text: 'About $400–$980 for a 10–20 minute performance in Toronto' },
    lead: '2–3 months ahead (more around Lunar New Year)',
    tips: ['Give them a clear time slot and coordinate with the DJ.', 'It’s loud: warn older guests and the photographer.'],
    search: 'lion dance troupe wedding',
    sources: [{ label: '3 Owls: lion dances at weddings', url: 'https://www.3owls.ca/lion-dances-at-a-chinese-wedding/' }, { label: 'Lion Dance Toronto prices', url: 'http://www.liondancetoronto.com/current/lion-dance-prices.html' }],
  },
  {
    id: 'dhol', group: 'moments', emoji: '🥁', name: 'Dhol player',
    blurb: 'A live dhol drummer for the baraat, entrances or to kick off the dancing.',
    cost: { low: 120, high: 300, unit: 'flat', text: 'From about $80 for an entrance or $120 per hour, up to about $300 in the Toronto area' },
    lead: '2–3 months ahead',
    tips: ['Two dholis for a big baraat.', 'Coordinate the cue with the DJ.'],
    search: 'dhol player wedding',
    sources: [{ label: 'Dhol player costs', url: 'https://kutchidholi.com/how-much-does-a-dhol-player-cost-for-a-wedding-in-2025/' }, { label: 'South Asian wedding costs (Toronto)', url: 'https://thebigbangevents.com/blog/south-asian-wedding-cost-toronto' }],
  },
  {
    id: 'tea-ceremony', group: 'moments', emoji: '🍵', name: 'Tea ceremony',
    blurb: 'Serving tea to parents and elders, who give their blessings (and red envelopes).',
    cost: null, costNote: 'Mostly a tea set, tea, and a little time in the schedule; no vendor needed.',
    lead: 'Plan 1–2 months ahead',
    tips: ['Usually in the morning or before the reception; put it in the day-of timeline.', 'Assign someone to guide the order of family members.'],
    search: null, sources: [],
  },
  {
    id: 'after-party', group: 'moments', emoji: '🪩', name: 'After-party',
    blurb: 'A bar or lounge nearby for the people who aren’t ready to go home.',
    cost: null, costNote: 'Often just a reserved area and a bar tab you set.',
    lead: '1–2 months ahead',
    tips: ['Pick somewhere walkable from the venue or hotel.', 'Set a tab limit with the bar.'],
    search: null, sources: [],
  },

  // ---------- guest comfort
  {
    id: 'welcome-bags', group: 'comfort', emoji: '🛍️', name: 'Welcome bags',
    blurb: 'Snacks, water, a local treat and the schedule, waiting in out-of-town guests’ hotel rooms.',
    cost: null, costNote: 'Depends entirely on what you put in; a few local snacks and water are plenty.',
    lead: '1 month ahead',
    tips: ['Hotels may charge a small fee per bag to deliver them.', 'Include a hangover kit for the morning after.'],
    search: null, sources: [],
  },
  {
    id: 'kids-corner', group: 'comfort', emoji: '🧸', name: 'Kids’ corner or sitter',
    blurb: 'A supervised room with movies, crafts and snacks so parents can enjoy the night.',
    cost: null, costNote: 'Usually a sitter or two at local hourly rates, plus snacks and supplies.',
    lead: '1–2 months ahead',
    tips: ['Ask parents ahead how many kids to plan for.', 'A quiet room with a movie works wonders after 9pm.'],
    search: 'event babysitting service', sources: [],
  },
];

export const EXTRA_BY_ID = Object.fromEntries(EXTRAS.map((e) => [e.id, e]));

/** [low, high] estimate for one extra at a guest count, or null if it depends. */
export function extraEstimate(extra, guests) {
  const c = extra.cost;
  if (!c) return null;
  if (c.unit === 'per-guest') return [Math.max(c.min || 0, c.low * guests * 0.7), Math.max(c.min || 0, c.high * guests * 0.7)];
  if (c.unit === 'per-hour') return [c.low * (c.hours || 1), c.high * (c.hours || 1)];
  return [c.low, c.high];
}
