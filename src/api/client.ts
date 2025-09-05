import axios from 'axios';
import type { AssistantResponse, ScreenerRequest, ScreenerResponse } from './types';

// API Configuration from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

// Development mode - use proxied paths
const isDevelopment = import.meta.env.DEV;

// Create axios instance for the unified API
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': 'demo',
  },
  timeout: API_TIMEOUT,
});

// Helper function to build API paths
const buildApiPath = (service: 'core' | 'assistant', path: string): string => {
  if (isDevelopment) {
    // In development, use proxy paths
    return `/api/${service}${path}`;
  }
  // In production, use configured base URL
  return `${API_BASE_URL}${path}`;
};

// Market APIs
export const marketApi = {
  // Get market breadth (advancing/declining stocks)
  getMarketBreadth: async () => {
    const response = await apiClient.get(buildApiPath('assistant', '/market/breadth'), {
      params: { preset_id: 'sp500', timeframe: 'day', cap: 100 },  // Increased to 100 with caching
      timeout: 25000  // 25 second timeout for initial breadth calculation
    });
    return response.data;
  },

  // Get market summary for specific symbols
  getMarketSummary: async (symbols: string[]) => {
    const response = await apiClient.get(buildApiPath('assistant', '/market/summary'), {
      params: { symbols: symbols.join(','), cap: 10 }
    });
    // Transform response to expected format
    if (response.data?.items) {
      // Convert array of items to object keyed by symbol
      const result: any = {};
      response.data.items.forEach((item: any) => {
        result[item.symbol] = {
          symbol: item.symbol,
          price: item.close || 100,
          changePercent: item.day_change_pct || 0
        };
      });
      return result;
    }
    return response.data;
  },

  // Get chart data for a symbol
  getChartData: async (symbol: string, timeframe: string = 'day', limit: number = 100) => {
    const response = await apiClient.get(buildApiPath('assistant', `/market/chart/${symbol}`), {
      params: { timeframe, limit }
    });
    return response.data;
  },

  // Get stock quote
  getQuote: async (symbol: string) => {
    const response = await apiClient.get(buildApiPath('assistant', `/market/quote/${symbol}`));
    return response.data;
  },

  // VIX endpoint removed - data not available from provider
};

// Screener APIs
export const screenerApi = {
  // Run a screener
  runScreener: async (request: ScreenerRequest): Promise<ScreenerResponse> => {
    const response = await apiClient.post(buildApiPath('assistant', '/screener/run'), request);
    return response.data;
  },

  // Get recent screener runs
  getScreenerRuns: async (limit = 10) => {
    const response = await apiClient.get(buildApiPath('assistant', '/screener/runs'), { params: { limit } });
    return response.data;
  },

  // Run RSI oversold screener
  getRSIOversold: async () => {
    const response = await apiClient.post(buildApiPath('assistant', '/screener/run'), {
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

  // Get top movers from Polygon market movers endpoint
  getTopMovers: async () => {
    const response = await apiClient.get(buildApiPath('assistant', '/market/movers'), {
      params: { direction: 'both', limit: 5, include_otc: false }
    });
    
    // New endpoint returns gainers and losers directly
    const gainers = (response.data?.gainers || []).map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
      price: item.price,
      change: item.change,
      changePercent: item.change_percent
    }));
    
    const losers = (response.data?.losers || []).map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
      price: item.price,
      change: item.change,
      changePercent: item.change_percent
    }));
    
    return { gainers, losers };
  }
};

// Watchlist APIs
export const watchlistApi = {
  list: async () => {
    const response = await apiClient.get(buildApiPath('assistant', '/watchlists'));
    return response.data;
  },
  
  create: async (data: { name: string; description?: string; is_default?: boolean }) => {
    const response = await apiClient.post(buildApiPath('assistant', '/watchlists'), data);
    return response.data;
  },
  
  get: async (watchlistId: string) => {
    const response = await apiClient.get(buildApiPath('assistant', `/watchlists/${watchlistId}`));
    return response.data;
  },
  
  getSnapshot: async (watchlistId: string, forceRefresh = false) => {
    const response = await apiClient.get(buildApiPath('assistant', `/watchlists/${watchlistId}/snapshot`), {
      params: { force_refresh: forceRefresh }
    });
    return response.data;
  },
  
  addSymbols: async (watchlistId: string, symbols: string[]) => {
    const response = await apiClient.post(buildApiPath('assistant', `/watchlists/${watchlistId}/symbols`), { symbols });
    return response.data;
  },
  
  removeSymbol: async (watchlistId: string, symbol: string) => {
    const response = await apiClient.delete(buildApiPath('assistant', `/watchlists/${watchlistId}/symbols/${symbol}`));
    return response.data;
  }
};

// Assistant APIs  
export const assistantApi = {
  ask: async (question: string, mode: string = 'preview'): Promise<AssistantResponse> => {
    const response = await apiClient.post(buildApiPath('assistant', '/ask'), { q: question, mode });
    return response.data;
  },

  // Get market context
  getMarketContext: async (timeframe = 'day') => {
    const response = await apiClient.get(buildApiPath('assistant', '/context/market'), { params: { timeframe } });
    return response.data;
  },

  // Get saved scans
  getSavedScans: async () => {
    const response = await apiClient.get(buildApiPath('assistant', '/saved_scans'));
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
    const response = await apiClient.get(buildApiPath('assistant', '/indicators'));
    return response.data;
  },

  getPresets: async (): Promise<any[]> => {
    const response = await apiClient.get(buildApiPath('assistant', '/presets'));
    return response.data;
  },

  getWatchlists: async (): Promise<any[]> => {
    const response = await apiClient.get(buildApiPath('assistant', '/watchlists'));
    return response.data;
  },
};

// Options APIs
export const optionsApi = {
  // Get unusual options activity
  getUnusualOptions: async () => {
    const response = await apiClient.post(buildApiPath('assistant', '/options/flow/uoa'), {
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
  options: optionsApi,
  watchlists: watchlistApi
};

export default assistantApi;