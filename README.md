# Lovebird

A wedding planner in an app. It tells you what to plan and book, in what order, and keeps everything in one place: vendors and their quotes, the budget, links and inspiration, the guest list, the seating chart, and the day-of timeline.

## Run it

You need Node 18+.

```bash
npm install
npm run dev
```

Then open http://localhost:5190. (`npm start` builds and serves the production version on the same port.)

## What's in it

- **Today**: a countdown, where you are in the plan, the next few steps, nudges (a vendor's hold on your date is about to expire, a payment is due, a budget line is over), and a summary of vendors, budget and guests.
- **Plan**: about 55 steps in nine phases, from "talk through what you both want" to thank-you notes. Each step explains why it matters, gives tips, and links to the part of the app where you do it. Once your date is set, every step gets a suggested deadline. Booking a vendor checks off its step, and so do things the app can see (a date is set, everyone attending has a seat). Optional steps can be marked "Not for us", and you can add your own.
- **Vendors**: 17 kinds of vendor, each with a short explainer, the details worth comparing, and the questions to ask before signing. For each option you can save its link (the photo and name are pulled in), contacts, status (saved, contacted, quote in, meeting, booked, passed), whether it's free on your date or holding it, quotes with deposits and due dates, notes, pros and cons, and answers to the questions. **Compare** lines up the options side by side and highlights the lowest price. **Book** records the contract and adds the deposit and balance to your payment schedule.
- **Budget**: targets per category, based on typical US splits (you can change them), against what's committed and paid, plus a payment schedule.
- **Guests**: type in a whole list at once, one household per line ("Jane & John Smith", "Priya Patel +1", "The Nguyens: Minh, Lan, Bao Nguyen"), or import a CSV. Tracks side, group, A/B list, RSVP, meals, dietary needs, addresses, gifts and thank-you notes. Exports to CSV.
- **Seating**: round and long tables you can drag around. Drag guests or whole households onto tables, or let **Seat everyone** do a first pass that keeps households together. Prints a list per table and an A–Z escort card list.
- **Saves**: paste any link to save it with its photo, organized into boards. **Import from Magpie** reads a Magpie backup (Magpie board → Settings → Export backup). Collections of vendors become options you can compare; everything else becomes a board. Importing the same backup again updates instead of duplicating.
- **Day-of timeline**: start from a template for a 5pm ceremony and adjust it. Your booked vendors' contacts are listed below it. Printable.
- **Ask your planner** (optional): a chat that sees a summary of your plan, vendors, budget and guest numbers. On any vendor's page, **Paste a quote** has Claude read a vendor's email or proposal into the quote fields. Both need an Anthropic API key (Settings).

## Your data

Everything is stored in this browser (IndexedDB) on this computer. Use **Settings → Export backup** now and then; the backup includes photos but not your API key, and **Restore from backup** brings it back on any computer.

The only things that leave the browser: when you paste a link, the local server fetches that page and its photo; when you use the planner chat or Paste a quote, your message and a summary of your plan go to `api.anthropic.com`.

## Code

```
src/
  data/plan.js         the roadmap: phases, steps, timing, advice
  data/categories.js   vendor kinds, budget splits, compare fields, questions
  data/dayof.js        day-of timeline template
  lib/store.js         app state (immer) saved to IndexedDB
  lib/derive.js        due dates, what's next, budget and guest totals
  lib/magpie.js        Magpie backup import
  lib/ai.js            planner chat and quote reading (Claude)
  lib/guests.js        guest list parsing and CSV
  views/               one file per page
vite.config.js         dev server, plus /api/unfurl and /api/image for link previews
```
