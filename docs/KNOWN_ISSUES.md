# Sigmatiq Assistant Mobile — Known Issues & Integration Notes

This document tracks current issues seen in the running Mobile UI against the Assistant/Core APIs and proposed remediation paths. Prioritize backend fixes first when the root cause is server‑side.

## 1) Market Breadth fails with tz-aware datetime error
- Symptom: UI call to `/api/assistant/market/breadth` returns 500 with `detail: "Failed to fetch market breadth: Tz-aware datetime.datetime cannot be converted to datetime64 unless utc=True, at position <n>"`.
- Scope: Affects Dashboard market breadth (and any consumer of `/assistant/market/breadth`).
- Root cause (backend):
  - Core (`sigmatiq-core-api/api/routers/market_context.py::market_breadth`) concatenates bar frames and converts `out["date"]` with `pd.to_datetime(...)`, then sorts `.unique()` values. Data may contain a mix of tz‑aware and tz‑naive datetimes.
  - The bars loader (`sigma_core/services/market_cache_service.get_bars_cached`) normalizes input bounds but can return a DataFrame where the `date` column retains tz-aware values (UTC) for intraday/daily bars. Mixed tz causes Pandas conversion to choke.
- Confirmation pointers:
  - Core: `api/routers/market_context.py` (breadth compute)
  - Core: `sigma_core/services/market_cache_service.py` (`get_bars_cached`, `_read_bars`, `_upsert_bars`)
- Fix options:
  1. Normalize `out["date"]` in breadth route before usage:
     - Example: `out["date"] = pd.to_datetime(out["date"], utc=True).dt.tz_convert(None)` or convert/strip to tz‑naive via `.dt.tz_localize(None)` after ensuring a consistent tz.
  2. Normalize the `date` column in `get_bars_cached` before returning (systemic fix so all consumers receive consistent tz‑naive `date`).
  3. As a stopgap, wrap the `pd.to_datetime` call with `utc=True` in the breadth route and strip tz for comparisons.
- Suggested approach: (2) systemic normalization in `get_bars_cached`, plus (1) a defensive cast in the breadth route to be resilient.
- Priority: High (breaks visible UI card). Owner: Core API.

## 2) Cap parameter mismatch for breadth (perf/limits)
- Symptom: UI default requests `cap=100` in `src/api/client.ts` (`getMarketBreadth`) while Core route declares `cap <= 50`.
- Why this still “works”: Assistant adapts by calling Core routers as Python functions (in‑process), bypassing FastAPI’s HTTP validation. Core function signature has `Query(..., le=50)` but direct calls won’t enforce it, so `cap=100` proceeds and increases load.
- Risks: Higher DB/compute per call than intended; inconsistent behavior vs direct Core HTTP calls.
- Fix options:
  1. UI: reduce default `cap` to <= 50.
  2. Assistant router: clamp `cap` to [1, 50] before delegating to Core.
  3. Core: add explicit runtime clamp/validation within the function body (not only via FastAPI parameter validators).
- Suggested approach: (2) clamp in Assistant and (1) align UI default to 50 for consistency.
- Priority: Medium. Owner: Assistant API + Mobile UI.

## 3) Market status logic in MobileHeader is imprecise
- Symptom: Header uses `new Date().getHours()` and checks `hour >= 9.5` for ‘open’. `getHours()` returns integers, so `>= 9.5` behaves as `>= 10`, misclassifying 9:30–9:59 ET.
- Impact: Status dot can show ‘pre‑market’ instead of ‘open’ during first 30 minutes; polling cadence tied to status may be off.
- Fix options:
  1. Use minutes (and correct ET timezone) to compare full time window of regular hours.
  2. Reuse `computeMarketStatus` util (already used in Dashboard) inside `MobileHeader` to avoid duplicate, inconsistent logic.
- Suggested approach: (2) reuse util for single source of truth.
- Priority: Medium. Owner: Mobile UI.

## 4) Data provider keys required (user experience)
- Symptom: Endpoints like `/assistant/market/*` return 503 when `POLYGON_API_KEY` is missing. UI surfaces generic error states.
- Fix options:
  1. Improve UI error mapping for 503 from market endpoints (show setup hint, hide dependent widgets).
  2. Assistant/Core: include `polygon_api_key_present` in a lightweight health/context endpoint that the UI can check to toggle features.
- Priority: Medium. Owner: Assistant/Core + Mobile UI.

## 5) Prod base URL path expectations
- Symptom: In production, `VITE_API_BASE_URL` is concatenated with `"/assistant/..."`. If configured with a suffix (e.g., already includes `/assistant`), paths double up.
- Fix: Document that `VITE_API_BASE_URL` should point at the API root (e.g., `https://api.example.com`), not the `/assistant` subpath. Optionally add a guard that strips a trailing `/assistant`.
- Priority: Low. Owner: Mobile UI docs.

## 6) Validation bypass in Assistant adapters
- Symptom: Assistant adapters invoke Core routers in‑process, bypassing FastAPI’s parameter validation (e.g., `le=50`).
- Risk: Inconsistent behavior vs direct Core access; unexpected loads or edge cases.
- Fix options:
  1. Manually validate/clamp params in Assistant before delegating to Core functions.
  2. Move to HTTP calls to Core (loses some perf/typing benefits) or wrap Core functions with explicit runtime validation.
- Priority: Medium. Owner: Assistant API.

## Observations (not issues)
- Movers data mapping matches UI expectations: items expose `symbol`, `name`, `price`, `change`, `change_percent`; Assistant `/assistant/market/movers` proxies Core movers correctly.
- Market summary mapping aligns: UI expects `close` and `day_change_pct`; Core `/market/summary` returns those fields.

---
Validation plan once fixes are in:
- Verify `/assistant/market/breadth` succeeds for `preset_id=sp500` with/without `include_symbols`, for `cap` in {10, 30, 50}.
- Confirm UI breadth card renders without errors and updates on open‑market polling cadence.
- Sanity check movers and summary endpoints to ensure no regressions.
