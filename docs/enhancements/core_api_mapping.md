# Core API Mapping for Dashboards

This document maps dashboard requirements to Core API endpoints and field-level outputs. It also notes the shared wrappers used under the hood and any current limitations.

Contents:
- Day Trading — API and Fields
- Swing Trading — API and Fields
- Options Trading — API and Fields
- Long-Term Investing — API and Fields

Notes:
- All endpoints below refer to the Core API service (default http://localhost:8001).
- Where fields are listed as “best-effort”, the API omits them if upstream data is unavailable.

---

## Day Trading — API-Level Mapping

- `GET /watchlists/{watchlist_id}/snapshot?detail=full`
  - Returns watchlist with per-symbol snapshot enriched for intraday use.
  - Shared wrappers: `get_polygon_tickers_snapshot(..., include_nbbo=True)`; minute bars via `get_polygon_agg_bars(..., minute)`.

- `GET /market/summary?symbols=AAPL,MSFT&detail=intraday`
  - Returns summary per symbol, enriched with intraday VWAP/session metrics.
  - Shared wrappers: minute bars via `get_polygon_agg_bars(..., minute)`.

- `GET /market/movers?direction=both&limit=10&include_otc=false`
  - Top gainers/losers for intraday.
  - Shared wrappers: `get_polygon_market_movers(...)`.

- `GET /market/breadth?preset_id=sp500&timeframe=day&cap=50&series_days=0`
  - Market breadth chips; optional series for sparkline.
  - Shared wrappers: daily bars via `get_polygon_daily_bars(...)`.

- `GET /alerts/recent?limit=20`
  - Alerts inbox items.

## Day Trading — Field-Level Mapping

- Watchlist (from `/watchlists/{id}/snapshot?detail=full`)
  - `price`: Polygon snapshot `day.c`.
  - `%chg` (`change_percent`): Derived from `day.c` vs `prevDay.c`.
  - `spread_bps`: From NBBO `(ask - bid) / price * 10000` (when present).
  - `RVOL(10d)` (`rvol_10d`): Current day volume vs 10-day avg from daily bars.
  - `VWAP distance` (`vwap_distance_pct`): `(last - vwap) / vwap * 100` from 1m bars.
  - `Session Range%` (`session_range_pct`): From 1m bars within RTH.

- Focus Symbol (from `/market/summary?detail=intraday`)
  - `vwap`: Anchored VWAP from 1m bars.
  - `vwap_distance_pct`: As above.
  - `session_range_pct`: RTH high/low percent range.
  - `orb_high`/`orb_low`: Opening range breakout bounds (first 5 minutes).

---

## Swing Trading — API-Level Mapping

- `GET /watchlists/{watchlist_id}/snapshot?detail=full`
  - Returns snapshot; client/server compute returns and ATR% from daily bars.
- `GET /market/summary?symbols=...` (base daily summary)
  - Provides daily context; intraday detail optional via `detail=intraday`.
- `GET /market/breadth?preset_id=sp500&timeframe=day&cap=50&series_days=0`
  - Breadth counts.
- `GET /alerts/recent?limit=20`
  - Alerts listing.

## Swing Trading — Field-Level Mapping

- Watchlist
  - `ret_1d/5d/1m/3m`: Derived from daily closes (client/server).
  - `atr_pct`: ATR(14)/price from daily (client/server compute).
  - `gap_flag`: Today’s open vs prior close (daily).
- Focus Symbol
  - `MAs 20/50/200`, `trend tag`, `S/R`: Derived from daily bars (client/server compute).

Shared wrappers: `get_polygon_daily_bars(...)` for all daily-derived fields.

---

## Options Trading — API-Level Mapping

- `POST /options/chain` (Core API)
  - Inputs: `symbol`, `expiry` (or `days_out`), `limit`.
  - Output: per-strike `bid/ask/mid`, `side`, `strike`.
  - Shared wrappers: `get_polygon_option_chain_snapshot(...)`.

- `GET /options/oi/summary?symbol=SYM&date=YYYY-MM-DD` (Core API)
  - Output: `oi_calls`, `oi_puts`, `oi_total`, `put_call_ratio`, `top_strikes`.
  - Shared wrappers: `get_polygon_oi_snapshot_today(...)`.

- `GET /market/summary?symbols=SYM&detail=intraday` (Core API)
  - Underlying context: VWAP/session stats from minute bars.

### Planned: Options Term Structure Helper
- Proposed endpoint: `GET /options/term_structure?symbol=SYM&max_expiries=6`
  - Server builds term structure by fetching chain snapshots for the nearest expiries.
  - Output per expiry: `{expiry, iv_proxy, iv_percentile?, mid_midpoint, strikes_sampled}`
  - Shared wrappers used: `get_polygon_option_chain_snapshot(...)` per expiry; IV percentile requires cached history (TBD).

## Options Trading — Field-Level Mapping

- Watchlist (Options)
  - `Underlying Price`, `1D %`: From `/market/summary` base daily or watchlist snapshot.
  - `ATR%`: From daily bars (client/server compute).
  - `IV proxy`: From chain snapshot mid IV (best-effort from `implied_volatility`); not guaranteed.

- Strategy Ideas / IV Pulse
  - `term structure`, `IV percentile`: Requires cross-expiry aggregation/history (deferred; not yet in Core API).

Shared wrappers: `get_polygon_options_aggs(...)` for 1m contract bars (if needed), `get_polygon_option_quotes/trades(...)` for detail (not currently exposed by Core API endpoints).

---

## Long-Term Investing — API-Level Mapping

- Daily returns context
  - `GET /market/summary?symbols=...` for daily summary and 52w range.

- Fundamentals snapshot
  - `GET /facts/fundamentals?symbol=SYM` implemented.
  - Fields: `pe_ratio`, `forward_pe`, `ev_to_ebitda`, `dividend_yield`, `market_cap`, `profit_margin`, `operating_margin_ttm`, `roe_ttm`, `eps_ttm`, `revenue_ttm`, `revenue_cagr_3y_pct`, `eps_cagr_3y_pct` (best-effort).
  - Shared wrappers: `get_alpha_vantage_company_overview` (valuation, yield, margins) and `get_alpha_vantage_income_statement` (3y growth).

- Sector/Factor proxy
  - `GET /market/breadth?preset_id=sp500` for sector/factor proxy counts.

## Long-Term Investing — Field-Level Mapping

- Watchlist (Long)
  - `ret_1m/6m/1y`: From daily bars (client/server compute).
  - `valuation_pe_or_ev_ebitda`, `quality_score`, `dividend_yield`: From Alpha Vantage Overview (planned Core API endpoint).

- Focus Company
  - `valuation snapshot`, `3Y rev/EPS growth`, `margins`, `FCF`, `debt/EBITDA`: From Alpha Vantage statements (planned Core API endpoint).

---

## Shared Computation Helpers (Used by Core API)

- `compute_anchored_vwap(df_1m)`: Intraday anchored VWAP and latest value.
- `compute_session_stats(df_1m)`: RTH high/low range%, ORB(5m), pre/post flag.
- `compute_vwap_distance_pct(last, vwap)`: Distance percent.

These live in `sigmatiq_shared.market_stats` and are used by:
- `/watchlists/{id}/snapshot?detail=full` to add `vwap_distance_pct`, `session_range_pct`, and `spread_bps`.
- `/market/summary?detail=intraday` to add `vwap`, `vwap_distance_pct`, `session_range_pct`, `orb_high`, `orb_low`.

---

## Open Items / Gaps

- Long-term fundamentals endpoint not yet implemented; shared AV wrappers exist.
- Options term-structure/IV percentile requires history aggregation (TBD).
- Calendar/news/halts/unusual options volume are deferred per specs.
