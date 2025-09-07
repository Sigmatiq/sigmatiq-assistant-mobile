import React, { useEffect, useState } from 'react';
import { Eye, ChevronDown, ChevronUp, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';
import useAppStore from '../stores/useAppStore';

interface WatchlistSymbol {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  change_percent: number;
  volume?: number;
  // Optional intraday enrichments (when detail=full)
  rvol_10d?: number | null;
  spread_bps?: number | null;
  vwap_distance_pct?: number | null;
  session_range_pct?: number | null;
}

interface WatchlistData {
  watchlist_id: string;
  name: string;
  description?: string;
  symbol_count: number;
  symbols: WatchlistSymbol[];
  _cache_metadata?: {
    source: string;
    cached_at?: string;
  };
}

interface UserWatchlist {
  watchlist_id: string;
  name: string;
  description?: string;
  symbol_count?: number;
  is_default?: boolean;
}

const WatchlistCard: React.FC = () => {
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { setSelectedSymbol, setActiveHelper, setHelperContext } = useAppStore();

  // Fetch user's watchlists
  const { data: watchlists = [], isLoading: watchlistsLoading } = useQuery<UserWatchlist[]>({
    queryKey: ['watchlists'],
    queryFn: async () => {
      const response = await api.watchlists.list();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Auto-select default or first watchlist
  useEffect(() => {
    if (watchlists.length > 0 && !selectedWatchlistId) {
      const defaultList = watchlists.find(w => w.is_default);
      setSelectedWatchlistId(defaultList?.watchlist_id || watchlists[0].watchlist_id);
    }
  }, [watchlists, selectedWatchlistId]);

  // Fetch watchlist snapshot data
  const { data: watchlistData, isLoading: dataLoading, error: dataError, refetch, dataUpdatedAt } = useQuery<WatchlistData>({
    queryKey: ['watchlistSnapshot', selectedWatchlistId],
    queryFn: async () => {
      if (!selectedWatchlistId) throw new Error('No watchlist selected');
      const response = await api.watchlists.getSnapshot(selectedWatchlistId);
      return response;
    },
    enabled: !!selectedWatchlistId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // Disable auto-refetch, use manual refresh button
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const selectedWatchlist = watchlists.find(w => w.watchlist_id === selectedWatchlistId);
  const isLoading = watchlistsLoading || dataLoading;

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  if (watchlists.length === 0 && !watchlistsLoading) {
    return (
      <div 
        className="rounded-xl p-4 border"
        style={{ 
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderColor: sigmatiqTheme.colors.background.primary 
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Eye size={20} style={{ color: sigmatiqTheme.colors.text.accent }} />
          <h3 className="font-semibold text-base" style={{ color: sigmatiqTheme.colors.text.primary }}>
            Watchlist
          </h3>
        </div>
        <div className="text-center py-8">
          <p style={{ color: sigmatiqTheme.colors.text.secondary }}>
            No watchlists created yet
          </p>
          <p className="text-sm mt-1" style={{ color: sigmatiqTheme.colors.text.tertiary }}>
            Create a watchlist to track your favorite symbols
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl p-4 border"
      style={{ 
        backgroundColor: sigmatiqTheme.colors.background.secondary,
        borderColor: sigmatiqTheme.colors.background.primary 
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye size={20} style={{ color: sigmatiqTheme.colors.text.accent }} />
          <h3 className="font-semibold text-base" style={{ color: sigmatiqTheme.colors.text.primary }}>
            Watchlist
          </h3>
          {watchlistData?._cache_metadata?.source === 'cache' && (
            <span 
              className="text-xs px-1 py-0.5 rounded text-xs uppercase tracking-wider"
              style={{ 
                backgroundColor: sigmatiqTheme.colors.background.primary,
                color: sigmatiqTheme.colors.text.tertiary 
              }}
            >
              Cached
            </span>
          )}
        </div>
        <span className="text-[11px]" style={{ color: sigmatiqTheme.colors.text.muted }}>
          as of {new Date(dataUpdatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <button
          onClick={() => refetch()}
          className="p-1 rounded hover:bg-opacity-10 transition-colors"
          style={{ color: sigmatiqTheme.colors.text.secondary }}
          disabled={isLoading}
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Watchlist Selector */}
      {watchlists.length > 0 && (
        <div className="relative mb-4">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.primary,
              color: sigmatiqTheme.colors.text.primary 
            }}
          >
            <span>{selectedWatchlist?.name || 'Select Watchlist'}</span>
            {showDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showDropdown && (
            <div 
              className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-10 overflow-hidden"
              style={{ backgroundColor: sigmatiqTheme.colors.background.card }}
            >
              {watchlists.map((watchlist) => (
                <button
                  key={watchlist.watchlist_id}
                  onClick={() => {
                    setSelectedWatchlistId(watchlist.watchlist_id);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-opacity-5 transition-colors"
                  style={{
                    backgroundColor: watchlist.watchlist_id === selectedWatchlistId 
                      ? sigmatiqTheme.colors.background.primary 
                      : 'transparent',
                    color: watchlist.watchlist_id === selectedWatchlistId
                      ? sigmatiqTheme.colors.text.accent
                      : sigmatiqTheme.colors.text.primary
                  }}
                >
                  <div>{watchlist.name} {watchlist.is_default && '(Default)'}</div>
                  {watchlist.description && (
                    <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                      {watchlist.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Watchlist Content */}
      {isLoading ? (
        <LoadingIndicator message="Loading watchlist..." size="small" />
      ) : dataError ? (
        <ErrorMessage message="Failed to load watchlist data" />
      ) : watchlistData && watchlistData.symbols.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {watchlistData.symbols.map((symbol) => (
            <div 
              key={symbol.symbol}
              className="flex items-center justify-between py-2 px-3 rounded hover:bg-opacity-5 transition-colors cursor-pointer"
              style={{ backgroundColor: sigmatiqTheme.colors.background.primary }}
              onClick={() => {
                setSelectedSymbol(symbol.symbol);
                // Only launch StockInfoHelper on mobile (< 768px)
                // On tablets/desktop, the assistant panel will show the stock info
                if (window.innerWidth < 768) {
                  setActiveHelper('stockInfo');
                  setHelperContext({ symbol: symbol.symbol, source: 'panel' });
                }
              }}
            >
              <div className="flex-1">
                <div className="font-medium text-base" style={{ color: sigmatiqTheme.colors.text.primary }}>
                  {symbol.symbol}
                </div>
                <div className="text-xs truncate" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                  {symbol.name || ''}
                </div>
                {/* Intraday metrics row (optional) */}
                {(symbol.rvol_10d != null || symbol.spread_bps != null || symbol.vwap_distance_pct != null) && (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {symbol.rvol_10d != null && (
                      <span title="Relative Volume vs 10-day average (1.0x = average)" className="px-1.5 py-0.5 rounded text-[11px]" style={{
                        backgroundColor: sigmatiqTheme.colors.background.tertiary,
                        color: sigmatiqTheme.colors.text.accent
                      }}>RVOL {Number(symbol.rvol_10d).toFixed(2)}x</span>
                    )}
                    {symbol.spread_bps != null && (
                      <span title="Bid/Ask spread in basis points (lower is better)" className="px-1.5 py-0.5 rounded text-[11px]" style={{
                        backgroundColor: sigmatiqTheme.colors.background.tertiary,
                        color: sigmatiqTheme.colors.text.secondary
                      }}>Spread {Number(symbol.spread_bps).toFixed(1)} bps</span>
                    )}
                    {symbol.vwap_distance_pct != null && (
                      <span title="% above/below intraday VWAP" className="px-1.5 py-0.5 rounded text-[11px]" style={{
                        backgroundColor: sigmatiqTheme.colors.background.tertiary,
                        color: (symbol.vwap_distance_pct || 0) >= 0 ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error
                      }}>VWAP {Number(symbol.vwap_distance_pct).toFixed(2)}%</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-medium text-base" style={{ color: sigmatiqTheme.colors.text.primary }}>
                  {formatPrice(symbol.price)}
                </div>
                <div 
                  className="text-sm flex items-center justify-end gap-1"
                  style={{ 
                    color: symbol.change >= 0 
                      ? sigmatiqTheme.colors.semantic.success 
                      : sigmatiqTheme.colors.semantic.error 
                  }}
                >
                  {symbol.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {formatChange(symbol.change, symbol.change_percent)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p style={{ color: sigmatiqTheme.colors.text.secondary }}>
            No symbols in this watchlist
          </p>
          <p className="text-sm mt-1" style={{ color: sigmatiqTheme.colors.text.tertiary }}>
            Add symbols to track their performance
          </p>
        </div>
      )}

      {/* Footer */}
      {watchlistData && watchlistData.symbol_count > 0 && (
        <div 
          className="mt-3 pt-3 text-center text-sm border-t"
          style={{ 
            borderColor: sigmatiqTheme.colors.background.primary,
            color: sigmatiqTheme.colors.text.secondary 
          }}
        >
          {watchlistData.symbol_count} symbol{watchlistData.symbol_count !== 1 ? 's' : ''} tracked
        </div>
      )}
    </div>
  );
};

export default WatchlistCard;
