# The Block — CLAUDE.md

## Project
Buyer-side vehicle auction platform. React + Vite + Tailwind CSS + React Router v6.
Data: /data/vehicles.json — load once into React context at startup, never mutate.
State: React Context + localStorage. No backend. No auth.

## Rules
1. Tailwind only. No inline styles. No CSS files.
2. Bid state persists to localStorage keyed by vehicle ID. See SPEC.md §4 for schema.
3. Claude API key from `import.meta.env.VITE_CLAUDE_API_KEY`. Always use mock fallback if absent or if call fails. Mock must use same visual treatment as real response — no degraded UI.
4. All layouts must work at 375px (mobile) and 1280px (desktop).
5. No shadows. Cards are bg-zinc-50 border border-zinc-200 rounded-lg.
6. Numbers (bids, odometer, VIN, lot numbers) always font-mono.
7. Auction status is always derived from getAuctionStatus(vehicle) utility — never inline logic.
8. Keep components small and single-responsibility. Extract shared UI into /components/ui/.
9. All files use `.tsx` or `.ts`. No `.jsx` or `.js`.

## Design tokens
- Background: white. Card surface: zinc-50, border zinc-200 1px.
- Primary text: zinc-900. Secondary: zinc-500. Labels: zinc-400.
- Accent: amber-400 — active bid, Live status pill, Buy Now button, ending-soon signal.
- Condition grade: green-500 (≥4.0), amber-400 (≥2.5), red-500 (<2.5).
- Damage/warning: red-500. Reserve met: green-500.
- Typography: Inter. Headings font-semibold. Labels uppercase tracking-wide text-xs font-medium.

## Key files
- SPEC.md — full product spec, component tree, utility function signatures, all feature detail
- src/types.ts — shared TypeScript interfaces: Vehicle, Bid, AuctionStatus, AppContextType
- data/vehicles.json — 200 vehicle records, load once
- .env.example — VITE_CLAUDE_API_KEY placeholder

## File structure
```
src/
  types.ts    Shared interfaces: Vehicle, Bid, AuctionStatus, AppContextType
  context/    AppContext.tsx (vehicles, bids, watchlist, compare state)
  pages/      InventoryPage.tsx, VehicleDetailPage.tsx, WatchlistPage.tsx, ComparePage.tsx
  components/
    ui/        VehicleCard.tsx, ConditionBadge.tsx, AuctionStatusPill.tsx, BidForm.tsx, ImageGallery.tsx
    layout/    Navbar.tsx, Layout.tsx
  utils/       auctionUtils.ts, formatUtils.ts, bidUtils.ts
  hooks/       useLocalStorage.ts, useBidState.ts
```
