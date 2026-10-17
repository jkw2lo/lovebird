# Lovebird

A wedding planner in an app. It tells you what to plan and book, in what order, and keeps everything in one place: vendors and their quotes, the budget, links and inspiration, the guest list, the seating chart, and the day-of timeline.

## Run it

You need Node 18+.

```bash
npm install
npm run dev
```

Then open http://localhost:5190. (`npm start` builds and serves the production version on the same port.)

### The online copy

Every push to `main` builds the app and publishes it to https://jkw2lo.github.io/lovebird/ (see `.github/workflows/pages.yml`). It works on any device, including your phone, with two differences: the plan is saved only in that browser (no `data` folder, so export backups now and then), and link previews don't work. It's a separate copy from the one on your computer; use **Settings → Export backup / Restore from backup** to move a plan between them.

## What's in it

- **Today**: a countdown, where you are in the plan, the next few steps, nudges (a vendor's hold on your date is about to expire, a payment is due, a budget line is over), and a summary of vendors, budget and guests.
- **Plan**: about 55 steps in nine phases, from "talk through what you both want" to thank-you notes. Each step explains why it matters, gives tips, and links to the part of the app where you do it. Once your date is set, every step gets a suggested deadline. Booking a vendor checks off its step, and so do things the app can see (a date is set, everyone attending has a seat). Optional steps can be marked "Not for us", and you can add your own.
- **Vendors**: 17 kinds of vendor, each with a short explainer, the details worth comparing, and the questions to ask before signing. For each option you can save its link (the photo and name are pulled in), contacts, status (saved, contacted, quote in, meeting, booked, passed), whether it's free on your date or holding it, quotes with deposits and due dates, notes, pros and cons, and answers to the questions. **Compare** lines up the options side by side and highlights the lowest price. **Book** records the contract and adds the deposit and balance to your payment schedule.
- **Discover venues** (Vendors → Venue): 60 venues researched in October 2026 across **Toronto** (37, including restaurants with great food and views), **New York City** (17) and **Jersey City** (6), opening on the city in your wedding details. Each has capacity, catering setup, setting, price notes, highlights and things to know, links to the venue and every source, and a photo (the venue's own preview image or a credited, freely licensed Wikimedia Commons photo, linked rather than copied). Filter by guest count, kind of venue, catering, great view, known for the food, outdoor space and budget, and see an all-in estimate for your guest count using each city's sales tax and typical service charges (13% HST in Toronto, 8.875% in NYC, 6.625% in NJ), plus typical catering for bring-your-own venues. **Add to my options** brings a venue into your vendors ready to compare. Prices are starting estimates: confirm with each venue. The data is in `src/data/venues/`, one file per city.
- **Budget**: targets per category, based on typical US splits (you can change them), against what's committed and paid, plus a payment schedule.
- **Guests**: type in a whole list at once, one household per line ("Jane & John Smith", "Priya Patel +1", "The Nguyens: Minh, Lan, Bao Nguyen"), or import a CSV. Tracks side, group, A/B list, RSVP, meals, dietary needs, addresses, gifts and thank-you notes. Exports to CSV.
- **Seating**: round and long tables you can drag around. Drag guests or whole households onto tables, or let **Seat everyone** do a first pass that keeps households together. Prints a list per table and an A–Z escort card list.
- **Saves**: paste any link to save it with its photo, organized into boards. **Import from Magpie** reads a Magpie backup (Magpie board → Settings → Export backup). Collections of vendors become options you can compare; everything else becomes a board. Importing the same backup again updates instead of duplicating.
- **Day-of timeline**: start from a template for a 5pm ceremony and adjust it. Your booked vendors' contacts are listed below it. Printable.
- **Ask your planner** (optional): a chat that sees a summary of your plan, vendors, budget and guest numbers. On any vendor's page, **Paste a quote** has Claude read a vendor's email or proposal into the quote fields. Both need an Anthropic API key (Settings).

## Guided input

- **Add something** (the + button, or press **N** anywhere): save a link, add a vendor, log a quote, add guests, record RSVPs as they come in, add an expense, add a to-do.
- **Build your guest list step by step**: walks through each circle (immediate family, extended family, close friends, wider circle, work, family friends) for each of you, then shared friends, with a running count against your target. Guests are saved as you go.
- **Plan your budget step by step**: who's contributing, headcount (with a per-guest reality check), your top three priorities, then a split that gives those categories more. Every number stays editable.
- **On a call or tour?** On any vendor's page: the questions worth asking, one card at a time, then whether your date is open, the price, and how it felt. Everything lands on their page.
- **Saves**: drop pictures or paste a screenshot or link anywhere on the page.
- **Day-of**: change the ceremony time and the whole day moves with it.
- Celebrations when you book a vendor, finish a phase of the plan, get every RSVP in, or seat everyone.

## Your data

Every change is saved in two places:

- **In the browser** (IndexedDB), so the app is instant.
- **As files in `data/`** in this folder, through the local server: `data/plan.json`, `data/photos/`, and a copy of the plan from each of the last 30 days in `data/history/`.

When Lovebird starts, it loads whichever copy is newer. So clearing your browser, switching browsers, or a save that didn't go through doesn't lose anything. `data/` is in `.gitignore`: your wedding details never go to GitHub. To move to another computer, copy the `data` folder along with the project, or use **Settings → Export backup**.

Photos are shrunk to at most 1600px when saved (a 5 MB phone photo becomes a few hundred KB). Your API key is kept in the browser only, never in `data/` or backups.

What leaves your computer: when you paste a link, the local server fetches that page and its photo; when you use the planner chat or Paste a quote, your message and a summary of your plan go to `api.anthropic.com`. The local server only answers Lovebird itself, not other websites open in the same browser.

## Code

```
src/
  data/plan.js         the roadmap: phases, steps, timing, advice
  data/categories.js   vendor kinds, budget splits, compare fields, questions
  data/dayof.js        day-of timeline template
  lib/store.js         app state (immer), saved to IndexedDB and data/, with migrations
  lib/photos.js        photo shrinking and disk mirroring
  lib/derive.js        due dates, what's next, budget and guest totals
  lib/magpie.js        Magpie backup import
  lib/ai.js            planner chat and quote reading (Claude)
  lib/guests.js        guest list parsing and CSV
  views/               one file per page
server/storage.js      saves the plan and photos to data/
vite.config.js         dev server, plus /api/unfurl and /api/image for link previews
```
