# The Block — Product & Technical Spec
**Author:** Dhiren Vazirani | **Date:** April 2026 | **Status:** Final

---

## 1. Problem Statement

Build the buyer side of a vehicle auction platform. 200 vehicles loaded from a static JSON dataset. Buyers browse inventory, inspect vehicles, and place bids. No backend, no auth, no seller workflows.

---

## 2. What We're Building

### Core (required, build first)
- Inventory browse with search and filter
- Vehicle detail view: specs, condition, damage notes, dealership, photos
- Bid flow with visible state update
- Fully responsive: 375px mobile and 1280px desktop

### AI Feature (part of core, not stretch)
- Buyer Intelligence card on the detail page
- Calls Claude API with vehicle condition data
- Returns 2-3 sentence plain English buyer assessment
- Deterministic mock fallback when API key is absent — same visual treatment, not degraded

### Stretch (in priority order — only if core is solid)
1. Buy Now flow with ending-soon urgency signal
2. Watchlist with localStorage persistence
3. Compare mode — select up to 2 vehicles, side-by-side spec and condition comparison

### Explicitly Not Building
- Auth or user accounts
- Seller workflows, dealer admin, checkout, payments
- Backend or database
- Animations beyond CSS transitions

---

## 3. Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS only — no inline styles, no CSS files
- **Routing:** React Router v6
- **State:** React Context + localStorage
- **AI:** Claude API (claude-sonnet-4-20250514) with mock fallback
- **No other libraries unless strictly necessary**

---

## 4. Data Layer

### Vehicle Data
- Load `data/vehicles.json` once at app startup into React context
- Never re-fetch, never mutate the source
- Merge localStorage bid state with vehicle data on load so current_bid reflects session bids

### Bid State — localStorage schema
```json
{
  "bids": {
    "[vehicleId]": {
      "amount": 24500,
      "timestamp": "2026-04-14T10:30:00",
      "isWinning": true
    }
  }
}
```
- `isWinning` = true if bid amount >= reserve_price at time of placement
- Bid state persists across page refreshes within the same browser session

### Watchlist State — localStorage schema
```json
{
  "watchlist": ["vehicleId1", "vehicleId2"]
}
```

### Auction Timing Normalization
- auction_start timestamps in the dataset are synthetic
- On app load, normalize deterministically based on vehicle ID (not random — same vehicle always has same status within a session)
- Target distribution: ~30% Live (started within last 2 hours), ~50% Upcoming (starting within next 24 hours), ~20% Ended
- Expose a utility function: `getAuctionStatus(vehicle): 'live' | 'upcoming' | 'ended'`
- Expose: `getTimeDisplay(vehicle): string` — e.g. "Ends in 1h 24m" | "Starts in 3h" | "Ended"

---

## 5. Routes

```
/                  Inventory browse
/vehicle/:id       Vehicle detail
/watchlist         Watchlist (stretch)
/compare           Compare mode (stretch)
```

Back navigation from detail page must restore scroll position and active filters on inventory page.

---

## 6. Inventory Page

### Search
- Single text input, searches across: make, model, year (as string), trim, city
- Debounced 300ms
- Clears on X button

### Filters
- Make — dropdown, populated dynamically from dataset
- Body style — dropdown, populated dynamically
- Condition grade — range slider, 1.0 to 5.0, step 0.1
- Province — dropdown, populated dynamically
- All filters combine with AND logic
- "Clear all filters" button visible when any filter is active

### Sort
- Current bid: low to high
- Current bid: high to low
- Condition grade: best first
- Ending soon: soonest auction_start first (live vehicles surface to top)

### Vehicle Cards
- Image: 16:9 aspect ratio, full width of card
- Year Make Model — semibold, large
- Trim — muted, smaller
- Lot number — monospace, small, muted
- Location: City, Province
- Current bid — large, monospace, prominent
- Bid count — muted small "16 bids"
- Condition grade badge — colored dot + number (green 4+, amber 2.5–4, red <2.5)
- Auction status pill — Live (green), Upcoming (amber), Ended (zinc)
- If Buy Now price exists: small "Buy Now Available" tag

### Pagination
- 20 vehicles per page
- Previous / Next controls
- "Showing X–Y of Z vehicles" label

### Empty State
- Clear message when filters return nothing
- "Reset filters" button

---

## 7. Vehicle Detail Page

### Image Gallery
- Cycle through images array
- Left/right arrow navigation
- Current image index indicator (e.g. "2 / 4")
- Full width on mobile, constrained on desktop
- Placeholder images from dataset display cleanly in the frame

### Layout — Desktop
- Two column: left (60%) gets image gallery + specs + condition + AI card + dealership
- Right (40%) gets sticky bid panel + auction status

### Layout — Mobile
- Single column: image → auction status → bid panel → specs → condition → AI card → dealership

### Specs Section
- Engine, transmission, drivetrain, fuel type
- Odometer in monospace with "km" label
- VIN in monospace, small
- Exterior/interior color
- Body style

### Condition Section
- Condition grade: large numeral + colored dot + label (Excellent / Good / Fair / Poor)
- Grade thresholds: 4+ Excellent, 3–4 Good, 2–3 Fair, <2 Poor
- Condition report: full text
- Damage notes: bulleted list, each item prefixed with a red warning dot
- Title status: badge — "Clean Title" (green) or "Salvage" (red)

### AI Buyer Intelligence Card
- Headline: "Buyer Intelligence"
- Subhead: "AI-powered condition assessment"
- Loading state: skeleton shimmer while API call is in flight
- On success: 2-3 sentence plain English assessment
- On fallback (no key or API error): deterministic mock based on condition_grade — same visual treatment, no "fallback" label

**API call inputs:**
```
condition_grade, condition_report, damage_notes (joined),
title_status, starting_bid, current_bid, reserve_price
```

**System prompt:**
```
You are a vehicle auction assistant helping buyers make informed decisions.
Be direct, specific, and honest. Never recommend buying or not buying.
Assess the condition and value objectively in 2-3 sentences.
Cover: condition reality, any red flags from damage notes, whether current bid reflects condition.
Be specific about damage noted. Do not use filler phrases.
```

**Model:** claude-sonnet-4-20250514
**Temperature:** 0.3
**Max tokens:** 200
**API key:** read from `import.meta.env.VITE_CLAUDE_API_KEY`

**Mock fallback logic (deterministic, not random):**
```
grade >= 4.0:
"This vehicle presents well for its price point. Condition is above average
with only minor cosmetic issues noted. At current bid levels this represents
reasonable market value."

grade >= 2.5:
"This vehicle shows moderate wear consistent with its use. The damage noted
is manageable but warrants a pre-purchase inspection. Factor repair costs
against the current bid before committing."

grade < 2.5:
"This vehicle has significant condition issues that warrant careful
consideration. The damage noted is material and will require meaningful
investment. Bid conservatively and budget for inspection costs."
```

### Selling Dealership
- Name, city, province
- Simple card, no extra detail needed

### Auction Status Panel (sticky on desktop)
- Current bid — large, monospace
- Bid count
- Reserve status: "Reserve met" (green) or "Reserve not met" (zinc/muted)
- Buy Now price if present: displayed prominently above bid input
- Time display: "Ends in 1h 24m" / "Starts in 3h" / "Auction ended"

### Bid Flow
- Input pre-populated with current_bid + minimum increment
- Minimum increment: max(500, current_bid * 0.05) — whichever is larger
- Validation: bid must exceed current bid. Show inline error if not.
- Submit button: "Place Bid"
- On submit: optimistic update — update bid state in context and localStorage, increment bid count, show success state inline
- If bid >= reserve_price: show "Reserve met" state
- No modal. All state changes inline in the panel.
- If auction status is Ended: disable bid input, show "Auction has ended"

### Buy Now Flow (stretch)
- Only shown if buy_now_price is not null
- Displayed above bid input in auction panel
- "Buy Now — $XX,XXX" button in amber
- On click: confirmation state inline ("Confirm purchase at $XX,XXX?") with Confirm and Cancel
- On confirm: mark vehicle as purchased in state, disable bid input, show "Purchased" state
- Urgency signal: if auction status is Live and time remaining < 2 hours, show "Ending soon" red pill near Buy Now button

---

## 8. Watchlist (Stretch)

- Heart icon on each vehicle card and on detail page
- Toggle adds/removes from watchlist in localStorage
- /watchlist route shows grid of watchlisted vehicles using same VehicleCard component
- Empty state: "No vehicles saved. Browse inventory to add vehicles to your watchlist."
- Count shown in nav icon badge

---

## 9. Compare Mode (Stretch)

- "Compare" checkbox or button on vehicle cards (max 2 selected)
- Sticky compare bar at bottom of screen when 1–2 vehicles selected
- /compare route: side-by-side two-column layout
- Compare rows: image, year/make/model, condition grade, engine, transmission, drivetrain, odometer, current bid, reserve status, damage notes
- Differences highlighted: if values differ, mark the better value (lower bid, higher grade)
- "Add to compare" CTA if only 1 vehicle selected
- Clear compare button

---

## 10. Design System

### Colors
```
Background:        white (#ffffff)
Card surface:      zinc-50 (#fafafa), border zinc-200 1px
Primary text:      zinc-900
Secondary text:    zinc-500
Muted/label:       zinc-400

Accent (amber):    amber-400 — active bid state, Live status, Buy Now button, ending soon
Condition good:    green-500 (grade 4+)
Condition mid:     amber-400 (grade 2.5–4)
Condition poor:    red-500 (grade <2.5)
Damage/warning:    red-500
Reserve met:       green-500
Clean title:       green-500
Salvage title:     red-500
```

### Typography
```
Font:              Inter (system fallback: sans-serif)
Headings:          font-semibold
Body:              font-normal
Labels/tags:       font-medium, uppercase, tracking-wide, text-xs
Numbers (bids, odometer, VIN, lot): font-mono
```

### Spacing
- Container padding: p-6 minimum on all pages
- Card padding: p-4
- Section gaps: gap-6 between major sections
- Generous whitespace — do not cram

### Cards
- bg-zinc-50, border border-zinc-200, rounded-lg
- No shadows
- Hover: border-zinc-300, transition-colors

### Buttons
- Primary (bid, confirm): bg-amber-400 text-zinc-900 font-semibold rounded-md px-4 py-2 hover:bg-amber-500
- Secondary: border border-zinc-300 text-zinc-700 rounded-md px-4 py-2 hover:bg-zinc-50
- Destructive/warning: bg-red-500 text-white

### Status Pills
- Live: bg-green-100 text-green-700 font-medium rounded-full px-2 py-0.5 text-xs
- Upcoming: bg-amber-100 text-amber-700
- Ended: bg-zinc-100 text-zinc-500

### Responsive Breakpoints
- Mobile: default (375px+)
- Tablet: md (768px+)
- Desktop: lg (1280px+)
- Inventory grid: grid-cols-1 → grid-cols-2 md → grid-cols-3 lg

---

## 11. Component Tree

```
App
├── AppProvider (context: vehicles, bids, watchlist, compare)
├── Router
│   ├── Layout
│   │   ├── Navbar
│   │   │   ├── Logo
│   │   │   ├── SearchInput (on inventory page only)
│   │   │   └── WatchlistIcon (with badge count)
│   │   └── Outlet
│   ├── InventoryPage
│   │   ├── FilterBar
│   │   │   ├── SearchInput
│   │   │   ├── MakeFilter
│   │   │   ├── BodyStyleFilter
│   │   │   ├── ProvinceFilter
│   │   │   ├── ConditionGradeSlider
│   │   │   └── SortSelect
│   │   ├── VehicleGrid
│   │   │   └── VehicleCard (×N)
│   │   │       ├── VehicleImage
│   │   │       ├── ConditionBadge
│   │   │       ├── AuctionStatusPill
│   │   │       ├── WatchlistButton
│   │   │       └── CompareCheckbox (stretch)
│   │   ├── Pagination
│   │   ├── EmptyState
│   │   └── CompareBar (stretch, sticky bottom)
│   ├── VehicleDetailPage
│   │   ├── ImageGallery
│   │   ├── VehicleSpecs
│   │   ├── ConditionSection
│   │   │   ├── ConditionGradeDisplay
│   │   │   ├── DamageNotesList
│   │   │   └── TitleStatusBadge
│   │   ├── BuyerIntelligenceCard (AI)
│   │   ├── DealershipCard
│   │   └── AuctionPanel (sticky desktop)
│   │       ├── AuctionStatusDisplay
│   │       ├── BuyNowButton (stretch, conditional)
│   │       └── BidForm
│   ├── WatchlistPage (stretch)
│   └── ComparePage (stretch)
```

---

## 12. Key Utility Functions

```javascript
// Normalize auction status deterministically
getAuctionStatus(vehicle) → 'live' | 'upcoming' | 'ended'

// Get human-readable time display
getTimeDisplay(vehicle) → string

// Calculate minimum bid increment
getMinBid(currentBid) → number  // max(500, currentBid * 0.05)

// Format currency
formatCurrency(amount) → string  // "$24,500"

// Format odometer
formatOdometer(km) → string  // "47,731 km"

// Get condition label
getConditionLabel(grade) → string  // 'Excellent' | 'Good' | 'Fair' | 'Poor'

// Get condition color class
getConditionColor(grade) → string  // Tailwind class string
```

---

## 13. Decisions to Document in SUBMISSION.md

1. **Why localStorage over backend** — Frontend-only is explicitly acceptable. Bid persistence across page refreshes within a session is sufficient for a prototype. No setup complexity for the reviewer.

2. **Why AI condition summary as core, not stretch** — The challenge asks for features that make the buyer experience "clearer, more useful, or more trustworthy." An AI-powered condition assessment directly addresses buyer trust, which is the hardest problem in used vehicle auctions. It's the most product-relevant AI use case available in this dataset.

3. **Why Buy Now as first stretch priority** — buy_now_price exists in the data. The ending-soon urgency signal is a real auction mechanic. This completes a real purchase flow that the dataset already supports.

4. **Auction timing normalization** — Timestamps are synthetic. Deterministic normalization by vehicle ID ensures consistent behavior within a session without randomness.

5. **Mock fallback design** — The fallback uses the same visual treatment as the API response. No "API unavailable" messaging. A reviewer without an API key sees a complete experience.

---

## 14. AI Workflow to Document in SUBMISSION.md

- Wrote full product spec before forking the repo
- Created CLAUDE.md with project rules and design tokens (under 500 tokens)
- Used Claude Code with Opus for planning session (component tree, context shape, utility functions)
- Switched to Sonnet for all implementation
- Used /compact between major features to manage context
- Reviewed every component before accepting — did not merge outputs blindly
- Caught and corrected: [fill in honestly after build]
- All product decisions made before prompting — AI executed against a clear spec
