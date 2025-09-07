# Assistant API Mapping for Dashboards

This document maps the Assistant API endpoints to dashboard needs at the API and field level, and shows how each endpoint integrates with the Core API. The Assistant integrates by importing the Core package routers directly (no HTTP hop) via `sigma_assistant.api.core_bridge._import_from_core`.

Key adapters (Assistant):
- `sigma_assistant/api/routers/market_adapters.py`
- `sigma_assistant/api/routers/watchlists.py`
- `sigma_assistant/api/routers/fundamentals_news.py`
- `sigma_assistant/api/assistant_providers/facts_provider.py`

Integration detail: Uses Core package routers imported as Python modules (e.g., `api.routers.market`, `api.routers.watchlists`, `api.routers.facts`) — not REST calls.

---

## Day Trading — API-Level Mapping (Assistant)

- `GET /assistant/market/summary?symbols=SPY,QQQ&detail=intraday&timeframe=1m`
  - Proxies to Core `market.summary` (module import) with `detail` and `timeframe` params.
  - Returns Core fields plus intraday enrich when requested.

- `GET /assistant/market/movers?direction=both&limit=10&include_otc=false`
  - Proxies to Core `market_context.market_movers` with identical semantics.

- `GET /assistant/market/breadth?preset_id=sp500&timeframe=day&cap=50&series_days=0`
  - Proxies to Core `market_context.market_breadth` (caching handled in Core).

- `GET /assistant/watchlists/{watchlist_id}/snapshot?detail=full`
  - Proxies to Core `watchlists.get_watchlist_snapshot` with `detail`.

- `GET /assistant/facts/fundamentals?symbol=SYM`
  - Calls Core `facts.get_fundamentals` (module import) for valuation snapshot and simple growth.

- `POST /assistant/ask` (facts provider)
  - If fundamentals intent detected (keywords: fundamentals/valuation/dividend/PE/EPS), calls Core `facts.get_fundamentals` then returns beginner-friendly summary + metric explanations.
  - Otherwise delegates to Core facts QA (`/qa/ask`) for last close, 52w, etc.

## Day Trading — Field-Level Mapping (Assistant)

- From `/assistant/watchlists/{id}/snapshot?detail=full` (same payload as Core):
  - `price`, `change_percent`, `volume` from Polygon snapshot.
  - `spread_bps` from NBBO (when present).
  - `rvol_10d` from daily bars.
  - `vwap_distance_pct`, `session_range_pct` from 1m bars.

- From `/assistant/market/summary?detail=intraday` (same payload as Core):
  - `vwap`, `vwap_distance_pct`, `session_range_pct`, `orb_high`, `orb_low`.

---

## Swing Trading — API-Level Mapping (Assistant)

- `GET /assistant/watchlists/{watchlist_id}/snapshot?detail=full`
  - Same as Day; client/server can compute `ret_1d/5d/1m/3m`, `atr_pct`, `gap_flag` from daily bars.

- `GET /assistant/market/summary?symbols=...` (with/without `detail=intraday`)
  - Daily context or with intraday enrich.

- `GET /assistant/market/breadth?preset_id=sp500&timeframe=day&cap=50&series_days=0`
  - Breadth counts; sparkline series when requested.

## Swing Trading — Field-Level Mapping (Assistant)

- Same as Core mapping; Assistant passes through Core payloads unchanged.

---

## Options Trading — API-Level Mapping (Assistant)

- `POST /assistant/ask` (options provider)
  - Delegates to Core `options_qa` for chain/IV/greeks questions (module import).

- `GET /assistant/market/summary?symbols=SYM&detail=intraday`
  - Underlying context for options dashboards.

- `GET /assistant/facts/fundamentals?symbol=SYM`
  - Valuation snapshot for underlying (PE, EV/EBITDA, margins, yield, growth).

- Planned (after Core implementation):
  - `GET /assistant/options/term_structure?symbol=SYM&max_expiries=6` → proxies Core term-structure helper.

## Options Trading — Field-Level Mapping (Assistant)

- Pulls Core payloads as-is; any options chain/OI fields originate from Core routers.

---

## Long-Term Investing — API-Level Mapping (Assistant)

- `GET /assistant/facts/fundamentals?symbol=SYM`
  - Core-backed fundamentals snapshot (Alpha Vantage under the hood).

- `GET /assistant/market/summary?symbols=...`
  - Daily context (52w high/low, change, etc.); intraday enrich optional.

- Legacy (direct AV, optional):
  - `GET /assistant/fundamentals/overview` (Alpha Vantage REST) and `GET /assistant/news/sentiment` (Alpha Vantage REST). Prefer Core-backed fundamentals endpoint above for consistency.

## Long-Term Investing — Field-Level Mapping (Assistant)

- Fundamentals fields mirror Core `facts.get_fundamentals` response:
  - `pe_ratio`, `forward_pe`, `ev_to_ebitda`, `dividend_yield`, `market_cap`, `profit_margin`, `operating_margin_ttm`, `roe_ttm`, `eps_ttm`, `revenue_ttm`, `revenue_cagr_3y_pct`, `eps_cagr_3y_pct`.

---

## Confirmation: Package Integration (not REST)

- The Assistant integrates with Core via Python imports (module-level calls), not HTTP endpoints:
  - File: `sigma_assistant/api/core_bridge.py`
  - Pattern: `routers = SimpleNamespace(..., market=_import_from_core("api.routers.market"), watchlists=_import_from_core("api.routers.watchlists"), facts=_import_from_core("api.routers.facts"), ...)`
  - Adapters call these routers directly, e.g., `_core.market.market_summary(...)`, `_core.watchlists.get_watchlist_snapshot(...)`, `_core.facts.get_fundamentals(...)`.

