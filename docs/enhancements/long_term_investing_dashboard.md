# Long-Term Investing Dashboard Spec

Status: Draft v0.1
Scope: Analysis-only now; paper trading later.
Profiles: Long-Term Investing × Experience (Beginner now; Intermediate/Advanced TBD)

## Sticky Status Bar (all experience levels)
- Market Status: Open/Close; time to open/close; pre/post flag.

## Beginner Experience

### Cards (6 total)
1) Watchlist
- Fields: Price, 1M %, 6M %, 1Y %, Valuation (P/E or EV/EBITDA), Quality score, Dividend Yield.
- Defaults: Sort by 1Y %; allow filter for microcaps/illiquids.

2) Top Opportunities
- Show: score, coverage, reliability, regime; plain-language thesis; entry/stop/1R–2R targets (sim only).

3) Focus Company
- Snapshot: valuation, 3Y growth (revenue/EPS), margins, FCF, debt/EBITDA.

4) Research Feed
- Deduped news, filings, transcripts, rating changes; source tags.

5) Sector/Factor Pulse
- Sector heatmap; factor trend chips (value, growth, quality).

6) Calendar
- Next-quarter earnings/dividends; guidance events; reminders.

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
- Testing: Unit tests for value/quality/yield composites; property-based edge tests; snapshot tests for card JSON.
- Performance: Cache fundamentals/time-series; debounce UI updates; target <200 ms card refresh; batch API requests.
- Reliability: Freshness timestamps, reliability flags, graceful degradations; audit fallbacks via `sigmatiq_shared.audit`.
- Types/Lint: mypy clean (py38+), ruff/black; explicit types; avoid tight coupling between cards.
- Observability: Minimal metrics (latency, cache hit rate, error rate); audit risk/guardrail overrides.

## Intermediate Experience
- Cards: same 6 as Beginner; refinements below.
  - Watchlist: add 3Y %, valuation band (under/over), payout ratio.
  - Top Opportunities: add conviction band and risk flags (leverage/cyclicality).
  - Focus Company: 5Y trendlines (rev/EPS/FCF), moat & risks bullets.
  - Research Feed: insider buys/sells, major holders changes.
  - Sector/Factor Pulse: factor exposure chips; key macro indicators.

## Advanced/Pro Experience
- Cards: same 6 as Beginner; richer info only (keep tech simple).
  - Watchlist: valuation component chips (growth/quality/yield), short interest; sortable.
  - Top Opportunities: indicator breakdown; confidence band; regime tag.
  - Focus Company: multi-year alignment badges, capital allocation summary, ownership shifts.
  - Research Feed: transcript highlights, guidance deltas, rating dispersion.
  - Sector/Factor Pulse: factor correlation vs SPY/sector.
- Calendar & Alerts: unchanged; allow finer throttling (analysis-only).

## Known Limitations (Data Gaps)
- Borrow/shortability and borrow fee rates are not included.
- Institutional ownership/major holders (timely), insider transactions, and analyst ratings/targets not shown.
- Earnings call transcripts and guidance deltas not included.
- Short interest (daily/biweekly) not integrated.
- Detailed halt/resume reason codes not integrated.

---

## API Mapping — Watchlist (Long‑Term)
- Endpoint: extend GET `/watchlists/{watchlist_id}/snapshot` with `detail=long`.
- Add per-symbol: `ret_1m/6m/1y`, `valuation_pe_or_ev_ebitda`, `quality_score`, `dividend_yield`.
- Source: Alpha Vantage fundamentals (Overview) + Polygon daily bars; compute returns client/server.
- Fallbacks: if fundamentals missing, omit chips; show returns only.

## API Mapping — Top Opportunities (Long‑Term)
- Endpoint: GET `/opportunities?limit=20&expand=analysis` (same as Day/Swing).
- Include plain‑language thesis; derive entry/stop/targets from daily bars (sim‑only).

## API Mapping — Focus Company (Long‑Term)
- Endpoint: new minimal GET `/facts/fundamentals?symbol=SYM` (Facts router) using Alpha Vantage.
- Provide: valuation snapshot, 3Y rev/EPS growth, margins, FCF, debt/EBITDA.

## API Mapping — Research Feed (Long‑Term)
- MVP: omit; add later via provider integration.

## API Mapping — Sector/Factor Pulse (Long‑Term)
- Endpoint: reuse `/market/breadth?preset_id=sp500` for sector/factor proxy; proper factor chips deferred.

## API Mapping — Calendar (Long‑Term)
- MVP: omit upcoming earnings; optionally show last reported quarter date via fundamentals.

## API Mapping — Alerts Inbox (Long‑Term)
- Endpoint: GET `/alerts/recent?limit=20` (existing); filter by user via header.
- Use for long-horizon alerts (ratings/filings later); MVP shows recent strategy/model alerts only.

## API Mapping — Market Status (Sticky)
- Client-side compute: ET clock vs RTH; show Open/Close and time to next phase; pre/post flag.

## Core API Mapping
- See Core API-level and field-level mapping in `core_api_mapping.md` (Long-Term Investing).

## Assistant API Mapping
- See Assistant API mapping in `assistant_api_mapping.md` for fundamentals and market adapters.
