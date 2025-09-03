import axios from 'axios';
import type { AssistantResponse, ScreenerRequest, ScreenerResponse } from './types';

// API Base URLs - Use proxied paths to avoid CORS issues
const SIGMA_CORE_URL = import.meta.env.VITE_SIGMA_CORE_URL || '/api/core';
const SIGMA_ASSISTANT_URL = import.meta.env.VITE_SIGMA_ASSISTANT_URL || '/api/assistant';

// Create axios instances
const coreClient = axios.create({
  baseURL: SIGMA_CORE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': 'demo',
  },
  timeout: 10000, // 10 second timeout
});

const assistantClient = axios.create({
  baseURL: SIGMA_ASSISTANT_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': 'demo',
  },
  timeout: 10000, // 10 second timeout
});

// Market APIs
export const marketApi = {
  // Get market breadth (advancing/declining stocks)
  getMarketBreadth: async () => {
    const response = await coreClient.get('/market/breadth', {
      params: { preset_id: 'sp500', timeframe: 'day', cap: 30 }
    });
    return response.data;
  },

  // Get market summary for specific symbols
  getMarketSummary: async (symbols: string[]) => {
    const response = await coreClient.get('/market/summary', {
      params: { symbols: symbols.join(','), cap: 10 }
    });
    return response.data;
  },

  // VIX endpoint removed - data not available from provider
};

// Screener APIs
export const screenerApi = {
  // Run a screener
  runScreener: async (request: ScreenerRequest): Promise<ScreenerResponse> => {
    const response = await coreClient.post('/screener/run', request);
    return response.data;
  },

  // Get recent screener runs
  getScreenerRuns: async (limit = 10) => {
    const response = await coreClient.get('/screener/runs', { params: { limit } });
    return response.data;
  },

  // Run RSI oversold screener
  getRSIOversold: async () => {
    const response = await coreClient.post('/screener/run', {
      preset_id: 'sp500',
      timeframe: 'day',
      cap: 10,
      target: {
        kind: 'indicator',
        id: 'rsi',
        params: { period: 14 },
        rules: [{ column: 'rsi_14', op: '<', value: 30 }]
      }
    });
    // Return matched symbols from response
    return response.data.matched || [];
  },

  // Get top movers
  getTopMovers: async () => {
    const response = await coreClient.get('/market/summary', {
      params: { symbols: 'NVDA,AMD,TSLA,BA,DIS,NFLX,AAPL,MSFT,GOOGL,META', cap: 20 }
    });
    
    const data = response.data;
    const symbols = Object.values(data) as any[];
    
    // Sort by change percent and split into gainers/losers
    const sorted = symbols.sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sorted.filter(s => s.changePercent > 0).slice(0, 5);
    const losers = sorted.filter(s => s.changePercent < 0).slice(-5).reverse();
    
    return { gainers, losers };
  }
};

// Assistant APIs  
export const assistantApi = {
  ask: async (question: string, mode: string = 'preview'): Promise<AssistantResponse> => {
    const response = await assistantClient.post('/assistant/ask', { q: question, mode });
    return response.data;
  },

  // Get market context
  getMarketContext: async (timeframe = 'day') => {
    const response = await assistantClient.get('/assistant/context/market', { params: { timeframe } });
    return response.data;
  },

  // Get saved scans
  getSavedScans: async () => {
    const response = await assistantClient.get('/assistant/saved_scans');
    return response.data;
  },

  // Legacy functions for compatibility
  getMarketData: async (symbols: string[]) => {
    return marketApi.getMarketSummary(symbols);
  },

  runScreener: async (request: ScreenerRequest): Promise<ScreenerResponse> => {
    return screenerApi.runScreener(request);
  },

  getIndicators: async (): Promise<any[]> => {
    const response = await coreClient.get('/catalog/indicators');
    return response.data;
  },

  getPresets: async (): Promise<any[]> => {
    const response = await coreClient.get('/presets');
    return response.data;
  },

  getWatchlists: async (): Promise<any[]> => {
    const response = await coreClient.get('/watchlists');
    return response.data;
  },
};

// Options APIs
export const optionsApi = {
  // Get unusual options activity
  getUnusualOptions: async () => {
    const response = await coreClient.post('/options/flow/uoa', {
      preset_id: 'sp500',
      cap: 5,
      near_atm: 6,
      expiry: 'this_friday',
      top_n: 5
    });
    return response.data;
  }
};

// Export all APIs
export const api = {
  market: marketApi,
  screener: screenerApi,
  assistant: assistantApi,
  options: optionsApi
};

export default assistantApi;