# Swing Trading Dashboard Spec

Status: Draft v0.1
Scope: Analysis-only now; paper trading later.
Profiles: Swing Trading × Experience (Beginner now; Intermediate/Advanced TBD)

## Sticky Status Bar (all experience levels)
- Market Status: Open/Close; time to open/close; pre/post flag.

## Beginner Experience

### Cards (6 total)
1) Watchlist
- Fields: Price, 1D %, 5D %, RVOL(20d), ATR%, Gap flag.
- Defaults: Sort by 1D %; filter extreme illiquidity.

2) Top Opportunities
- Show: score, coverage, reliability, regime; entry/stop/1R–2R targets (sim only).

3) Focus Symbol
- Mini overview: 5D and 1M sparklines; trend tag; key S/R.

4) Market Pulse
- Sector rotation mini-heatmap; breadth chips (A/D, NH/NL).

5) Events (Next 2 weeks)
- Earnings, dividends, splits, major econ; impact tags.

6) Alerts Inbox
- Breakout/breakdown, MA cross; snooze/ack; jump to symbol.

### Responsive Layout
- Desktop: Separate cards; grid.
- Mobile: Scrollable cards; Status sticky.

### Notes
- Canonical signal schema: {score, coverage, reliability, indicators_used, total_indicators, regime}.
- Beginner-first: safe defaults, explainability; analysis-only actions.

## Cross-Cutting Enhancements (All Levels)
- Setup type tag on Top Opportunities (e.g., breakout, reversion, drift).
- Freshness: last‑updated timestamp + reliability badge on every card; stale‑data badge intraday.
- Coverage: show per‑symbol coverage% (e.g., past 6m) in signal blocks.
- Actionability: show entry, ATR stop, and 1R/2R targets wherever signals appear.
- Level specifics: Beginner = basic liquidity badge; Intermediate = liquidity score + 1R/2R payoff table; Advanced = expected slippage details.

## Engineering Acceptance Criteria
- Data models: Pydantic models for signals and each card payload; no hidden globals; pure functions.
- Testing: Unit tests for RVOL, ATR stops, trend/range detection; property-based edge tests; snapshot tests for card JSON.
- Performance: Cache aggregates; debounce UI updates; target <120 ms chart paint and <200 ms card refresh; batch API requests.
- Reliability: Freshness timestamps, reliability flags, graceful degradations; audit fallbacks via `sigmatiq_shared.audit`.
- Types/Lint: mypy clean (py38+), ruff/black; explicit types; avoid tight coupling between cards.
- Observability: Minimal metrics (latency, cache hit rate, error rate); audit risk/guardrail overrides.

## Known Limitations (Data Gaps)
- Borrow/shortability and borrow fee rates are not included.
- True Level II/DOM depth and auction imbalance data are out of scope.
- Institutional ownership, insider transactions, analyst ratings/targets not shown.
- Earnings call transcripts and guidance deltas not included.
- Short interest (daily/biweekly) not integrated.
- Historical IV surfaces across strikes/expiries not included.

## Intermediate Experience
- Cards: same 6 as Beginner; refinements below.
  - Watchlist: add 1M %, 3M %, and RVOL trend arrow.
  - Top Opportunities: add trend vs range tag and confidence band.
  - Focus Symbol: 1M/3M sparklines; key MAs (20/50/200).
  - Market Pulse: sector rotation + breadth sparkline (adv/decline).
  - Events & Alerts: add insider/filings flag; MA cross and range break alerts.

## Advanced/Pro Experience
- Cards: same 6 as Beginner; richer info only (keep tech simple).
  - Watchlist: valuation chip (P/E or EV/EBITDA), short interest, ATR band tag; sortable.
  - Top Opportunities: indicator breakdown + regime tag; confidence band.
  - Focus Symbol: multi-timeframe alignment badges (D/W/M), liquidity score, expected move cone.
  - Market Pulse: sector heatmap + correlation chip vs SPY/sector.
  - Movers: tabs (Gainers, Losers, RVOL spikes, Post‑earnings drift).
  - Events & Alerts: unchanged; allow finer throttling (analysis-only).

---

## API Mapping — Watchlist (Swing)
- Endpoint: GET `/watchlists/{watchlist_id}/snapshot` (extend with `detail=swing`).
- Add per-symbol fields: `ret_1d`, `ret_5d`, `ret_1m`, `ret_3m`, `atr_pct`, `gap_flag`.
- Compute from Polygon daily bars; ATR% = ATR(14) / price; gap vs prior close.
- Fallbacks: if daily missing, omit metric; set low reliability.

## API Mapping — Top Opportunities (Swing)
- Endpoint: GET `/opportunities?limit=20&expand=analysis`.
- Include canonical fields + `setup_type`; derive `entry/atr_stop/targets` from daily bars.

## API Mapping — Focus Symbol (Swing)
- Endpoint: extend GET `/market/summary` with `symbols=SYM&timeframe=day&detail=swing`.
- Add: 5D/1M/3M sparklines, trend tag, MAs (20/50/200), key S/R (pivot highs/lows).
- Fallbacks: if compute fails, return base summary only.

## API Mapping — Market Pulse (Swing)
- Endpoint: GET `/market/breadth?preset_id=sp500&timeframe=day&cap=50&series_days=0`.
- Use counts for A/D and NH/NL; sector rotation heatmap deferred.

## API Mapping — Events & Alerts (Swing)
- Events: omit upcoming earnings in MVP (provider gap); show none.
- Alerts: GET `/alerts/recent?limit=20` (existing); same as Day.

## API Mapping — Market Status (Sticky)
- Client-side compute: ET clock vs regular trading hours → Open/Close and time to next phase; add pre/post flag.
- Optional future: small GET `/market/status` returning `{open, until, phase}` if centralization desired.

## Core API Mapping
- See Core API-level and field-level mapping in `core_api_mapping.md` (Swing Trading).

## Assistant API Mapping
- See Assistant API mapping in `assistant_api_mapping.md` for adapter endpoints.
