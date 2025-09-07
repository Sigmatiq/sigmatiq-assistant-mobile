# Assistant Mobile — TODOs (Focused Backlog)

Scope: Mobile-first web app in `sigmatiq-assistant-mobile`. Keep PRs small and user‑visible. Prioritize Beginner‑safe defaults and smooth mobile performance.

## API Integration & Data Contracts
- [ ] Fundamentals: add `/assistant/fundamentals/overview` in Assistant API (proxy Core facts/fundamentals once available) and update `fundamentalsApi.getOverview()` accordingly.
- [ ] Quotes/Charts: add `/assistant/market/quote/:symbol` and `/assistant/market/chart/:symbol` (Assistant adapters → Core). Update `marketApi.getQuote()` and `marketApi.getChartData()` to align with actual routes/params.
- [ ] Market summary normalization: remove stale `items` mapping in `getMarketSummary`; normalize to Core/Assistant response (list of summaries) and adapt consumers.
- [ ] Watchlist snapshot: pass `detail=full` from client and render real metrics (see UI section). Ensure response fields map: `spread_bps`, `rvol_10d`, `vwap_distance_pct`, `session_range_pct`.
- [ ] Error surfaces: add novice‑friendly error messages for missing provider keys or backend offline (map common 401/403/5xx).

## Visual/A11y Improvements (from review)
- [ ] Z-index: ensure Assistant drawer sits above header (drawer `z-60`, overlay `z-50`).
- [ ] Safe areas: add `.safe-bottom`, `.safe-right` CSS utilities using `env(safe-area-inset-*)` and apply to bottom nav, drawers, floating buttons.
- [ ] Breakpoints: standardize on Tailwind (mobile <768, tablet 768–1023, desktop ≥1024); remove mixed 1280 checks.
- [ ] Drawer a11y: add role="dialog", aria-modal, focus trap, ESC to close (or migrate to Radix Dialog/Drawer).
- [ ] Reduced motion: guard ticker/drawer animations behind `prefers-reduced-motion`.
- [ ] CSS scope: stop using global `.fixed` transform hack; replace with a scoped class.

## UI: Day Trading Dashboard (Phase 1)
- [ ] Watchlist card: replace placeholders with data from `/assistant/watchlists/{id}/snapshot?detail=full`.
  - Columns: price, %chg, `rvol_10d` (x), `spread_bps`, `vwap_distance_pct`.
  - Tooltips: explain RVOL, spread bps, VWAP distance (beginner friendly).
- [ ] Top movers: switch to `api.market.getTopMovers()` (already implemented) and display change% with green/red formatting.
- [ ] Market breadth: continue polling only when market open; ensure labels match Core fields.
- [ ] AI insights: keep lightweight preview mode; debounce refresh on mobile.

## Code Quality & Testing
- [ ] API client: add unit tests for market summary normalization and watchlist snapshot mapping.
- [ ] Queries: stabilize query keys (avoid full object keys), tune polling intervals for mobile power.
- [ ] Accessibility: add `aria-current` on active nav, `aria-hidden` on decorative icons, labels for icon-only buttons.

## UI: Navigation & Helpers
- [ ] Charts page: implement minimal charts view (reuse ChartingHelper layout as a page) to satisfy `activeView='charts'`.
- [ ] AssistantPanel: wire actions to real pages/helpers (screener, charts, stock info) and ensure tablet side‑panel behavior remains smooth.
- [ ] Experience levels: use `experience` to control data density (e.g., hide advanced columns for novice, show on power).

## Performance & Polling
- [ ] Polling strategy: honor `marketStatus` for refetch; reduce intervals on mobile (e.g., breadth 2–3 min, movers 3–5 min).
- [ ] Lazy loading: verify all dashboard profiles are lazy; prefetch only on demand.
- [ ] Memoization: avoid re-renders on watchlist table by keying rows and memoizing derived values.

## Config & Environments
- [ ] Verify Vite proxy targets match local ports (Assistant 8050, Core proxied via `/assistant` prefix). Update comments and README if needed.
- [ ] `.env.local`: document `VITE_API_BASE_URL` behavior (blank for proxy in dev) and timeouts.

## Testing
- [ ] Add unit tests for API client transforms (market summary normalization, watchlist snapshot mapping).
- [ ] Add lightweight component tests for Watchlist row rendering and formatters (RVOL, spread, vwap distance).
- [ ] Keep Playwright visual tests; add baseline scenarios for Day Trading dashboard.

## PWA (Optional, behind flag)
- [ ] Add manifest and service worker (workbox or Vite plugin), controlled by `VITE_ENABLE_PWA`.
- [ ] Offline notice screen and graceful data error states.

## Accessibility & Polish
- [ ] Ensure Radix components have accessible labels; tab/focus states visible on mobile.
- [ ] Add haptic‑like feedback (subtle animations) for tap interactions; keep motion reduced if user prefers.

## Docs
- [ ] Update `README.md` with intraday metrics expectations, proxy notes, and troubleshooting.
- [ ] Link API requirements to Core/Assistant endpoints (breadth, movers, watchlists snapshot) and note required env vars.

## Mode Selection (Swipe + Settings)
- [ ] Add swipe gesture hints (one-time tooltip/coach-mark) explaining top/bottom zones.
- [ ] Add toasts/haptic feedback on mode change (trading type, instrument, experience).
- [ ] Allow vertical swipe to cycle experience (optional) or dedicate a distinct gesture zone.
- [ ] Add command palette actions (Ctrl/Cmd+K) to switch trading type, asset type, and experience.
- [ ] Telemetry: log mode changes (type/asset/experience) and gesture usage for UX tuning.

## Watchlists & Universe (Backend Integration)
- [ ] Use DB-backed `watchlists` and `universe` tables instead of FE-defined system lists.
- [ ] Add API route(s) to fetch default/system watchlists and available universes.
- [ ] Migrate “Use This List” to create rows in DB and link to user.
- [ ] Cache strategies and fallback when DB unavailable (read-only FE lists as last resort).

Notes:
- This backlog assumes Core `/facts/fundamentals` and Assistant `/assistant/facts/fundamentals` land soon; if not, temporarily point `fundamentalsApi.getOverview()` to an existing Assistant/Core route or hide the feature.
- Keep changes incremental: first fix data contracts and watchlist metrics, then add missing routes, then polish UI/UX.
