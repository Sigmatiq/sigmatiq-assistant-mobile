import React from 'react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import useAppStore from '../stores/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { computeMarketStatus } from '../utils/marketStatus';

interface TickerItemProps {
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
  isRemovable?: boolean;
  onRemove?: () => void;
}

/**
 * Memoized ticker item to prevent re-renders
 */
const TickerItem = React.memo<TickerItemProps>(({ 
  symbol, 
  price, 
  change, 
  isPositive, 
  isRemovable,
  onRemove 
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100/10 transition-colors group whitespace-nowrap">
      <span className="font-semibold text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>
        {symbol}
      </span>
      <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
        {price}
      </span>
      <span className="text-sm font-semibold" style={{ 
        color: isPositive ? '#10b981' : '#ef4444'
      }}>
        {isPositive && '+'}{change}
      </span>
      {isRemovable && onRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
          style={{ color: sigmatiqTheme.colors.text.tertiary }}
        >
          ×
        </button>
      )}
    </div>
  );
});

TickerItem.displayName = 'TickerItem';

/**
 * Memoized ticker bar that uses CSS animations
 * Doesn't cause React re-renders
 */
const TickerBar = React.memo(() => {
  const { watchlist, removeFromWatchlist, marketStatus } = useAppStore();

  // Build the symbol list (indices + first few from watchlist)
  const base = ['SPY', 'QQQ', 'DIA'];
  const extra = watchlist.filter((s) => !base.includes(s)).slice(0, 7);
  const symbols = [...base, ...extra];

  const { data: summary = {}, isLoading } = useQuery({
    queryKey: ['tickerBarSummary', symbols],
    queryFn: () => api.market.getMarketSummary(symbols),
    refetchInterval: marketStatus === 'open' ? 30000 : 120000,
    staleTime: 25000,
  });

  // Compute market status (ET) and tint bar accordingly; update once per minute
  const [status, setStatus] = React.useState(() => computeMarketStatus());
  React.useEffect(() => {
    const tick = () => setStatus(computeMarketStatus());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const phaseTint = React.useMemo(() => {
    switch (status.phase) {
      case 'open':
        return `${sigmatiqTheme.colors.status.success}15`;
      case 'pre':
      case 'after':
        return `${sigmatiqTheme.colors.status.warning}15`;
      case 'closed':
      default:
        return sigmatiqTheme.colors.background.tertiary;
    }
  }, [status.phase]);

  return (
    <div 
      className="relative overflow-hidden h-10"
      style={{ 
        backgroundColor: phaseTint,
        borderBottom: `1px solid ${sigmatiqTheme.colors.border.default}`
      }}
      aria-live="polite"
    >
      <div className="absolute inset-0 flex items-center overflow-hidden">
        {/* Scrolling ticker content */}
        <div className="flex items-center animate-scroll-ticker">
          {/* First set of items */}
          <div className="flex items-center gap-2 px-3">
            {/* Simple inline status (dot + text) */}
            <span className="flex items-center gap-2" title={`${status.label}; ${status.timeText}`}>
              <span
                aria-hidden
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  backgroundColor: status.phase === 'open'
                    ? sigmatiqTheme.colors.status.success
                    : status.phase === 'closed'
                    ? sigmatiqTheme.colors.status.error
                    : sigmatiqTheme.colors.status.warning
                }}
              />
              <span className="text-xs font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                {status.label}
              </span>
              <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                • {status.timeText}
              </span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60" style={{ color: sigmatiqTheme.colors.text.muted }}>
              Markets
            </span>
            {base.map((sym) => {
              const d = (summary as any)?.[sym];
              const price = d ? `$${Number(d.price || 0).toFixed(2)}` : '---';
              const chgPctNum = d ? Number(d.changePercent || 0) : 0;
              const change = `${chgPctNum.toFixed(2)}%`;
              return (
                <TickerItem
                  key={sym}
                  symbol={sym}
                  price={price}
                  change={change}
                  isPositive={chgPctNum >= 0}
                />
              );
            })}
            
            {/* User Watchlist */}
            {watchlist.length > 0 && (
              <>
                <div className="w-px h-5 opacity-30 mx-2" style={{ backgroundColor: sigmatiqTheme.colors.border.default }} />
                {extra.map((ticker) => {
                  const d = (summary as any)?.[ticker];
                  const price = d ? `$${Number(d.price || 0).toFixed(2)}` : '---';
                  const chgPctNum = d ? Number(d.changePercent || 0) : 0;
                  return (
                    <TickerItem
                      key={ticker}
                      symbol={ticker}
                      price={price}
                      change={`${chgPctNum.toFixed(2)}%`}
                      isPositive={chgPctNum >= 0}
                      isRemovable={false}
                      onRemove={() => removeFromWatchlist(ticker)}
                    />
                  );
                })}
              </>
            )}
          </div>
          
          {/* Duplicate for seamless scroll */}
          <div className="flex items-center gap-2 px-3">
            {/* Duplicate inline status */}
            <span className="flex items-center gap-2" title={`${status.label}; ${status.timeText}`}>
              <span
                aria-hidden
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  backgroundColor: status.phase === 'open'
                    ? sigmatiqTheme.colors.status.success
                    : status.phase === 'closed'
                    ? sigmatiqTheme.colors.status.error
                    : sigmatiqTheme.colors.status.warning
                }}
              />
              <span className="text-xs font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                {status.label}
              </span>
              <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                • {status.timeText}
              </span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60" style={{ color: sigmatiqTheme.colors.text.muted }}>
              Markets
            </span>
            {base.map((sym) => {
              const d = (summary as any)?.[sym];
              const price = d ? `$${Number(d.price || 0).toFixed(2)}` : '---';
              const chgPctNum = d ? Number(d.changePercent || 0) : 0;
              const change = `${chgPctNum.toFixed(2)}%`;
              return (
                <TickerItem
                  key={`${sym}-dup`}
                  symbol={sym}
                  price={price}
                  change={change}
                  isPositive={chgPctNum >= 0}
                />
              );
            })}
            
            {/* User Watchlist duplicate */}
            {watchlist.length > 0 && (
              <>
                <div className="w-px h-5 opacity-30 mx-2" style={{ backgroundColor: sigmatiqTheme.colors.border.default }} />
                {extra.map((ticker) => {
                  const d = (summary as any)?.[ticker];
                  const price = d ? `$${Number(d.price || 0).toFixed(2)}` : '---';
                  const chgPctNum = d ? Number(d.changePercent || 0) : 0;
                  return (
                    <TickerItem
                      key={`${ticker}-dup`}
                      symbol={ticker}
                      price={price}
                      change={`${chgPctNum.toFixed(2)}%`}
                      isPositive={chgPctNum >= 0}
                      isRemovable={false}
                      onRemove={() => removeFromWatchlist(ticker)}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TickerBar.displayName = 'TickerBar';

export default TickerBar;
