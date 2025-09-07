# Day Trading Dashboard Spec

Status: Draft v0.1
Scope: Analysis-only now; paper trading later.
Profiles: Day Trading × Experience (Beginner now; Intermediate/Advanced TBD)

## Beginner Experience

### Sticky Status Bar (always visible; all experience levels)
- Market Status: Open/Close; time to open/close; pre/post flag.

### Cards (7 total)
1) Watchlist
- Fields: Price, %chg, RVOL(10d), Spread(bps), VWAP distance, Session Range%.
- Defaults: Sort by RVOL desc; highlight illiquidity (Spread > 20 bps, RVOL < 0.5).
- Actions: One‑click alert (price/VWAP/ORB); add/remove from watchlist.

2) Top Opportunities
- Ranked by: score, coverage, reliability, regime.
- Show: brief explainer of “why” (plain language) and entry/ATR stop/1R–2R targets (sim only).

3) Focus Symbol
- Mini overview: Price, %chg, VWAP distance, RVOL, Session Range%.
- Badges: ORB H/L, Session H/L, Earnings/News/Halt indicators.

4) Market Breadth
- Advancers/Decliners, Up/Down Volume, New Highs/Lows (compact chips; tap for details).

5) Top Gainers/Losers
- Intraday movers list with liquidity/RVOL filter; swipe tabs (Gainers | Losers) on mobile.

6) Today’s Calendar
- Earnings, dividends, splits, economic events; impact tags (pre/open/mid/close/after).

7) Alerts Inbox
- Recent triggers, snooze/ack, quick jump to chart/symbol overview.

### Responsive Layout
- Desktop: Separate cards; grid layout.
- Tablet: Combine Breadth + Status if needed to save space.
- Mobile: Scrollable separate cards; Status as slim sticky strip; Gainers/Losers uses swipe tabs.

### Safety & Explainability
- Beginner mode: analysis-only actions; show reliability and coverage prominently.
- Guardrails: Highlight illiquidity (Spread > 20 bps or RVOL < 0.5).

### Acceptance Criteria (Beginner)
- Sticky Market Status visible on all views.
- 7 cards render with fields above; drill‑through from Watchlist/Alerts to symbol overview.
- Gainers/Losers supports swipe tabs on mobile; Breadth chips expand on tap.
- Top Opportunities shows score/coverage/reliability and plain‑language rationale.

---

## Intermediate Experience
- Sticky Status Bar: same as Beginner (always visible).
- Cards: same 7 as Beginner; refinements below.
  - Watchlist: optional L2/imbalance snapshot column.
  - Top Opportunities: add trend/range tag beside score.
  - Focus Symbol: depth snapshot (top 10 levels).
  - Market Breadth: intraday breadth sparkline.
  - Movers/Halts: RVOL spikes, halts, imbalance (paired with Gainers/Losers or sibling card).
  - Calendar & Alerts: same as Beginner; advanced throttling options.

## Advanced/Pro Experience
- Sticky Status Bar: same as Beginner (always visible).
- Cards: same 7 as Beginner; richer info with simple tech (no DOM/L2).
  - Watchlist: add ATR%, Imbalance flag, Short interest, Borrow fee note; sortable.
  - Top Opportunities: indicator breakdown, confidence band, regime tag.
  - Focus Symbol: liquidity score (spread+depth proxy), RVOL trend, expected move cone.
  - Market Breadth: A/D, up/down volume, sector heatmap, correlation chip.
  - Movers: tabs (Gainers, Losers, RVOL spikes, Post‑earnings).
  - Calendar & Alerts: unchanged; allow custom rules and finer throttling (analysis-only).

## Notes
- Aligns with Rules of Engagement: beginner‑first, safe defaults, explainability.
- Canonical signal schema: {score, coverage, reliability, indicators_used, total_indicators, regime}.

## Cross-Cutting Enhancements (All Levels)
- Setup type tag on Top Opportunities (e.g., breakout, reversion, drift).
- Freshness: last‑updated timestamp + reliability badge on every card; stale‑data badge intraday.
- Coverage: show per‑symbol coverage% (e.g., past 6m) in signal blocks.
- Actionability: show entry, ATR stop, and 1R/2R targets wherever signals appear.
- Level specifics: Beginner = basic liquidity badge; Intermediate = liquidity score + 1R/2R payoff table; Advanced = expected slippage details.

## API Mapping — Watchlist (Day)
- Endpoint: GET `/watchlists/{watchlist_id}/snapshot` (extend with `detail=full`).
- Provides: symbol, price, %chg (existing); add fields per symbol:
  - `spread_bps` (from bid/ask), `vwap`, `vwap_distance`, `session_range_pct`, `rvol_10d`.
- Badges: `prepost_flag` (market clock vs RTH) only. Omit `earnings_today` and `halt` (not reliably available via Polygon/Alpha).
- Fallbacks: on intraday failure omit metric, set low reliability, add stale badge.
- Implementation notes: reuse `fetch_bars` for 1m VWAP/session stats; ensure provider exposes tickers snapshot with bid/ask.

## API Mapping — Focus Symbol (Day)
- Endpoint: extend GET `/market/summary` with `symbols=SYM&timeframe=1m&detail=intraday`.
- Computes: last/%chg, VWAP + `vwap_distance`, session H/L + `session_range_pct`, `rvol_10d`, ORB H/L (first 5m).
- Badges: `prepost_flag` only (derive via ET time vs RTH window).
- Fallbacks: if 1m fetch fails, return daily-only fields; mark low reliability + stale badge.
- Implementation notes: reuse `fetch_bars` for 1m; ORB uses first N minutes of today; avoid new routes if possible.

## API Mapping — Market Breadth (Day)
- Endpoint: GET `/market/breadth?preset_id=sp500&timeframe=day&cap=50&series_days=0` (existing).
- Provides: advancers/decliners/unchanged counts; 52w highs/lows; `as_of` timestamp.
- Mobile chips: use counts directly; desktop can show optional sparkline if series_days>0.
- Notes: cache is built-in (5 min). Use `force_refresh=true` sparingly.

## API Mapping — Top Gainers/Losers (Day)
- Endpoint: GET `/market/movers?direction=both&limit=10&include_otc=false` (existing).
- Provides: two lists `gainers`, `losers`; includes basic fields from Polygon movers.
- Mobile: render as tabs (Gainers|Losers). Desktop: separate tables if space allows.
- Notes: 5‑minute cache; supports `force_refresh=true` when needed.

## API Mapping — Top Opportunities (Day)
- Endpoint: GET `/opportunities?limit=20` (existing); extend with `expand=analysis`.
- Baseline: ranked items with `matched_symbols`, `confidence`, `tags`, `last_updated`.
- Expand payload per symbol: `score, coverage, reliability, regime, setup_type`.
- Derived fields: `entry`, `atr_stop`, `targets_1R_2R` from Polygon 1m bars (server‑side compute).
- Fallbacks: if intraday fetch fails, return daily‑based estimates; mark low reliability + stale badge.
- Minimal change: add `expand=analysis` handling in router; no new route.

## API Mapping — Alerts Inbox (Day)
- Endpoint: GET `/alerts/recent?limit=20` (existing). Filter by user via `X-User-Id` header or `user_id` param.
- Fields: `alert_id, user_id, symbol, timeframe, decision, score, model_id, model_version, created_at`.
- UX: list + snooze/ack client-side; drill‑through to Focus Symbol.
- Notes: extend later for alert bundling/throttling metadata if needed; no change for MVP.

## API Mapping — Market Status (Sticky)
- Client-side compute: ET clock vs regular trading hours → Open/Close and time to next phase; add pre/post flag.
- Optional future: small GET `/market/status` returning `{open, until, phase}` if centralization desired.

## Core API Mapping
- See Core API-level and field-level mapping in `core_api_mapping.md` (Day Trading).

## Assistant API Mapping
- See Assistant API mapping in `assistant_api_mapping.md` for adapter endpoints and intent wiring.

## Engineering Acceptance Criteria
- Data models: Pydantic models for signals and each card payload; no hidden globals; pure functions.
- Testing: Unit tests for RVOL, ATR stops, ORB, expected move; property-based edge tests; snapshot tests for card JSON.
- Performance: Cache minute aggregates; debounce UI updates; target <120 ms chart paint and <200 ms card refresh; batch API requests.
- Reliability: Freshness timestamps, reliability flags, graceful degradations; audit fallbacks via `sigmatiq_shared.audit`.
- Types/Lint: mypy clean (py38+), ruff/black; explicit types; avoid tight coupling between cards.
- Observability: Minimal metrics (latency, cache hit rate, error rate); audit risk/guardrail overrides.

## Known Limitations (Data Gaps)
- Borrow/shortability and borrow fee rates are not included.
- True Level II/DOM depth and auction imbalance data are out of scope.
- Institutional ownership, insider transactions, analyst ratings/targets not shown.
- Halt/resume reason codes not integrated; basic badges only.
- Short interest (daily/biweekly) not integrated.
- Historical IV surfaces across strikes/expiries not included.
