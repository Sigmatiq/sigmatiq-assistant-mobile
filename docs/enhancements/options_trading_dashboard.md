# Options Trading Dashboard Spec

Status: Draft v0.1
Scope: Analysis-only now; paper trading later.
Profiles: Options Trading × Experience (Beginner now; Intermediate/Advanced TBD)

## Sticky Status Bar (all experience levels)
- Market Status: Open/Close; time to open/close; pre/post flag.

## Beginner Experience

### Cards (6 total)
1) Watchlist
- Fields: Underlying Price, 1D %, IV Rank/IV, ATR%, Earnings flag.

2) Strategy Ideas (sim-only)
- Ranked credit/debit spreads; show max risk/reward and POP hint.

3) Focus Underlying
- Expected move cone; IV vs HV; liquidity score; skew hint.

4) IV Pulse
- IV rank/percentile; mini term-structure chart.

5) Events & Movers
- Earnings dates; IV movers; unusual options volume (summary).

6) Alerts Inbox
- IV spikes/drops, expected-move breach; snooze/ack; jump to underlying.

### Responsive Layout
- Desktop: Separate cards; grid.
- Mobile: Scrollable cards; Status sticky.

### Notes
- Canonical signal schema: {score, coverage, reliability, indicators_used, total_indicators, regime}.
- Beginner-first: safe defaults, explainability; analysis-only actions.

## Cross-Cutting Enhancements (All Levels)
- Setup type tag on Strategy Ideas (e.g., breakout, reversion, drift alignment with underlying).
- Freshness: last‑updated timestamp + reliability badge on every card; stale‑data badge intraday.
- Coverage: show per‑symbol coverage% (e.g., past 6m) in signal blocks.
- Actionability: show entry reference, ATR/expected‑move‑based stop, and 1R/2R targets wherever signals appear.
- Level specifics: Beginner = basic liquidity badge; Intermediate = liquidity score + 1R/2R payoff table; Advanced = expected slippage details.

## Engineering Acceptance Criteria
- Data models: Pydantic models for signals and each card payload; no hidden globals; pure functions.
- Testing: Unit tests for expected move, IV rank/percentile, IV–HV spread; property-based edge tests; snapshot tests for card JSON.
- Performance: Cache IV stats/aggregates; debounce UI updates; target <200 ms card refresh; batch API requests.
- Reliability: Freshness timestamps, reliability flags, graceful degradations; audit fallbacks via `sigmatiq_shared.audit`.
- Types/Lint: mypy clean (py38+), ruff/black; explicit types; avoid tight coupling between cards.
- Observability: Minimal metrics (latency, cache hit rate, error rate); audit risk/guardrail overrides.

## Known Limitations (Data Gaps)
- Borrow/shortability and borrow fee rates are not included.
- True Level II/DOM depth and auction imbalance data are out of scope.
- Institutional ownership, insider transactions, analyst ratings/targets not shown.
- Historical IV surfaces (full strike/expiry grids) not included; IV rank uses available history.
- Detailed halt/resume reason codes not integrated.
- Short interest (daily/biweekly) not integrated.

---

## API Mapping — Watchlist (Options)
- Inputs: underlying Price, 1D %, ATR% from Polygon; IV/IVR best‑effort from chain snapshot.
- Endpoint: POST `/options/chain` (existing) for near‑ATM contracts; compute ATM IV proxy and expected move.
- Add per‑symbol: `iv_proxy`, `iv_rank_best_effort` (if recent history cached), `atr_pct`; omit earnings flag.

## API Mapping — Strategy Ideas (Options)
- Endpoint: POST `/options/chain` + GET `/options/oi/summary` to rank simple spreads.
- Output: ranked credit/debit spreads with max risk/reward (sim‑only).

## API Mapping — Focus Underlying (Options)
- Endpoint: combine daily bars + nearest expiry `/options/chain`; compute expected move cone; IV vs HV; liquidity score; skew hint.

## API Mapping — IV Pulse (Options)
- Endpoint: build from `/options/chain` across expiries to show term structure; IV percentile requires cached history (deferred if absent).

## API Mapping — Events & Movers (Options)
- Endpoint: reuse `/market/movers` for underlying; unusual options volume requires future provider; omit for MVP.

## API Mapping — Alerts Inbox (Options)
- Endpoint: GET `/alerts/recent?limit=20` (existing); filter by user via header.
- Use for IV spike/drop and expected-move breach alerts (client interprets fields for now).

## API Mapping — Market Status (Sticky)
- Client-side compute: ET clock vs RTH; show Open/Close and time to next phase; pre/post flag.

## Intermediate Experience
- Cards: same 6 as Beginner; refinements below.
  - Watchlist: add IV percentile (1y), HV, and RVOL trend.
  - Strategy Ideas: filters (delta, DTE, POP); risk band tags.
  - Focus Underlying: term structure mini; skew slope chip.
  - IV Pulse: add IV–HV spread; percentile sparkline.
  - Events & Movers: post‑earnings IV crush view.

## Advanced/Pro Experience
- Cards: same 6 as Beginner; richer info only (keep tech simple).
  - Watchlist: IVR/IVP chips, HV, skew slope; liquidity note.
  - Strategy Ideas: indicator breakdown; risk/reward bands; regime tag.
  - Focus Underlying: multi‑expiry alignment badges; expected move cone.
  - IV Pulse: skew/term diffs; correlation vs SPY/sector.
  - Events & Movers: unusual OI/volume clusters; post‑earnings drift view.
  - Alerts: unchanged; allow finer throttling (analysis-only).

## Core API Mapping
- See Core API-level and field-level mapping in `core_api_mapping.md` (Options Trading).

## Assistant API Mapping
- See Assistant API mapping in `assistant_api_mapping.md` (Options Trading adapters and planned term-structure proxy).
