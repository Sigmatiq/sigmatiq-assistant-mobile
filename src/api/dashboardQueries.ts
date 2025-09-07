import { useQuery } from '@tanstack/react-query';
import { marketApi, screenerApi, assistantApi, watchlistApi } from './client';
import useAppStore from '../stores/useAppStore';

// Day Trading Dashboard Queries
export const useDayTradingData = () => {
  const { watchlist, marketStatus } = useAppStore();
  
  // Get real-time watchlist data with intraday metrics
  const watchlistQuery = useQuery({
    queryKey: ['daytrading-watchlist', watchlist],
    queryFn: async () => {
      // Get quote data for each symbol in watchlist
      const promises = watchlist.slice(0, 10).map(symbol => 
        assistantApi.getSymbolContext(symbol, '5m')
      );
      const results = await Promise.all(promises);
      
      return results.map((data: any) => ({
        symbol: data.symbol,
        price: data.quote?.price || 0,
        change: data.quote?.change || 0,
        changePercent: data.quote?.change_percent || 0,
        volume: data.quote?.volume || 0,
        rvol: data.intraday?.rvol || 1.0, // Relative volume
        vwap: data.intraday?.vwap || 0,
        spread: data.intraday?.spread || 0,
        range: data.intraday?.range || 0
      }));
    },
    refetchInterval: marketStatus === 'open' ? 30000 : false, // Every 30 seconds when market open
    staleTime: 20000,
    enabled: watchlist.length > 0
  });

  // Get top opportunities based on point system scores
  const opportunitiesQuery = useQuery({
    queryKey: ['daytrading-opportunities'],
    queryFn: async () => {
      const response = await screenerApi.runScreener({
        preset_id: 'sp500',
        timeframe: '5m',
        cap: 10,
        target: {
          kind: 'point_system',
          params: { min_score: 60, min_reliability: 70 }
        }
      });
      return response.matched || [];
    },
    refetchInterval: marketStatus === 'open' ? 120000 : false, // Every 2 minutes
    staleTime: 60000
  });

  // Get market breadth data
  const breadthQuery = useQuery({
    queryKey: ['market-breadth'],
    queryFn: marketApi.getMarketBreadth,
    refetchInterval: marketStatus === 'open' ? 120000 : false,
    staleTime: 60000
  });

  // Get top movers
  const moversQuery = useQuery({
    queryKey: ['top-movers'],
    queryFn: screenerApi.getTopMovers,
    refetchInterval: marketStatus === 'open' ? 180000 : false,
    staleTime: 90000
  });

  return {
    watchlist: watchlistQuery.data || [],
    opportunities: opportunitiesQuery.data || [],
    breadth: breadthQuery.data || {},
    movers: moversQuery.data || { gainers: [], losers: [] },
    isLoading: watchlistQuery.isLoading || opportunitiesQuery.isLoading,
    error: watchlistQuery.error || opportunitiesQuery.error
  };
};

// Swing Trading Dashboard Queries
export const useSwingTradingData = () => {
  const { watchlist, marketStatus } = useAppStore();

  // Get watchlist with multi-day metrics
  const watchlistQuery = useQuery({
    queryKey: ['swing-watchlist', watchlist],
    queryFn: async () => {
      const promises = watchlist.slice(0, 10).map(symbol => 
        assistantApi.getSymbolContext(symbol, 'day')
      );
      const results = await Promise.all(promises);
      
      return results.map((data: any) => ({
        symbol: data.symbol,
        price: data.quote?.price || 0,
        change: data.quote?.change || 0,
        changePercent: data.quote?.change_percent || 0,
        change3d: data.metrics?.change_3d || 0,
        change5d: data.metrics?.change_5d || 0,
        atr: data.metrics?.atr || 0,
        atrPercent: data.metrics?.atr_percent || 0,
        trend: data.regime?.trend || 'neutral'
      }));
    },
    refetchInterval: 300000, // Every 5 minutes
    staleTime: 240000,
    enabled: watchlist.length > 0
  });

  // Get swing trading opportunities
  const opportunitiesQuery = useQuery({
    queryKey: ['swing-opportunities'],
    queryFn: async () => {
      const response = await screenerApi.runScreener({
        preset_id: 'sp500',
        timeframe: 'day',
        cap: 10,
        target: {
          kind: 'pattern',
          params: { 
            patterns: ['breakout', 'flag', 'pullback'],
            min_score: 70
          }
        }
      });
      
      return (response.matched || []).map((item: any) => ({
        symbol: item.symbol,
        setup: item.pattern || 'Breakout',
        entry: item.entry_price || 0,
        stop: item.stop_price || 0,
        target: item.target_price || 0,
        score: item.score || 0,
        reliability: item.reliability || 0
      }));
    },
    refetchInterval: 600000, // Every 10 minutes
    staleTime: 300000
  });

  // Get sector rotation data
  const sectorQuery = useQuery({
    queryKey: ['sector-rotation'],
    queryFn: async () => {
      // This would need a real sector rotation endpoint
      // For now, return mock data structure
      return [
        { sector: 'Technology', trend: 'up', strength: 85, flow: '+$2.3B' },
        { sector: 'Energy', trend: 'up', strength: 78, flow: '+$1.8B' },
        { sector: 'Healthcare', trend: 'down', strength: -45, flow: '-$1.2B' },
        { sector: 'Financials', trend: 'neutral', strength: 12, flow: '+$0.3B' }
      ];
    },
    staleTime: 3600000 // 1 hour
  });

  return {
    watchlist: watchlistQuery.data || [],
    opportunities: opportunitiesQuery.data || [],
    sectors: sectorQuery.data || [],
    isLoading: watchlistQuery.isLoading || opportunitiesQuery.isLoading,
    error: watchlistQuery.error || opportunitiesQuery.error
  };
};

// Options Trading Dashboard Queries
export const useOptionsData = () => {
  const { watchlist } = useAppStore();

  // Get watchlist with IV metrics
  const watchlistQuery = useQuery({
    queryKey: ['options-watchlist', watchlist],
    queryFn: async () => {
      // This would need real options API endpoints
      // For now, return structure with mock data
      const promises = watchlist.slice(0, 10).map(async (symbol) => {
        const context = await assistantApi.getSymbolContext(symbol, 'day');
        return {
          symbol: symbol,
          price: context.quote?.price || 0,
          change: context.quote?.change_percent || 0,
          iv: Math.random() * 50 + 20, // Mock IV
          ivRank: Math.random() * 100, // Mock IV Rank
          ivPercentile: Math.random() * 100 // Mock IV Percentile
        };
      });
      
      return Promise.all(promises);
    },
    refetchInterval: 300000, // Every 5 minutes
    staleTime: 240000,
    enabled: watchlist.length > 0
  });

  // Get options strategy ideas
  const strategiesQuery = useQuery({
    queryKey: ['options-strategies'],
    queryFn: async () => {
      // This would need real options strategy API
      // Return mock structure
      return [
        { 
          symbol: 'AAPL', 
          strategy: 'Iron Condor',
          strikes: '190/195/200/205',
          expiry: 'Dec 20',
          credit: 1.85,
          maxLoss: 3.15,
          probability: 68,
          score: 82
        },
        { 
          symbol: 'SPY', 
          strategy: 'Put Credit Spread',
          strikes: '470/475',
          expiry: 'Dec 27',
          credit: 1.20,
          maxLoss: 3.80,
          probability: 72,
          score: 78
        }
      ];
    },
    staleTime: 600000 // 10 minutes
  });

  return {
    watchlist: watchlistQuery.data || [],
    strategies: strategiesQuery.data || [],
    isLoading: watchlistQuery.isLoading,
    error: watchlistQuery.error
  };
};

// Long-term Investing Dashboard Queries
export const useInvestingData = () => {
  const { watchlist } = useAppStore();

  // Get watchlist with fundamental metrics
  const watchlistQuery = useQuery({
    queryKey: ['investing-watchlist', watchlist],
    queryFn: async () => {
      const promises = watchlist.slice(0, 10).map(async (symbol) => {
        const context = await assistantApi.getSymbolContext(symbol, 'day');
        // Would need real fundamental data API
        return {
          symbol: symbol,
          price: context.quote?.price || 0,
          change: context.quote?.change_percent || 0,
          pe: Math.random() * 40 + 10, // Mock P/E
          yield: Math.random() * 4, // Mock dividend yield
          growth: Math.random() * 20 - 5, // Mock growth rate
          score: Math.floor(Math.random() * 30) + 70 // Mock score
        };
      });
      
      return Promise.all(promises);
    },
    refetchInterval: 3600000, // Every hour
    staleTime: 1800000, // 30 minutes
    enabled: watchlist.length > 0
  });

  // Get value opportunities
  const opportunitiesQuery = useQuery({
    queryKey: ['value-opportunities'],
    queryFn: async () => {
      // Would need real fundamental screener
      return [
        { 
          symbol: 'GOOGL',
          thesis: 'AI leadership + Cloud growth',
          valuation: 'Fair',
          pe: 28.5,
          peg: 1.2,
          score: 90,
          reliability: 88,
          targetReturn: '25-30%'
        },
        { 
          symbol: 'V',
          thesis: 'Digital payments growth',
          valuation: 'Attractive',
          pe: 30.2,
          peg: 1.8,
          score: 85,
          reliability: 92,
          targetReturn: '20-25%'
        }
      ];
    },
    staleTime: 3600000 // 1 hour
  });

  // Get research feed
  const researchQuery = useQuery({
    queryKey: ['research-feed'],
    queryFn: async () => {
      // Would need real news/research API
      return [
        { type: 'news', source: 'Reuters', title: 'Apple unveils new AI features', time: '2h ago', symbol: 'AAPL' },
        { type: 'filing', source: '10-Q', title: 'Microsoft Q2 2025 Report', time: '5h ago', symbol: 'MSFT' },
        { type: 'analysis', source: 'Analyst', title: 'Goldman upgrades NVDA', time: '1d ago', symbol: 'NVDA' }
      ];
    },
    refetchInterval: 600000, // Every 10 minutes
    staleTime: 300000
  });

  return {
    watchlist: watchlistQuery.data || [],
    opportunities: opportunitiesQuery.data || [],
    research: researchQuery.data || [],
    isLoading: watchlistQuery.isLoading,
    error: watchlistQuery.error
  };
};

// Focus symbol data (used by all dashboards)
export const useFocusSymbolData = (symbol: string, profile: string) => {
  return useQuery({
    queryKey: ['focus-symbol', symbol, profile],
    queryFn: async () => {
      const timeframe = profile === 'day' ? '5m' : 'day';
      const context = await assistantApi.getSymbolContext(symbol, timeframe);
      
      return {
        symbol: symbol,
        price: context.quote?.price || 0,
        change: context.quote?.change_percent || 0,
        volume: context.quote?.volume || 0,
        // Day trading specific
        vwap: context.intraday?.vwap || 0,
        rvol: context.intraday?.rvol || 1.0,
        spread: context.intraday?.spread || 0,
        // Swing/investing specific  
        support: context.levels?.support || 0,
        resistance: context.levels?.resistance || 0,
        trend: context.regime?.trend || 'neutral',
        atr: context.metrics?.atr || 0,
        atrPercent: context.metrics?.atr_percent || 0,
        // Options specific
        iv: context.options?.iv || 0,
        expectedMove: context.options?.expected_move || 0,
        putCallRatio: context.options?.put_call_ratio || 0
      };
    },
    refetchInterval: profile === 'day' ? 30000 : 300000, // 30s for day trading, 5m for others
    staleTime: profile === 'day' ? 20000 : 240000,
    enabled: !!symbol
  });
};