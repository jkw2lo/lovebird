// Extras & experiences: the things guests remember. Researched October 2026.
//
// Costs are mostly Toronto/GTA prices (CAD) unless a note says US; New York and
// New Jersey are usually similar or a little higher in USD. They're starting
// points for budgeting, not quotes. cost is null where it depends too much on
// what you choose to give a fair range.
//
// cost.unit: 'flat' (one price for the event), 'per-guest' (cost.guests overrides
// your guest count, e.g. a rehearsal dinner), or 'per-hour' (with hours).
// diy: true means you make it yourself; picking it adds a step to your plan
// (in diyPhase, by diyBefore days out) instead of a vendor.
// hobbies: which of your hobbies an idea is built around.

export const HOBBIES = [
  { key: 'watercolour', label: 'Watercolour', emoji: '🖌️' },
  { key: 'cooking', label: 'Cooking & recipes', emoji: '🍳' },
  { key: 'stationery', label: 'Stationery & journaling', emoji: '✒️' },
  { key: 'leather', label: 'Leathercraft & sewing', emoji: '🧵' },
];

export const EXTRA_GROUPS = [
  { key: 'yours', label: 'For your hobbies', emoji: '💛' },
  { key: 'treats', label: 'Food & drink stations', emoji: '🍡' },
  { key: 'fun', label: 'Games & entertainment', emoji: '🎮' },
  { key: 'keepsakes', label: 'Keepsakes', emoji: '📸' },
  { key: 'moments', label: 'Big moments & traditions', emoji: '✨' },
  { key: 'comfort', label: 'Guest comfort', emoji: '🧺' },
];

export const EXTRAS = [
  // ---------- for your hobbies
  // Watercolour
  {
    id: 'live-watercolour-guests', group: 'yours', hobbies: ['watercolour'], emoji: '🖌️', name: 'Live watercolour guest portraits',
    blurb: 'An artist paints quick watercolour portraits of guests during the reception: favours they’ll actually keep.',
    cost: { low: 1550, high: 3200, unit: 'flat', text: 'Toronto: about $1,550 for 4 hours to $1,900–$3,200 for guest portrait collections; live sketching from about $800 for 2 hours' },
    lead: '4–6 months ahead',
    tips: ['Ask to see their speed: some do 10–15 portraits an hour.', 'Have them paint the two of you first, during cocktail hour.'],
    search: 'live watercolour guest portraits wedding',
    sources: [{ label: 'Victoria’s Visuals', url: 'https://victoriasvisuals.com/live-guest-painting' }, { label: 'Greyish Teal guest portraits', url: 'https://greyishteal.com/en-us/pages/live-guest-portraits' }, { label: 'Jenny Zhang live illustration', url: 'https://jennyzhangillustrations.com/live-sketching-1' }],
  },
  {
    id: 'watercolour-venue-invites', group: 'yours', hobbies: ['watercolour', 'stationery'], diy: true, diyPhase: 'look', diyBefore: 175, emoji: '🏛️', name: 'Paint your venue for the invitations',
    blurb: 'Paint the venue (or your city skyline) yourself and use it on the save-the-dates, invitations and signs.',
    cost: { low: 175, high: 435, unit: 'flat', text: 'Doing it yourself costs paper and a scan; commissioning a painted venue illustration runs about $175–$435' },
    lead: 'Start 6–7 months out',
    tips: ['Paint larger than you need, then have it scanned at a print shop.', 'One painting can carry through invitations, menus, signs and the website.'],
    search: null,
    sources: [{ label: 'Custom venue illustration pricing', url: 'https://sweetdatesprints.com/products/custom-illustration-destination-wedding-invite-illustrated-watercolor-hand-drawn-venue-invitation-65' }, { label: 'Original venue painting commissions', url: 'https://aquahuedesigns.com/products/original-wedding-invitation-venue-illustration-commission-watercolor-and-ink-building-destination-save-the-date-painting-by-tonja-wilcox-deposit' }],
  },
  {
    id: 'painted-place-cards', group: 'yours', hobbies: ['watercolour', 'stationery'], diy: true, diyPhase: 'invite', diyBefore: 45, emoji: '🃏', name: 'Hand-painted place cards & menus',
    blurb: 'A soft wash or a tiny botanical on every place card, menu or table number.',
    cost: null, costNote: 'Paper and paint. Budget time more than money: a minute or two per card.',
    lead: 'Start 2 months out',
    tips: ['Paint the washes in batches weeks ahead, and letter the names once the seating chart is final.', 'Use cold-press card stock so it doesn’t buckle.'],
    search: null, sources: [],
  },
  {
    id: 'watercolour-guestbook', group: 'yours', hobbies: ['watercolour'], diy: true, diyPhase: 'invite', diyBefore: 40, emoji: '🎨', name: 'Paint-a-swatch guest book',
    blurb: 'Guests add a brushstroke, a swatch or a tiny painting to a shared page that becomes art for your wall.',
    cost: null, costNote: 'A pad of cold-press paper, a travel palette and a few water brushes.',
    lead: 'Set up 1 month out',
    tips: ['Lightly pencil a shape (a tree, your initials) for guests to fill with colour.', 'Water brushes mean no water cups to knock over.'],
    search: null, sources: [],
  },

  // Cooking & recipes
  {
    id: 'recipe-guestbook', group: 'yours', hobbies: ['cooking', 'stationery'], diy: true, diyPhase: 'invite', diyBefore: 50, emoji: '📇', name: 'Recipe-card guest book',
    blurb: 'Guests write a favourite recipe or food memory on a card; afterwards you bind them into a cookbook.',
    cost: { low: 13, high: 50, unit: 'flat', text: 'Printed cards and a box, then about $13–$50 per bound copy (Blurb and Mixbook) for the family cookbook afterwards' },
    lead: 'Start 2 months out',
    tips: ['Send a few cards with the invitations so family can fill them in properly.', 'Leave a "recipe I can’t live without" prompt for guests who don’t cook.'],
    search: null,
    sources: [{ label: 'Blurb cookbooks', url: 'https://www.blurb.com/cookbooks' }, { label: 'Mixbook recipe books', url: 'https://www.mixbook.com/recipe-cookbook-photo-books' }],
  },
  {
    id: 'family-recipe-menu', group: 'yours', hobbies: ['cooking'], diy: true, diyPhase: 'finish', diyBefore: 110, emoji: '🥘', name: 'Your family recipe on the menu',
    blurb: 'Ask the caterer to make a dish from each family, or the meal you two always cook together.',
    cost: null, costNote: 'Usually no extra cost; bring the recipe to your tasting.',
    lead: 'Raise it at the menu tasting',
    tips: ['Name it on the menu ("Grandma’s dumplings").', 'Offer to cook it for the chef so they can taste the real thing.'],
    search: null, sources: [],
  },
  {
    id: 'cooking-class-welcome', group: 'yours', hobbies: ['cooking'], emoji: '👩‍🍳', name: 'Cooking class welcome party',
    blurb: 'Instead of a stiff rehearsal dinner, everyone cooks a meal together with a chef the night before.',
    cost: { low: 65, high: 170, unit: 'per-guest', guests: 30, text: 'Toronto group classes about $65–$170 per person for 10–80 guests (the estimate assumes 30)' },
    lead: '2–3 months ahead',
    tips: ['Pick a cuisine that means something to you both.', 'Pasta or dumplings work well for mixed skill levels.'],
    search: 'private group cooking class',
    sources: [{ label: 'The Chef Upstairs', url: 'https://thechefupstairs.com/' }, { label: 'My Place for Dinner', url: 'https://myplacefordinner.com/' }, { label: 'Paula’s Gourmet Table', url: 'https://paulazavalachef.com/cherry-services/privateclasses/' }],
  },
  {
    id: 'homemade-favours', group: 'yours', hobbies: ['cooking'], diy: true, diyPhase: 'invite', diyBefore: 30, emoji: '🫙', name: 'Homemade edible favours',
    blurb: 'Small jars of your jam, chili crisp, spice blend or cookies, with a label you designed.',
    cost: null, costNote: 'Ingredients, jars and labels; plan a weekend of production.',
    lead: 'Make 3–4 weeks out',
    tips: ['Choose something shelf-stable, and check your venue allows outside food as favours.', 'Put the recipe on the back of the label.'],
    search: null, sources: [],
  },

  // Stationery & journaling
  {
    id: 'wax-seal-station', group: 'yours', hobbies: ['stationery'], diy: true, diyPhase: 'invite', diyBefore: 40, emoji: '🕯️', name: 'Letter-writing & wax seal station',
    blurb: 'Guests write you a letter to open on an anniversary and seal it with your custom wax stamp.',
    cost: { low: 30, high: 60, unit: 'flat', text: 'A custom wax seal stamp with wax is about $30–$60; add nice paper and envelopes' },
    lead: 'Order the stamp 1–2 months out',
    tips: ['Label envelopes "open on our 1st / 5th / 10th anniversary".', 'Use a glue-gun wax gun instead of a flame at a busy party.'],
    search: null,
    sources: [{ label: 'Stamptitude custom wax seals', url: 'https://stamptitude.com/products/custom-wax-seal-stamp' }, { label: 'Olive Paperie custom kit', url: 'https://olivepaperieco.com/products/custom-wax-seal-stamp-kit' }],
  },
  {
    id: 'journal-guestbook', group: 'yours', hobbies: ['stationery'], diy: true, diyPhase: 'invite', diyBefore: 35, emoji: '📔', name: 'Journal guest book with prompts',
    blurb: 'A blank journal with prompt cards, washi tape, stickers and a stamp so guests can decorate their page.',
    cost: null, costNote: 'A good journal, prompt cards and a small sticker and washi kit.',
    lead: 'Set up 1 month out',
    tips: ['Tape in photo booth prints as the night goes on.', 'Prompts help: "best advice", "a date night idea", "where we met you".'],
    search: null, sources: [],
  },
  {
    id: 'live-calligraphy', group: 'yours', hobbies: ['stationery', 'leather'], emoji: '✒️', name: 'Live calligraphy & engraving',
    blurb: 'A calligrapher writes or engraves guests’ names on glasses, perfume bottles, place cards or leather tags while they watch.',
    cost: { low: 300, high: 300, unit: 'per-hour', hours: 3, text: 'Toronto: on-site calligraphy and engraving from about $300 per hour; elsewhere packages run $1,500+ for 4 hours. About 30–45 items an hour' },
    lead: '3–4 months ahead',
    tips: ['Pair it with the favour: engraved glasses double as drinkware for the night.', 'JW Lettering in Toronto also does live hot-foil on leather tags.'],
    search: 'live calligraphy engraving wedding',
    sources: [{ label: 'A Grateful Note', url: 'https://www.agratefulnote.com/custom-wedding-calligraphy-service.html' }, { label: 'JW Lettering (Toronto)', url: 'https://jwlettering.com/' }, { label: 'A Handful of Letters pricing', url: 'https://www.ahandfulofletters.com/calligraphy-pricing' }],
  },

  // Leathercraft & sewing
  {
    id: 'leather-favours', group: 'yours', hobbies: ['leather'], diy: true, diyPhase: 'finish', diyBefore: 100, emoji: '🔑', name: 'Hand-stitched leather favours',
    blurb: 'Keychains, luggage tags or bookmarks you cut and stitch, stamped with your initials and the date.',
    cost: null, costNote: 'Leather, thread and hardware; your time is the real cost, so start early.',
    lead: 'Start 3–4 months out',
    tips: ['Make templates and batch-cut everything in one session.', 'Make 10% extra for mistakes and late additions.'],
    search: null, sources: [],
  },
  {
    id: 'live-leather-stamping', group: 'yours', hobbies: ['leather'], emoji: '🏷️', name: 'Live leather stamping station',
    blurb: 'A pro hot-stamps or foils guests’ initials onto leather tags, keychains or card holders on the spot.',
    cost: { low: 450, high: 1500, unit: 'flat', text: 'From about $450 for a 2-hour station to $1,500+ for 4 hours with heat-foil embossing (US pricing); stamps about 40–60 pieces an hour' },
    lead: '2–3 months ahead',
    tips: ['Supply your own hand-stitched blanks and have them stamp the names.', 'Ask whether blanks are included or extra.'],
    search: 'live leather stamping hot foil event',
    sources: [{ label: 'Auralasting live engraving', url: 'https://auralasting.com/pages/live-engraving' }, { label: 'A Handful of Letters', url: 'https://www.ahandfulofletters.com/calligraphy-pricing' }, { label: 'Corium USA live stamping', url: 'https://coriumusa.com/pages/on-site-live-stamping' }],
  },
  {
    id: 'live-embroidery', group: 'yours', hobbies: ['leather'], emoji: '🪡', name: 'Live embroidery station',
    blurb: 'Initials or a tiny motif stitched onto napkins, totes, hats or handkerchiefs while guests wait.',
    cost: { low: 1000, high: 3000, unit: 'flat', text: 'From about $1,000 for a 4-hour weekend station to $2,000–$3,000 (US pricing); about 20–30 items per machine an hour' },
    lead: '2–3 months ahead',
    tips: ['Embroidered handkerchiefs are a lovely favour for parents.', 'Pick one simple design so the line moves.'],
    search: 'live embroidery event station',
    sources: [{ label: 'Kit’s Threads events', url: 'https://kitsthreads.com/pages/embroidery-events' }, { label: 'Live embroidery cost breakdown', url: 'https://liveembroideryevents.com/blog/live-embroidery-event-cost-breakdown/' }],
  },
  {
    id: 'stitched-outfit-detail', group: 'yours', hobbies: ['leather'], diy: true, diyPhase: 'finish', diyBefore: 90, emoji: '🧵', name: 'A stitched detail in your outfits',
    blurb: 'Your initials and date embroidered inside the dress or jacket lining, or a patch of family fabric sewn in.',
    cost: null, costNote: 'Do it yourself, or ask your tailor at a fitting (usually a small alteration fee).',
    lead: 'Before your final fitting',
    tips: ['Coordinate with your tailor so it’s done before the last fitting.', 'A scrap of a parent’s wedding outfit makes a meaningful patch.'],
    search: null, sources: [],
  },
  {
    id: 'handmade-ring-box', group: 'yours', hobbies: ['leather'], diy: true, diyPhase: 'finish', diyBefore: 90, emoji: '💍', name: 'Handmade ring box or guest book cover',
    blurb: 'A leather ring box, ring pillow or a stitched leather cover for the guest book.',
    cost: null, costNote: 'Leather and hardware; one weekend project.',
    lead: 'Finish 2 months out',
    tips: ['It will be in the ring photos, so pick a colour that photographs well.'],
    search: null, sources: [],
  },

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
    id: 'grazing-table', group: 'treats', emoji: '🧀', name: 'Grazing table',
    blurb: 'A long table covered in cheeses, charcuterie, fruit, breads and dips for cocktail hour.',
    cost: { low: 28, high: 50, unit: 'per-guest', text: 'Toronto grazing tables about $28–$50 per person depending on the package' },
    lead: '1–2 months ahead',
    tips: ['It can replace passed appetizers, not just add to them.', 'Ask for labels so guests with allergies can tell what\u2019s what.'],
    search: 'grazing table catering',
    sources: [{ label: 'Design & Graze packages', url: 'https://designandgraze.com/packages' }, { label: 'D Living packages', url: 'https://dliving.ca/packages' }],
  },
  {
    id: 'oyster-bar', group: 'treats', emoji: '🦪', name: 'Oyster bar',
    blurb: 'Oysters shucked to order on ice, with mignonette and lemon.',
    cost: { low: 800, high: 4000, unit: 'flat', text: 'A raw bar station about $800–$1,500; a dedicated shucker more like $2,000–$4,000 (US pricing); or roughly $8–$15 per guest' },
    lead: '1–2 months ahead',
    tips: ['Ask your caterer first; many can add a raw bar.', 'Best at cocktail hour, outdoors or near the bar.'],
    search: 'oyster shucker for events',
    sources: [{ label: 'The Knot: oyster shuckers', url: 'https://www.theknot.com/content/oyster-shucker-wedding' }, { label: 'Oyster bar on a budget', url: 'https://theshellfishaffair.com/blogs/news/how-to-add-an-oyster-bar-to-your-wedding-without-breaking-the-bank' }],
  },
  {
    id: 'cotton-candy', group: 'treats', emoji: '🍭', name: 'Cotton candy machine',
    blurb: 'Spun-to-order cotton candy, a cheap and very cheerful late-night treat.',
    cost: { low: 75, high: 200, unit: 'flat', text: 'About $75–$200 for the day in the GTA, usually with sugar and cones for 30–75 servings' },
    lead: '2–4 weeks ahead',
    tips: ['Full-service rentals include someone to spin it.', 'Coloured sugar can match your palette.'],
    search: 'cotton candy machine rental',
    sources: [{ label: 'Cotton candy rental prices (GTA)', url: 'https://www.themaineventservices.ca/post/cotton-candy-machine-rental-prices-guide' }, { label: 'Party Box TO', url: 'https://partyboxto.com/products/cotton-candy-machine-full-service' }],
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
    id: 'silent-disco', group: 'fun', emoji: '🎧', name: 'Silent disco',
    blurb: 'Wireless headphones with two or three channels, so the party can keep going after noise curfews.',
    cost: { low: 430, high: 3500, unit: 'flat', text: 'About $4–$7 per headset plus $65–$100 per transmitter; wedding packages $430–$3,500 depending on guest count' },
    lead: '1–2 months ahead',
    tips: ['Great for venues with an 11pm music cutoff or an after-party.', 'Your DJ can run one channel; playlists can run the others.'],
    search: 'silent disco headphone rental',
    sources: [{ label: 'Silent disco pricing guide 2026', url: 'https://www.quietevents.com/blogs/quiet-events-blog/silent-disco-rental-pricing-guide-2026' }, { label: 'HUSHconcerts', url: 'https://hushconcerts.com/silent-disco-rentals/' }],
  },
  {
    id: 'henna', group: 'fun', emoji: '🌿', name: 'Henna artist for guests',
    blurb: 'Small henna designs for guests during cocktail hour or the mehndi.',
    cost: { low: 120, high: 280, unit: 'per-hour', hours: 3, text: 'About $120–$280 per hour in Toronto (often a 2–3 hour minimum), or $10–$25 per guest for simple designs' },
    lead: '1–2 months ahead',
    tips: ['Simple designs keep the line moving.', 'Give guests a minute to dry before they hug anyone.'],
    search: 'henna artist events',
    sources: [{ label: 'Henna costs (2026)', url: 'https://fash.com/costs/henna-tattoo-prices' }, { label: 'GigSalad: Toronto henna artists', url: 'https://www.gigsalad.com/Variety/henna-tattoo-artist/ON/Toronto' }],
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

  {
    id: 'perfume-bar', group: 'keepsakes', emoji: '🌸', name: 'Perfume bar',
    blurb: 'A perfumer helps guests blend a small bottle of their own scent, labelled with your names.',
    cost: { low: 1750, high: 2900, unit: 'flat', text: 'About $1,750 (50 guests) to $2,250 (100 guests) for 3 hours, or around $35 per person; premium experiences $2,900+ (US pricing)' },
    lead: '2–3 months ahead',
    tips: ['Put it somewhere calm, away from the food.', 'Engraved bottles make it an instant favour.'],
    search: 'perfume bar for events',
    sources: [{ label: 'House of Enfleurage scent bar', url: 'https://www.houseofenfleurage.com/pages/the-scent-bar-a-botanical-perfume-experience' }, { label: 'Gavin Luxe perfume bar', url: 'https://gavinluxe.com/pages/the-haus-bar-by-gavin-luxe-mobile-perfume-experience-custom-fragrance-bar' }],
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
  if (c.unit === 'per-guest') {
    const n = c.guests || guests * (extra.id === 'late-night' ? 0.7 : 1); // late-night food: plan for ~70% of guests
    return [Math.max(c.min || 0, c.low * n), Math.max(c.min || 0, c.high * n)];
  }
  if (c.unit === 'per-hour') return [c.low * (c.hours || 1), c.high * (c.hours || 1)];
  return [c.low, c.high];
}
