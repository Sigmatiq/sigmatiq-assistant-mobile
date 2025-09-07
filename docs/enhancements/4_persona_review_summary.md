# 4‑Persona Review Summary

Scope: Analysis‑only dashboards for Day, Swing, Long‑Term, and Options; paper trading later.
Status: Approved (v0.1)

## Professional Trader
- Edge surfaced via RVOL/VWAP/IV/regime; added setup‑type tags (breakout/reversion/drift).
- Freshness on every card (timestamp + reliability); stale‑data badges intraday.
- Risk context: basic liquidity badge (Beginner), liquidity score (Intermediate), expected slippage (Advanced).
- Events prominence: earnings/halts; post‑earnings drift chip for Swing/Options movers.
- Coverage% shown in signal blocks to temper confidence; entry/ATR stop/1R–2R targets wherever signals appear.

## Senior Architect
- Coherent card model across personas; experience tiers vary info density, not tech.
- Canonical signal schema enforced: {score, coverage, reliability, indicators_used, total_indicators, regime}.
- Clear boundaries: analysis‑only now; paper‑trade later; risk policies live in `policy`.
- Cross‑cutting section standardizes freshness, coverage, actionability, and liquidity displays.
- Minimal coupling; each card has explicit data contract and can degrade gracefully.

## Senior Developer
- Data models: Pydantic types for signals and card payloads; pure functions; no hidden globals.
- Tests: RVOL, ATR stops, ORB/trend/range, expected move, IV rank/percentile; property‑based edges; snapshot JSON tests.
- Performance: cached aggregates/IV stats; debounced UI; <120 ms chart paint, <200 ms card refresh; batched requests.
- Reliability/Observability: freshness + reliability flags; audit fallbacks/overrides; basic metrics (latency, cache hit, error rate).
- Types/lint: mypy (py38+), ruff, black; explicit types; avoid tight coupling between cards.

## Beginner Trader
- Clarity: concise card labels; add tooltips for RVOL/ATR/IV; glossary links.
- Safety: analysis‑only; examples use forced stops and 1R/2R; alerts throttled/bundled by default.
- Confidence: coverage% + reliability with simple green/yellow/red badge; last‑updated shown.
- Mobile UX: separate scrollable cards; sticky Market Status; swipe tabs where appropriate.

## Where Captured
- Day: docs/day_trading_dashboard.md
- Swing: docs/swing_trading_dashboard.md
- Long‑Term: docs/long_term_investing_dashboard.md
- Options: docs/options_trading_dashboard.md
- Cross‑cutting + Engineering acceptance criteria added inside each doc.

## Open Items / Next Phase
- API mapping: define data sources and fallbacks per field (Core + Polygon; others as needed).
- Data contracts: pydantic models per card; response shapes and freshness semantics.
- Backlog: derive implementation tasks and tests from Engineering Acceptance Criteria.
- Telemetry plan: minimal metrics collection and dashboards.

## Known Limitations (Data Gaps)
- Borrow/shortability and borrow fee rates (broker/exchange specific).
- True Level II/DOM depth and auction imbalance feeds.
- Institutional ownership/major holders (timely), insider transactions, analyst ratings/targets, consensus estimates.
- Earnings call transcripts and guidance deltas.
- Short interest (daily/biweekly) datasets.
- Historical IV surfaces across strikes/expiries; detailed halt/resume reason codes.
