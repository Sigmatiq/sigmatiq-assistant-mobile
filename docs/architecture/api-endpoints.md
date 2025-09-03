# SIGMATIQ API Endpoints Documentation

## Overview
SIGMATIQ uses a two-tier API architecture:
- **Sigma Core** (Port 8050): Core trading functionality, Polygon.io integration
- **Sigma Assistant** (Port 8060): AI assistant layer, proxies to Core

## Dashboard Data Requirements & Available Endpoints

### 1. MARKET OVERVIEW DATA

#### Market Status & Indices
**Need**: Market open/closed, major indices (S&P, NASDAQ, DOW)
**Available Endpoints**:
```http
# Market Summary (quotes for SPY, QQQ, DIA)
GET http://localhost:8050/market/summary?symbols=SPY,QQQ,DIA&cap=10

# VIX Data
GET http://localhost:8050/vol/indices

# Last Close & 52-week data
GET http://localhost:8050/facts/SPY/last_close
GET http://localhost:8050/facts/SPY/52w
```

#### Market Breadth
**Need**: Advancing/Declining stocks
**Available Endpoint**:
```http
GET http://localhost:8050/market/breadth?preset_id=sp500&timeframe=day&cap=30
Response: {"advancers": 260, "decliners": 240}
```

#### Fear & Greed Index
**Need**: Market sentiment indicator
**Available Options**:
```http
# Use VIX as proxy for fear/greed
GET http://localhost:8050/vol/indices

# Or ask assistant for sentiment
POST http://localhost:8060/assistant/ask
Body: {"q": "What is current market sentiment?", "mode": "preview"}
```

### 2. TOP MOVERS

**Need**: Top gainers and losers
**Available Options**:
```http
# Run a screener for top movers
POST http://localhost:8050/screener/run
Body: {
  "preset_id": "sp500",
  "timeframe": "day",
  "cap": 10,
  "target": {
    "kind": "indicator",
    "id": "price_change_pct",
    "params": {},
    "rules": [{"column": "price_change_pct", "op": ">", "value": 0}]
  }
}

# Or use market summary for specific symbols
GET http://localhost:8050/market/summary?symbols=NVDA,TSLA,AAPL,META,GOOGL&cap=10
```

### 3. SCREENER COUNTS

**Need**: Live counts for screeners
**Available Endpoints**:
```http
# Run screener and get count
POST http://localhost:8050/screener/run
Body: {
  "preset_id": "sp500",
  "timeframe": "day",
  "cap": 50,
  "target": {
    "kind": "indicator",
    "id": "rsi",
    "params": {"period": 14},
    "rules": [{"column": "rsi_14", "op": "<", "value": 30}]
  }
}
Response: {"matched": ["AAPL", "MSFT"], "evaluated": 50, "summary": "2 matches"}
```

### 4. AI INSIGHTS

**Need**: Market analysis, opportunities, learning tips
**Available Endpoints**:
```http
# Ask assistant for insights
POST http://localhost:8060/assistant/ask
Body: {"q": "Give me market analysis for today", "mode": "preview"}

# Get news sentiment
GET http://localhost:8060/assistant/news/sentiment

# Get market context
GET http://localhost:8060/assistant/context/market?timeframe=day
```

### 5. RECENT ACTIVITY

**Need**: User's recent searches and analysis
**Available Endpoints**:
```http
# Recent screener runs
GET http://localhost:8050/screener/runs?limit=10

# Recent alerts
GET http://localhost:8050/alerts/recent?limit=10

# Saved scans
GET http://localhost:8060/assistant/saved_scans
```

### 6. OPTIONS FLOW

**Need**: Unusual options activity
**Available Endpoint**:
```http
POST http://localhost:8050/options/flow/uoa
Body: {
  "preset_id": "sp500",
  "cap": 5,
  "near_atm": 6,
  "expiry": "this_friday",
  "top_n": 5
}
```

## Implementation Strategy for Dashboard

### Priority 1: Quick Wins (Can implement now)
1. **Market Breadth** - `/market/breadth`
2. **VIX/Volatility** - `/vol/indices`
3. **Recent Activity** - `/screener/runs`
4. **AI Insights** - `/assistant/ask`

### Priority 2: Requires Processing
1. **Market Indices** - Use `/market/summary` with SPY, QQQ, DIA
2. **Top Movers** - Run screeners sorted by price_change_pct
3. **Screener Counts** - Run multiple screeners in parallel

### Priority 3: Computed/Derived
1. **Fear & Greed** - Calculate from VIX levels
2. **Market Status** - Derive from current time
3. **Countdowns** - Calculate client-side

## API Client Updates Needed

```typescript
// Add to api/client.ts
export const marketApi = {
  // Market Overview
  getMarketBreadth: async () => {
    const response = await apiClient.get('/market/breadth', {
      params: { preset_id: 'sp500', timeframe: 'day', cap: 30 }
    });
    return response.data;
  },

  getMarketSummary: async (symbols: string[]) => {
    const response = await apiClient.get('/market/summary', {
      params: { symbols: symbols.join(','), cap: 10 }
    });
    return response.data;
  },

  getVolatilityIndices: async () => {
    const response = await apiClient.get('/vol/indices');
    return response.data;
  },

  // Screeners
  runScreener: async (request: any) => {
    const response = await apiClient.post('/screener/run', request);
    return response.data;
  },

  getScreenerRuns: async (limit = 10) => {
    const response = await apiClient.get('/screener/runs', {
      params: { limit }
    });
    return response.data;
  },

  // Options
  getUnusualOptions: async () => {
    const response = await apiClient.post('/options/flow/uoa', {
      preset_id: 'sp500',
      cap: 5,
      near_atm: 6,
      expiry: 'this_friday',
      top_n: 5
    });
    return response.data;
  }
};
```

## WebSocket Support

While no explicit WebSocket endpoints were found, async operations can be achieved through:

1. **Jobs API** for long-running operations:
```http
POST http://localhost:8050/jobs
GET http://localhost:8050/jobs/{jobId}/progress
```

2. **Polling Strategy** for real-time updates:
- Market data: 5-second polling when market open
- Screener results: 30-second polling
- Alerts: 1-minute polling

## Authentication & Headers

All requests should include:
```http
X-User-Id: demo
Content-Type: application/json
```

## Rate Limits & Best Practices

1. **Use `cap` parameter** - Always limit results (max 50)
2. **Cache aggressively** - Market data can be cached 5-30 seconds
3. **Batch requests** - Use market/summary for multiple symbols
4. **Timeframe defaults** - Use 'day' for daily, 'hour' for intraday

## Next Steps

1. Update API client with real endpoints
2. Remove mock data from Dashboard
3. Add error handling for API failures
4. Implement caching strategy
5. Add loading states for data fetching