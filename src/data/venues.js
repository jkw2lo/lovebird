// Researched wedding venues, by city. Toronto researched October 2026.
//
// Prices come from the venues' own packages where published, otherwise from
// wedding directories (WeddingWire, EventSource, WeddingHero and similar), and
// some are a year or two old. Treat every number as a starting estimate and
// confirm with the venue. Each venue lists its sources.
//
// price.model:
//   'per-person'  food, drink and venue priced per guest (plus any siteFee)
//   'rental'      venue rental only; you bring a caterer (estimated separately)
// price.inclusive: the per-person price already includes tax and service.
//
// Photos are links, never copies: the venue's own preview image, or a freely
// licensed photo from Wikimedia Commons (credited).

const wiki = (file, page) => ({
  url: `https://upload.wikimedia.org/wikipedia/commons/thumb/${file}/960px-${file.split('/').pop()}`,
  credit: 'Wikimedia Commons',
  creditUrl: `https://en.wikipedia.org/wiki/${page}`,
});
const site = (url, credit) => ({ url, credit, creditUrl: null });

const SRC = {
  weddingwire: (path) => ({ label: 'WeddingWire.ca', url: `https://www.weddingwire.ca/${path}` }),
  weddinghero: (slug) => ({ label: 'WeddingHero', url: `https://weddinghero.ca/wedding-venue/toronto/${slug}` }),
  eventsource: (slug) => ({ label: 'EventSource', url: `https://www.eventsource.ca/${slug}` }),
};

export const TORONTO = {
  key: 'toronto',
  label: 'Toronto',
  researched: 'October 2026',
  match: /toronto|\bgta\b|scarborough|etobicoke|north york|mississauga|markham|vaughan|richmond hill/i,
  costNotes: [
    'Ontario adds 13% HST to almost everything.',
    'Most venues with in-house catering add a service or admin charge of 15–21% on food and drink, before tax.',
    'So a $200 per person package often lands around $265 per person all-in.',
    'If you bring your own caterer, budget roughly $120–$220 per person for food, bar and staff in Toronto.',
    'Saturdays from May to October cost the most. Fridays, Sundays and January to March are often 10–30% less.',
  ],
  // For venues where you bring your own caterer: rough Toronto food + bar + staff per guest.
  outsideCatering: [120, 220],
  allInFactor: 1.33, // ~18% service, then 13% HST on top
  venues: [
    {
      id: 'casa-loma', name: 'Casa Loma', area: 'Midtown', type: 'historic', styles: ['Classic', 'Romantic', 'Black tie', 'Garden'],
      seated: 350, standing: 500, minGuests: 50, setting: 'both', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 165, high: 250, siteFee: [22000, 26000], text: 'From about $165/person, plus a reception site fee of roughly $22k–$26k' },
      summary: 'Toronto’s castle: a 1914 Gothic Revival mansion with gardens, a conservatory and grand halls.',
      highlights: ['Gardens for ceremonies and portraits', 'Several spaces from 50 to 350 seated', 'Instantly recognizable'],
      considerations: ['Site fees are steep; peak Saturdays cost the most', 'Space minimums range from 50 to 100 guests'],
      website: 'https://casaloma.ca/',
      image: wiki('4/43/Exterior_of_Casa_Loma%2C_June_2012.jpg', 'Casa_Loma'),
      sources: [{ label: 'Casa Loma wedding menu (2023)', url: 'https://casaloma.ca/wp-content/uploads/2023/04/2023-CL-Wedding-Menu_web.pdf' }, SRC.weddingwire('castle-wedding/casa-loma--e1728'), { label: 'Casa Loma cost guide', url: 'https://photoboothto.ca/blog/casa-loma-wedding-cost-fees-minimums-guide/' }],
    },
    {
      id: 'rom', name: 'Royal Ontario Museum', area: 'Yorkville', type: 'museum', styles: ['Modern', 'Black tie', 'Big party'],
      seated: 550, standing: 2500, setting: 'indoor', ceremony: true, catering: 'approved list',
      price: { model: 'rental', low: 1500, high: 10000, text: 'Spaces from about $1,500; Crystal Court + Currelly Gallery about $10,000, plus catering' },
      summary: 'The Michael Lee-Chin Crystal and grand galleries, from intimate dinners to huge receptions.',
      highlights: ['Dramatic architecture inside and out', 'Scales from dinners for 10 to 550 seated', 'Dinner among the collections'],
      considerations: ['Events happen after museum hours', 'Catering, décor and rentals add up on top of the space fee'],
      website: 'https://www.rom.on.ca/venue-rentals',
      image: site('https://www.rom.on.ca/sites/default/files/styles/metatags_image/public/2025-09/Ext-006.jpg.webp?h=901677c5&itok=VfD4Y4Xm', 'Royal Ontario Museum'),
      sources: [{ label: 'ROM venue rentals', url: 'https://www.rom.on.ca/venue-rentals' }, SRC.weddinghero('royal-ontario-museum')],
    },
    {
      id: 'ago', name: 'Art Gallery of Ontario', area: 'Grange Park', type: 'museum', styles: ['Modern', 'Black tie'],
      seated: 175, standing: 450, setting: 'indoor', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 500, high: 700, text: 'Reported at about $500–$700 per person' },
      summary: 'Walker Court under Frank Gehry’s spiral staircase: light-filled, sculptural and very memorable.',
      highlights: ['Ceremony under the Gehry staircase', 'Art-filled photos', 'Central downtown location'],
      considerations: ['One of the priciest options per guest', 'Seated dinners top out around 175'],
      website: 'https://ago.ca/visit/host-your-event',
      image: wiki('8/87/Art_Gallery_of_Ontario_2023.jpg', 'Art_Gallery_of_Ontario'),
      sources: [SRC.weddinghero('art-gallery-of-ontario'), SRC.eventsource('art-gallery-of-ontario')],
    },
    {
      id: 'evergreen', name: 'Evergreen Brick Works', area: 'Don Valley', type: 'industrial', styles: ['Rustic', 'Garden', 'Modern', 'Big party'],
      seated: 700, standing: 1000, setting: 'both', ceremony: true, catering: 'approved list',
      price: { model: 'rental', low: 3000, high: 12000, text: 'Rental about $3,000–$12,000 depending on the space, plus catering' },
      summary: 'A restored brick factory in the Don Valley ravine, with gardens, pavilions and raw industrial halls.',
      highlights: ['Spaces from 65 to 700 seated', 'Ravine and garden backdrops', 'Choose from partner caterers'],
      considerations: ['Outside caterers pay a landmark fee', 'Some spaces are semi-outdoor; plan for weather'],
      website: 'https://www.evergreen.ca/',
      image: wiki('2/25/Don_Valley_Brick_Works_%2854010434534%29.jpg', 'Don_Valley_Brick_Works'),
      sources: [SRC.weddinghero('evergreen-brick-works'), SRC.eventsource('evergreen-brick-works')],
    },
    {
      id: 'fermenting-cellar', name: 'Fermenting Cellar', area: 'Distillery District', type: 'industrial', styles: ['Rustic', 'Modern', 'Big party'],
      seated: 350, standing: 600, setting: 'indoor', ceremony: true, catering: 'approved list',
      price: { model: 'per-person', low: 70, high: 150, text: 'About $70–$150 per person, plus a $20/person rental package' },
      summary: 'A Victorian-era spirit fermenting hall on the Distillery District’s cobblestones: brick, beams and candlelight.',
      highlights: ['Ceremony and reception in one place', 'Great value for a downtown venue', 'Distillery District photos outside'],
      considerations: ['With a ceremony and dance floor, plated dinner capacity drops to about 200', 'Busy area on weekends'],
      website: 'https://www.distilleryevents.com/',
      image: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/To_the_fermenting_cellar.jpg/960px-To_the_fermenting_cellar.jpg', credit: 'Wikimedia Commons (CC BY-SA 2.0)', creditUrl: 'https://commons.wikimedia.org/wiki/File:To_the_fermenting_cellar.jpg' },
      sources: [SRC.weddinghero('fermenting-cellar'), { label: 'Seventh Heaven', url: 'https://www.seventhheaven.ca/fermenting-cellar-at-the-distillery-district' }],
    },
    {
      id: 'steam-whistle', name: 'Steam Whistle Roundhouse', area: 'Entertainment District', type: 'industrial', styles: ['Modern', 'Big party', 'Rustic'],
      seated: 400, standing: 900, setting: 'indoor', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 110, high: 400, siteFee: [5750, 5750], text: 'From about $110/person (up to ~$400 for top menus), plus a ~$5,750 peak site fee' },
      summary: 'A 1929 railway roundhouse beside the CN Tower, run by Oliver & Bonacini.',
      highlights: ['Two halls: about 180 or 400 seated', 'CN Tower views', 'Walkable from Union Station'],
      considerations: ['Wide price range depending on menu and bar', 'Downtown parking is limited'],
      website: 'https://www.oliverbonacini.com/event-venues/steam-whistle-roundhouse/',
      image: site('https://cdn.oliverbonacininetwork.com/uploads/sites/42/2017/08/oliver-bonacini-hospitality-venue-steam-whistle.jpg', 'O&B Hospitality'),
      sources: [SRC.weddinghero('steam-whistle-brewing'), SRC.eventsource('steam-whistle-brewery')],
    },
    {
      id: 'liberty-grand', name: 'Liberty Grand', area: 'Exhibition Place', type: 'ballroom', styles: ['Classic', 'Black tie', 'Big party', 'Cultural traditions'],
      seated: 800, standing: 1500, minGuests: 100, setting: 'both', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 110, high: 200, text: 'About $110–$200 per person, including venue and an open bar' },
      summary: 'A 1926 Beaux-Arts building with grand ballrooms and a courtyard; packages include the bar and coordinator.',
      highlights: ['Rooms for 100 to 800 seated', 'Courtyard ceremonies for up to 400', 'South Asian and family-style menus'],
      considerations: ['Large-wedding feel; smaller rooms for under 300', 'Off-season and Fridays/Sundays are cheaper'],
      website: 'https://libertygrand.com/',
      image: wiki('5/5a/CNE_Ontario_Government_Building_2024.JPG', 'CNE_Ontario_Government_Building'),
      sources: [{ label: 'Liberty Grand wedding package (2023)', url: 'https://libertygrand.com/wp-content/uploads/2022/08/Liberty-Grand-Wedding-Package-2023_email.pdf' }, SRC.weddinghero('liberty-grand-entertainment-complex'), SRC.eventsource('liberty-grand-entertainment-complex')],
    },
    {
      id: 'royal-york', name: 'Fairmont Royal York', area: 'Financial District', type: 'hotel', styles: ['Classic', 'Black tie', 'Big party'],
      seated: 800, standing: 1200, minGuests: 75, setting: 'indoor', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 285, high: 320, text: '2026 packages: $285 (Imperial) or $320 (Royal) per person, before tax and service' },
      summary: 'The grand railway hotel across from Union Station, with historic ballrooms and guest rooms upstairs.',
      highlights: ['7-hour premium bar and tasting included', 'Guests stay on site', 'Ballrooms for any size'],
      considerations: ['75-guest minimum for packages', 'Priced like the landmark it is'],
      website: 'https://www.fairmont.com/en/hotels/toronto/fairmont-royal-york.html',
      image: wiki('1/10/Fairmont_Royal_York_from_CIBC_Square_Park%2C_May_13_2026_%2801%29.jpg', 'Fairmont_Royal_York'),
      sources: [{ label: 'Fairmont Royal York 2026 weddings', url: 'https://www.fairmont.com/content/dam/brands/fai/hotels/america/ca/toronto/a551/msa_d_0000813.pdf' }],
    },
    {
      id: 'guild-inn', name: 'The Guild Inn Estate', area: 'Scarborough Bluffs', type: 'estate', styles: ['Garden', 'Classic', 'Romantic', 'Big party'],
      seated: 600, standing: 1000, minGuests: 125, setting: 'both', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 142, high: 158, text: 'Packages about $142–$158 per person (2023 high-season Saturdays; likely higher now)' },
      summary: 'A historic estate in Guild Park on the Scarborough Bluffs, with gardens full of architectural ruins.',
      highlights: ['Gardens and Lake Ontario bluffs for photos', 'Big ballrooms', 'Packages are all-inclusive-style'],
      considerations: ['Ballrooms need about 125–150 adult guests to avoid a room fee', 'A drive from downtown'],
      website: 'https://guildinnestate.com/',
      image: wiki('8/8a/Guild_Park_and_Gardens_%2838432292876%29.jpg', 'Guild_Park_and_Gardens'),
      sources: [{ label: 'Guild Inn wedding packages', url: 'https://guildinnestate.com/wp-content/uploads/2023/03/guild-inn-wedding-packages.pdf' }, SRC.eventsource('the-guild-inn-estate')],
    },
    {
      id: 'graydon-hall', name: 'Graydon Hall Manor', area: 'North York', type: 'estate', styles: ['Classic', 'Romantic', 'Garden', 'Black tie'],
      seated: 250, standing: 300, setting: 'both', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 150, high: 250, text: 'Roughly $150–$250+ per person; minimum spend about $15k (off-peak) to $55k (peak, full day)' },
      summary: 'A 1936 Georgian manor with a terrace and formal gardens, hosting one wedding at a time.',
      highlights: ['Exclusive use of the estate', 'Terrace ceremonies', 'Manor interiors for photos'],
      considerations: ['Peak-season minimum spends are high', 'Great Hall seats about 145; larger dinners use the terrace tent'],
      website: 'https://www.graydonhallmanor.com/',
      image: null,
      sources: [SRC.weddinghero('graydon-hall-manor'), SRC.eventsource('graydon-hall-manor'), SRC.weddingwire('mansion-weddings/graydon-hall-manor--e9504')],
    },
    {
      id: 'burroughes', name: 'The Burroughes', area: 'Queen West', type: 'industrial', styles: ['Modern', 'Boho', 'Big party'],
      seated: 250, standing: 450, setting: 'both', ceremony: true, catering: 'outside',
      price: { model: 'rental', low: 4000, high: 8000, text: 'Rental about $4,000–$8,000, plus your own caterer' },
      summary: 'A heritage building on Queen West with open loft floors, big windows and a rooftop terrace.',
      highlights: ['Bring your own caterer and alcohol', 'Rooftop for cocktails (about 100)', 'Blank canvas to style'],
      considerations: ['You arrange catering, rentals and bar', 'Rental and logistics take more planning'],
      website: 'https://theburroughes.com/',
      image: wiki('e/e3/Burroughes_Building.JPG', 'Burroughes_Building'),
      sources: [SRC.weddinghero('the-burroughes'), { label: 'Cvent', url: 'https://www.cvent.com/venues/toronto/gallery-museum/the-burroughes/venue-5696bb6e-6e5e-4569-a646-e38f13fe5b6a' }],
    },
    {
      id: 'malaparte', name: 'Malaparte', area: 'King West', type: 'restaurant', styles: ['Modern', 'Intimate', 'Black tie'],
      seated: 150, standing: 350, setting: 'both', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 250, high: 350, text: 'About $250–$350 per person' },
      summary: 'A sixth-floor event space at TIFF Lightbox with a wraparound terrace over King West.',
      highlights: ['Rooftop terrace with city views', 'Oliver & Bonacini food', 'Right in the Entertainment District'],
      considerations: ['Seated dinners max out around 150', 'Premium per-person pricing'],
      website: 'https://www.oliverbonacini.com/event-venues/malaparte/',
      image: site('https://cdn.oliverbonacininetwork.com/uploads/sites/42/2018/10/oliver-bonacini-mango-studios-malaparte-event-sara-david-wedding-04-1.jpg', 'O&B Hospitality'),
      sources: [SRC.weddinghero('malaparte'), SRC.eventsource('malaparte')],
    },
    {
      id: 'botanical-garden', name: 'Toronto Botanical Garden', area: 'North York', type: 'garden', styles: ['Garden', 'Romantic', 'Intimate', 'Boho'],
      seated: 300, standing: 300, setting: 'both', ceremony: true, catering: 'approved list',
      price: { model: 'rental', low: 4200, high: 7000, text: 'Garden Hall from $4,200, Floral Hall from $5,250 (+HST); garden ceremony from $1,750' },
      summary: 'Seventeen themed gardens next to Edwards Gardens, with glass-walled halls opening onto courtyards.',
      highlights: ['Ceremony in the gardens', 'Floral Hall for up to 300', 'Bridal suite, tables and chairs included'],
      considerations: ['15% landmark fee on food from outside caterers', 'Small fees add up (supervisor, music licensing)'],
      website: 'https://torontobotanicalgarden.ca/bookings/weddings-social-occasions/',
      image: site('https://torontobotanicalgarden.ca/wp-content/uploads/2021/09/Wedding-in-the-Garden-Hall-Courtyard-3.jpg', 'Toronto Botanical Garden'),
      sources: [{ label: 'TBG weddings', url: 'https://torontobotanicalgarden.ca/bookings/weddings-social-occasions/' }, SRC.eventsource('toronto-botanical-garden')],
    },
    {
      id: 'hart-house', name: 'Hart House', area: 'University of Toronto', type: 'historic', styles: ['Classic', 'Romantic', 'Black tie'],
      seated: 280, standing: 425, setting: 'both', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 100, high: 280, siteFee: [5500, 5500], text: 'Roughly $100–$280 per person, plus room rental from ~$5,500 (minimum spend ~$14k)' },
      summary: 'A Gothic Revival hall on the U of T campus: oak panelling, stained glass and a stone quadrangle.',
      highlights: ['Great Hall seats about 280', 'Quad and campus for photos', 'Feels like an old college hall'],
      considerations: ['Room rental on top of catering', 'Campus parking can be tricky'],
      website: 'https://harthouse.ca/',
      image: wiki('8/85/Hart_House.JPG', 'Hart_House_(University_of_Toronto)'),
      sources: [SRC.eventsource('hart-house'), { label: 'Ether Photography review', url: 'https://etherphotography.com/hart-house-wedding-venue-review' }],
    },
    {
      id: 'palais-royale', name: 'Palais Royale', area: 'Sunnyside waterfront', type: 'ballroom', styles: ['Classic', 'Romantic', 'Beach', 'Big party'],
      seated: 400, standing: 880, setting: 'both', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 100, high: 250, text: 'About $100–$250 per person; reported site fee/minimum around $25k–$30k' },
      summary: 'A 1922 lakeside dance hall on Lake Ontario, with a ballroom and a big courtyard patio.',
      highlights: ['Right on the water', 'Patio for about 300', 'Big-band history and a real dance floor'],
      considerations: ['Peak Saturdays carry a large site fee or minimum', 'Lakeside wind and weather for outdoor parts'],
      website: 'https://www.palaisroyale.ca/',
      image: wiki('e/ed/Palais_Royale.jpg', 'Palais_Royale'),
      sources: [SRC.weddinghero('palais-royale-ballroom'), SRC.weddingwire('mansion-weddings/palais-royale--e8736')],
    },
    {
      id: 'symes', name: 'The Symes', area: 'The Junction', type: 'industrial', styles: ['Modern', 'Rustic', 'Big party'],
      seated: 400, standing: 750, setting: 'both', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 215, high: 300, text: 'About $215–$300 per person; ceremony site fee from ~$5,000 in peak season' },
      summary: 'A 1934 heritage incinerator turned event space: vaulted ceilings, brick, beams and skylights.',
      highlights: ['Grand Symes for big parties', 'Scarlet Room and terrace for smaller ones', 'Dramatic industrial look'],
      considerations: ['West end, a drive from downtown', 'Ceremony on site adds a fee'],
      website: 'https://www.thesymes.ca/',
      image: null,
      sources: [{ label: 'The Symes', url: 'https://www.thesymes.ca/wedding-reception-venues-toronto' }, SRC.weddinghero('the-symes')],
    },
    {
      id: 'great-hall', name: 'The Great Hall', area: 'Queen West', type: 'historic', styles: ['Boho', 'Rustic', 'Modern', 'Big party'],
      seated: 250, standing: 480, setting: 'indoor', ceremony: true, catering: 'outside',
      price: { model: 'rental', low: 1450, high: 3850, text: 'Rental about $1,450 (off-peak) to $3,850 (peak), plus your own caterer' },
      summary: 'An 1889 hall on Queen West with soaring ceilings and stained glass, and a few smaller rooms.',
      highlights: ['One of the best-value downtown halls', 'Bring your own caterer', 'Rooms from 50 to 250 seated'],
      considerations: ['You coordinate catering and rentals', 'Also a concert venue; book early'],
      website: 'https://thegreathall.ca/wedding/',
      image: null,
      sources: [{ label: 'The Great Hall', url: 'https://thegreathall.ca/wedding/' }, SRC.weddinghero('the-great-hall'), SRC.eventsource('the-great-hall')],
    },
    {
      id: 'old-mill', name: 'Old Mill Toronto', area: 'Etobicoke', type: 'historic', styles: ['Classic', 'Romantic', 'Garden'],
      seated: 450, standing: null, setting: 'both', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 75, high: 100, siteFee: [700, 2100], text: 'Menus from about $75 per person, plus room rental around $700–$2,100' },
      summary: 'A Tudor-style inn beside the Humber River ruins, with gardens, a chapel and many rooms.',
      highlights: ['Gardens and river for photos', 'Rooms from about 50 to 450 seated', 'Hotel rooms on site'],
      considerations: ['Bar is usually extra', 'Popular for ceremonies; book the garden early'],
      website: 'https://www.oldmilltoronto.com/',
      image: null,
      sources: [{ label: 'Old Mill ballrooms', url: 'https://www.oldmilltoronto.com/ballrooms/' }, SRC.weddingwire('wedding-banquet-halls/old-mill-toronto--e6363'), SRC.eventsource('old-mill-toronto')],
    },
    {
      id: 'hotel-x', name: 'Hotel X Toronto', area: 'Exhibition Place', type: 'hotel', styles: ['Modern', 'Black tie', 'Big party'],
      seated: 350, standing: 400, setting: 'indoor', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 230, high: 270, text: 'Packages $230–$270 per person, plus 20% admin fee and HST' },
      summary: 'A modern waterfront resort hotel with lake and skyline views and a rooftop.',
      highlights: ['Wedding night suite and guest room rates', 'Victory Ballroom for about 350', 'Free parking is easier than downtown'],
      considerations: ['Admin fee is 20%', 'Feels contemporary rather than historic'],
      website: 'https://www.hotelxtoronto.com/',
      image: wiki('c/cd/Hotel_X_Toronto%2C_December_17_2025.jpg', 'Hotel_X_Toronto'),
      sources: [SRC.weddinghero('hotel-x-toronto'), SRC.eventsource('hotel-x-toronto')],
    },
    {
      id: 'arts-letters', name: 'Arts & Letters Club', area: 'Downtown', type: 'historic', styles: ['Intimate', 'Classic', 'Romantic'],
      seated: 100, standing: 110, setting: 'indoor', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 95, high: 110, siteFee: [1800, 1800], text: 'About $95–$110 per person, plus a ~$1,800 site fee' },
      summary: 'A medieval-style great hall from 1891, home to a club of artists since 1920.',
      highlights: ['Charming and affordable for 100 or fewer', 'Full in-house catering', 'Ceremony fee is small'],
      considerations: ['Tops out around 100 seated', 'No outdoor space'],
      website: 'https://www.artsandlettersclub.ca/',
      image: null,
      sources: [SRC.weddinghero('arts-and-letters-club'), SRC.eventsource('the-arts-and-letters-club-of-toronto')],
    },
    {
      id: 'one-king-west', name: 'One King West', area: 'Financial District', type: 'hotel', styles: ['Classic', 'Black tie'],
      seated: 300, standing: 500, setting: 'indoor', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 149, high: 210, text: 'About $149–$210 per person, plus HST and service' },
      summary: 'The Grand Banking Hall of a 1914 bank: 45-foot ceilings, marble columns and chandeliers.',
      highlights: ['Packages include rental, bar and a wedding suite', 'Hotel rooms upstairs', 'Very grand for the price'],
      considerations: ['Indoor only', 'Downtown parking (valet for the couple)'],
      website: 'https://www.onekingwest.com/wedding-venues/',
      image: wiki('a/a9/One_King_West_Hotel_%26_Residence_2022.jpg', 'One_King_West_Hotel_%26_Residence'),
      sources: [{ label: 'One King West packages', url: 'https://www.onekingwest.com/wedding-packages/' }, SRC.weddinghero('one-king-west-hotel-residence')],
    },
    {
      id: 'sunnybrook', name: 'Estates of Sunnybrook', area: 'Leaside / North York', type: 'estate', styles: ['Garden', 'Classic', 'Romantic'],
      seated: 300, standing: 350, setting: 'both', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 175, high: 225, inclusive: true, text: 'All-inclusive packages about $175–$225 per person, including tax and admin (minimum spend applies)' },
      summary: 'A 1931 mansion and grounds in Sunnybrook Park, plus a tented field for bigger weddings.',
      highlights: ['Prices include tax and admin fees', 'Estate grounds in a big city park', 'Oliver & Bonacini food'],
      considerations: ['Minimum spend applies', 'Tent plans for the largest weddings'],
      website: 'https://www.oliverbonacini.com/event-venues/estates-of-sunnybrook/',
      image: site('https://cdn.oliverbonacininetwork.com/uploads/sites/42/2024/09/DSC0303-1-scaled.jpg', 'O&B Hospitality'),
      sources: [{ label: 'O&B all-inclusive packages', url: 'https://www.oliverbonacini.com/news/all-inclusive-wedding-packages/' }, SRC.eventsource('estates-of-sunnybrook')],
    },
    {
      id: 'enoch-turner', name: 'Enoch Turner Schoolhouse', area: 'Corktown', type: 'historic', styles: ['Intimate', 'Rustic', 'Romantic'],
      seated: 120, standing: 150, setting: 'indoor', ceremony: true, catering: 'approved list',
      price: { model: 'rental', low: 2500, high: 8000, text: 'Ceremony package $2,500; all-inclusive venue package $8,000 (+HST), plus catering' },
      summary: 'Toronto’s oldest surviving school building (1848), with a schoolroom for ceremonies and a hall for dinner.',
      highlights: ['Small, warm and historic', 'Ceremony, cocktails and dinner in separate rooms', 'Near the Distillery District'],
      considerations: ['About 120 with a dance floor', 'Run by a heritage foundation; some rules on décor'],
      website: 'https://enochturnerschoolhouse.ca/',
      image: wiki('6/63/Enoch_Turner_School_House.jpg', 'Enoch_Turner_School'),
      sources: [SRC.eventsource('enoch-turner-schoolhouse'), SRC.weddinghero('enoch-turner-schoolhouse')],
    },
    {
      id: 'black-creek', name: 'Black Creek Pioneer Village', area: 'North York', type: 'historic', styles: ['Rustic', 'Garden', 'Romantic'],
      seated: 175, standing: 200, setting: 'both', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 130, high: 175, text: 'About $130–$175 per person, including venue and open bar' },
      summary: 'An 1860s heritage village with a church, gardens and barns, catered by Peter & Paul’s.',
      highlights: ['Ceremony in a historic village church', 'Storybook photos', 'Packages include tables, chairs and A/V'],
      considerations: ['Indoor dinners max out around 175–200', 'Far north end of the city'],
      website: 'https://blackcreek.bypeterandpauls.com/',
      image: wiki('7/71/In_the_shade_%281247127124%29.jpg', 'The_Village_at_Black_Creek'),
      sources: [{ label: 'Black Creek wedding package', url: 'https://blackcreek.bypeterandpauls.com/file/blackcreek-wedding-package.pdf' }, SRC.weddinghero('black-creek-pioneer-village')],
    },
    {
      id: 'king-edward', name: 'Omni King Edward Hotel', area: 'St. Lawrence', type: 'hotel', styles: ['Classic', 'Black tie', 'Romantic'],
      seated: 270, standing: 330, setting: 'indoor', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 150, high: 280, text: 'About $150–$280 per person; Crystal Ballroom minimum spend around $59k (before 21% service and HST)' },
      summary: 'Toronto’s first luxury hotel (1903). The 18th-floor Crystal Ballroom has skyline views and huge windows.',
      highlights: ['Crystal Ballroom with city views', 'Guests stay in the hotel', 'Old-world glamour'],
      considerations: ['High food and beverage minimum for the Crystal Ballroom', '21% service charge'],
      website: 'https://www.omnihotels.com/hotels/toronto-king-edward',
      image: wiki('1/1a/King_Edward_Hotel_2025.jpg', 'King_Edward_Hotel'),
      sources: [SRC.weddinghero('the-omni-king-edward-hotel'), SRC.weddingwire('hotel-weddings/the-omni-king-edward-hotel--e1634')],
    },
    {
      id: 'spadina', name: 'Spadina Museum', area: 'Midtown', type: 'historic', styles: ['Garden', 'Intimate', 'Romantic', 'Classic'],
      seated: 80, standing: 300, setting: 'both', ceremony: true, catering: 'approved list',
      price: { model: 'rental', low: 1500, high: 3000, text: 'About $150–$250 per hour plus staffing; packages reported from ~$3,000' },
      summary: 'A City-run 1866 mansion and gardens beside Casa Loma, best for garden ceremonies and afternoon receptions.',
      highlights: ['Beautiful gardens with city views', 'Much cheaper than its neighbour', 'Run by the City of Toronto'],
      considerations: ['Indoor hall seats about 80; bigger groups need the grounds', 'Photo permit required for professional photographers'],
      website: 'https://www.toronto.ca/explore-enjoy/history-art-culture/museums/spadina-museum/',
      image: wiki('4/49/Spadina_House%2C_Toronto.jpg', 'Spadina_House'),
      sources: [{ label: 'City of Toronto museum rentals', url: 'https://www.toronto.ca/services-payments/venues-facilities-bookings/booking-city-facilities/rentals-parties/' }],
    },
    {
      id: 'canoe', name: 'Canoe', area: 'Financial District', type: 'restaurant', styles: ['Modern', 'Intimate', 'Black tie'],
      seated: 135, standing: 200, setting: 'indoor', ceremony: true, catering: 'in-house',
      price: { model: 'per-person', low: 160, high: 175, siteFee: [12000, 12000], text: 'Food about $160–$175 per person, plus about $12,000 for the whole restaurant' },
      summary: 'Fine Canadian dining on the 54th floor of the TD Bank Tower, with views across the city and lake.',
      highlights: ['Spectacular skyline views', 'Michelin-recognized food', 'Private rooms for 24 to 54'],
      considerations: ['Full buyout seats about 135', 'Bar is extra'],
      website: 'https://www.canoerestaurant.com/weddings/',
      image: site('https://cdn.oliverbonacininetwork.com/uploads/sites/23/2019/10/mimi-david-toronto-wedding-340.jpg', 'Canoe'),
      sources: [{ label: 'Canoe weddings', url: 'https://www.canoerestaurant.com/weddings/' }, SRC.weddinghero('canoe')],
    },
  ],
};

export const VENUE_CITIES = [TORONTO];

export const VENUE_TYPES = {
  historic: { label: 'Historic', emoji: '🏛️' },
  industrial: { label: 'Industrial', emoji: '🧱' },
  garden: { label: 'Garden', emoji: '🌿' },
  estate: { label: 'Estate', emoji: '🏡' },
  hotel: { label: 'Hotel', emoji: '🏨' },
  museum: { label: 'Museum', emoji: '🖼️' },
  ballroom: { label: 'Ballroom', emoji: '💃' },
  restaurant: { label: 'Restaurant', emoji: '🍽️' },
};

export const CATERING_LABEL = {
  'in-house': 'In-house catering',
  'approved list': 'Choose from their caterers',
  outside: 'Bring your own caterer',
};

/**
 * Rough venue + food & drink estimate for a guest count, as [low, high] before
 * tax and service, plus an all-in [low, high]. Rental venues add typical
 * outside catering.
 */
export function venueEstimate(city, venue, guests) {
  const p = venue.price;
  const fee = p.siteFee || [0, 0];
  let low, high;
  if (p.model === 'per-person') {
    low = p.low * guests + fee[0];
    high = p.high * guests + fee[1];
  } else {
    low = p.low + city.outsideCatering[0] * guests;
    high = p.high + city.outsideCatering[1] * guests;
  }
  const factor = p.inclusive ? 1 : city.allInFactor;
  const round = (n) => Math.round(n / 500) * 500;
  return { low: round(low), high: round(high), allInLow: round(low * factor), allInHigh: round(high * factor), includesCatering: p.model === 'per-person' };
}

export function cityFor(text) {
  return VENUE_CITIES.find((c) => c.match.test(text || '')) || null;
}
