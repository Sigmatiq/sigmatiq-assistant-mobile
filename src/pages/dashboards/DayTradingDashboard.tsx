import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  Clock,
  DollarSign,
  BarChart3,
  Eye,
  Bell,
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Volume2,
  Maximize2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import useAppStore from '../../stores/useAppStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import ClickableEntity from '../../components/ClickableEntity';
import { api, calendarApi } from '../../api/client';
import WatchlistCard from '../../components/WatchlistCard';
import { useFocusSymbolData } from '../../api/dashboardQueries';
import useSwipe from '../../hooks/useSwipe';

/**
 * Day Trading Dashboard - Beginner Experience
 * 
 * Based on docs/enhancements/day_trading_dashboard.md
 * 7 Cards: Watchlist, Top Opportunities, Focus Symbol, Market Breadth, 
 *          Top Gainers/Losers, Today's Calendar, Alerts Inbox
 */

const DayTradingDashboard: React.FC = () => {
  const { 
    watchlist, 
    marketStatus,
    selectedSymbol,
    setSelectedSymbol,
    setActiveHelper,
    setHelperContext,
    experience,
    activeHelper
  } = useAppStore();
  const isHelperOpen = Boolean(activeHelper);

  // Fetch watchlist data with intraday metrics
  const { data: watchlistData, isLoading: watchlistLoading } = useQuery({
    queryKey: ['watchlist', 'day', watchlist],
    queryFn: async () => {
      // For now, use market summary endpoint
      // TODO: Extend with detail=full for intraday metrics
      const data = await api.market.getMarketSummary(watchlist);
      return data;
    },
    refetchInterval: isHelperOpen ? false : (marketStatus === 'open' ? 60000 : false),
    staleTime: 30000,
  });

  // Fetch market breadth
  const { data: breadthData, isLoading: breadthLoading, error: breadthError, dataUpdatedAt: breadthUpdatedAt, refetch: refetchBreadth } = useQuery({
    queryKey: ['marketBreadth', 'day', 'withSymbols'],
    queryFn: () => api.market.getMarketBreadth({ includeSymbols: true, presetId: 'sp500', timeframe: 'day', cap: 50 }),
    refetchInterval: isHelperOpen ? false : (marketStatus === 'open' ? 120000 : false),
    staleTime: 60000,
  });

  // Quotes for 52w High/Low symbols (limit to 20 for UI)
  const highsSyms: string[] = (breadthData?.high_symbols || []).slice(0, 20);
  const lowsSyms: string[] = (breadthData?.low_symbols || []).slice(0, 20);
  const { data: highsQuotes, isLoading: highsQuotesLoading } = useQuery({
    queryKey: ['breadthHighsQuotes', highsSyms.join(',')],
    queryFn: async () => api.market.getMarketSummary(highsSyms),
    enabled: highsSyms.length > 0,
    refetchInterval: isHelperOpen ? false : (marketStatus === 'open' ? 60000 : false),
    staleTime: 45000,
  });
  const { data: lowsQuotes, isLoading: lowsQuotesLoading } = useQuery({
    queryKey: ['breadthLowsQuotes', lowsSyms.join(',')],
    queryFn: async () => api.market.getMarketSummary(lowsSyms),
    enabled: lowsSyms.length > 0,
    refetchInterval: isHelperOpen ? false : (marketStatus === 'open' ? 60000 : false),
    staleTime: 45000,
  });

  // Market Breadth swipe mode: counts | highs | lows
  const [breadthMode, setBreadthMode] = useState<'counts' | 'highs' | 'lows'>('counts');
  const { 
    onTouchStart: onBreadthTouchStart, 
    onTouchEnd: onBreadthTouchEnd,
  } = useSwipe({
    onSwipe: (dir) => {
      if (dir === 'right') setBreadthMode('highs');
      if (dir === 'left') setBreadthMode('lows');
    },
  });

  // Fetch top movers via Assistant adapter
  const { data: moversData, isLoading: moversLoading, error: moversError, dataUpdatedAt: moversUpdatedAt, refetch: refetchMovers } = useQuery({
    queryKey: ['topMovers', 'day'],
    queryFn: api.screener.getTopMovers,
    refetchInterval: isHelperOpen ? false : (marketStatus === 'open' ? 180000 : false),
    staleTime: 90000,
  });

  // Fetch top opportunities
  const { data: opportunitiesData, isLoading: oppsLoading, error: oppsError, refetch: refetchOpps } = useQuery({
    queryKey: ['opportunities', 'day'],
    queryFn: () => api.assistant.ask('day trading opportunities with high RVOL', 'analysis'),
    refetchInterval: isHelperOpen ? false : 300000, // 5 minutes
    staleTime: 240000,
  });

  // AI Insights (preview)
  const { data: aiInsights, isLoading: insightsLoading, error: insightsError, dataUpdatedAt: insightsUpdatedAt, refetch: refetchInsights } = useQuery({
    queryKey: ['aiInsights', 'day'],
    queryFn: () => api.assistant.ask('market opportunities today', 'preview'),
    refetchInterval: isHelperOpen ? false : 600000,
    staleTime: 300000,
  });

  // Focus symbol query (enabled when a symbol is selected)
  const { data: focusData, isLoading: focusLoading, error: focusError, refetch: refetchFocus } = useFocusSymbolData(selectedSymbol || '', 'day');

  // Today's Calendar (Economic + Holidays)
  const region = (import.meta.env.VITE_REGION || 'US');
  const todayISO = new Date().toISOString().slice(0,10);
  const econQ = useQuery({
    queryKey: ['calendar','economic', todayISO, region],
    queryFn: () => calendarApi.getEconomicCalendar({ date: todayISO, region }),
    staleTime: 15 * 60 * 1000,
    refetchInterval: marketStatus === 'open' ? 15 * 60 * 1000 : false,
  });
  const d = new Date();
  const holQ = useQuery({
    queryKey: ['calendar','holidays', d.getFullYear(), d.getMonth()+1, region],
    queryFn: () => calendarApi.getHolidays({ year: d.getFullYear(), month: d.getMonth()+1, region }),
    staleTime: 24 * 60 * 60 * 1000,
  });
  const todaysHolidays = (holQ.data || []).filter((h: any) => (h.date || h.date_local) === todayISO);

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
      {/* Watchlist full-width (top row) */}
      <div className="md:col-span-6 lg:col-span-12">
        <WatchlistCard />
      </div>
      {/* ROW: Movers & Breadth */}
      <div className="md:col-span-6 lg:col-span-12 px-1 text-[11px] uppercase tracking-wide" style={{ color: sigmatiqTheme.colors.text.muted }}>
        Movers & Breadth
      </div>

      {/* Market Breadth (one-third on desktop) */}
      <div 
        className="relative rounded-xl border md:col-span-6 lg:col-span-4"
        style={{ 
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderColor: sigmatiqTheme.colors.border.default 
        }}
      >
          <div
            className="p-4 border-b cursor-pointer select-none"
            style={{ borderColor: sigmatiqTheme.colors.border.default }}
            onClick={() => setBreadthMode('counts')}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                {`Market Breadth${breadthMode === 'highs' ? ' — 52w Highs' : breadthMode === 'lows' ? ' — 52w Lows' : ''}`}
              </h3>
              <span className="text-[11px]" style={{ color: sigmatiqTheme.colors.text.muted }}>as of {fmtTime(breadthUpdatedAt)}</span>
            </div>
            {/* Navigation dots indicator */}
            <div className="flex items-center justify-center gap-1 mt-2">
              <div 
                className={`w-1.5 h-1.5 rounded-full transition-all ${breadthMode === 'lows' ? 'w-4' : ''}`}
                style={{ 
                  backgroundColor: breadthMode === 'lows' ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.muted,
                  opacity: breadthMode === 'lows' ? 1 : 0.3
                }} 
              />
              <div 
                className={`w-1.5 h-1.5 rounded-full transition-all ${breadthMode === 'counts' ? 'w-4' : ''}`}
                style={{ 
                  backgroundColor: breadthMode === 'counts' ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.muted,
                  opacity: breadthMode === 'counts' ? 1 : 0.3
                }} 
              />
              <div 
                className={`w-1.5 h-1.5 rounded-full transition-all ${breadthMode === 'highs' ? 'w-4' : ''}`}
                style={{ 
                  backgroundColor: breadthMode === 'highs' ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.muted,
                  opacity: breadthMode === 'highs' ? 1 : 0.3
                }} 
              />
            </div>
          </div>
          
          <div 
            className="p-4 select-none" 
            onTouchStart={onBreadthTouchStart} 
            onTouchEnd={onBreadthTouchEnd}
          >
            {breadthLoading ? (
              <LoadingIndicator message="Loading breadth" size="small" />
            ) : breadthError ? (
              <ErrorMessage error={breadthError} onRetry={() => refetchBreadth()} />
            ) : breadthMode === 'counts' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                    Advancers
                  </span>
                  <span className="font-semibold" style={{ color: sigmatiqTheme.colors.status.success }}>
                    {breadthData?.advance || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                    Decliners
                  </span>
                  <span className="font-semibold" style={{ color: sigmatiqTheme.colors.status.error }}>
                    {breadthData?.decline || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                    Unchanged
                  </span>
                  <span className="font-semibold" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    {breadthData?.unchanged || 0}
                  </span>
                </div>
                
                {/* Breadth Bar */}
                <div className="pt-2">
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: sigmatiqTheme.colors.border.default }}>
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${(breadthData?.advance / (breadthData?.advance + breadthData?.decline + breadthData?.unchanged)) * 100 || 50}%`,
                        backgroundColor: sigmatiqTheme.colors.status.success
                      }}
                    />
                  </div>
                </div>

                {/* New Highs/Lows */}
                <div className="pt-2 border-t" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                      52w Highs
                    </span>
                    <span className="text-xs font-semibold" style={{ color: sigmatiqTheme.colors.status.success }}>
                      {breadthData?.highs_52w || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                      52w Lows
                    </span>
                    <span className="text-xs font-semibold" style={{ color: sigmatiqTheme.colors.status.error }}>
                      {breadthData?.lows_52w || 0}
                    </span>
                  </div>
                </div>
                <div className="pt-1 text-[11px]" style={{ color: sigmatiqTheme.colors.text.muted }}>
                  Swipe right for 52w Highs • left for 52w Lows
                </div>
              </div>
            ) : breadthMode === 'highs' ? (
              <div className="py-3">
                <div className="space-y-2" style={{ maxHeight: '12rem', overflowY: 'auto' }}>
                  {highsQuotesLoading ? (
                    <LoadingIndicator message="Loading prices" size="small" />
                  ) : (
                    <>
                      {highsSyms.map((sym: string) => {
                        const q = (highsQuotes as any)?.[sym];
                        const price = typeof q?.price === 'number' ? `$${q.price.toFixed(2)}` : (q?.price ?? '—');
                        const chgPct = Number(q?.changePercent ?? 0);
                        const color = chgPct >= 0 ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error;
                        return (
                          <div key={sym} className="flex items-center justify-between py-0.5">
                            <ClickableEntity type="symbol" value={sym}>${sym}</ClickableEntity>
                            <div className="text-right">
                              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>{price}</div>
                              <div className="text-xs" style={{ color }}>{chgPct >= 0 ? '+' : ''}{chgPct.toFixed(2)}%</div>
                            </div>
                          </div>
                        );
                      })}
                      {highsSyms.length === 0 && (
                        <div className="text-sm text-center" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          No symbols available.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-3">
                <div className="space-y-2" style={{ maxHeight: '12rem', overflowY: 'auto' }}>
                  {lowsQuotesLoading ? (
                    <LoadingIndicator message="Loading prices" size="small" />
                  ) : (
                    <>
                      {lowsSyms.map((sym: string) => {
                        const q = (lowsQuotes as any)?.[sym];
                        const price = typeof q?.price === 'number' ? `$${q.price.toFixed(2)}` : (q?.price ?? '—');
                        const chgPct = Number(q?.changePercent ?? 0);
                        const color = chgPct >= 0 ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error;
                        return (
                          <div key={sym} className="flex items-center justify-between py-0.5">
                            <ClickableEntity type="symbol" value={sym}>${sym}</ClickableEntity>
                            <div className="text-right">
                              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>{price}</div>
                              <div className="text-xs" style={{ color }}>{chgPct >= 0 ? '+' : ''}{chgPct.toFixed(2)}%</div>
                            </div>
                          </div>
                        );
                      })}
                      {lowsSyms.length === 0 && (
                        <div className="text-sm text-center" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          No symbols available.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Edge blinking arrows (clickable) for mobile browsers */}
          {breadthMode !== 'lows' && (
            <button
              onClick={() => setBreadthMode(breadthMode === 'highs' ? 'counts' : 'lows')}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/10 transition-all animate-pulse z-10"
              style={{ backgroundColor: `${sigmatiqTheme.colors.primary.teal}10` }}
              aria-label="Previous view"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: sigmatiqTheme.colors.primary.teal }} />
            </button>
          )}
          {breadthMode !== 'highs' && (
            <button
              onClick={() => setBreadthMode(breadthMode === 'lows' ? 'counts' : 'highs')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/10 transition-all animate-pulse z-10"
              style={{ backgroundColor: `${sigmatiqTheme.colors.primary.teal}10` }}
              aria-label="Next view"
            >
              <ChevronRight className="w-5 h-5" style={{ color: sigmatiqTheme.colors.primary.teal }} />
            </button>
          )}
          
          {/* Dot indicators at bottom */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            <div 
              className={`w-1.5 h-1.5 rounded-full transition-all ${breadthMode === 'lows' ? 'w-4' : ''}`}
              style={{ 
                backgroundColor: breadthMode === 'lows' 
                  ? sigmatiqTheme.colors.primary.teal 
                  : `${sigmatiqTheme.colors.primary.teal}30`
              }}
            />
            <div 
              className={`w-1.5 h-1.5 rounded-full transition-all ${breadthMode === 'counts' ? 'w-4' : ''}`}
              style={{ 
                backgroundColor: breadthMode === 'counts' 
                  ? sigmatiqTheme.colors.primary.teal 
                  : `${sigmatiqTheme.colors.primary.teal}30`
              }}
            />
            <div 
              className={`w-1.5 h-1.5 rounded-full transition-all ${breadthMode === 'highs' ? 'w-4' : ''}`}
              style={{ 
                backgroundColor: breadthMode === 'highs' 
                  ? sigmatiqTheme.colors.primary.teal 
                  : `${sigmatiqTheme.colors.primary.teal}30`
              }}
            />
          </div>
      </div>

      {/* Top Gainers (mobile: full width; desktop: one third) */}
      <div 
        className="rounded-xl border md:col-span-6 lg:col-span-4 cursor-pointer"
        style={{ backgroundColor: sigmatiqTheme.colors.background.secondary, borderColor: sigmatiqTheme.colors.border.default }}
        onClick={() => { setActiveHelper('list'); setHelperContext({ kind: 'movers', params: { direction: 'gainers' } }); }}
      >
        <div className="p-4 border-b" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
              Top Gainers
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: sigmatiqTheme.colors.text.muted }}>as of {fmtTime(moversUpdatedAt)}</span>
              <ArrowUpRight className="w-4 h-4" style={{ color: sigmatiqTheme.colors.status.success }} />
              <button
                aria-label="View all gainers"
                className="p-1 rounded hover:opacity-80"
                style={{ color: sigmatiqTheme.colors.text.secondary }}
                onClick={(e) => { e.stopPropagation(); setActiveHelper('list'); setHelperContext({ kind: 'movers', params: { direction: 'gainers' } }); }}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4" onClick={(e) => e.stopPropagation()}>
          {moversLoading ? (
            <LoadingIndicator message="Loading gainers" size="small" />
          ) : moversError ? (
            <ErrorMessage error={moversError} onRetry={() => refetchMovers()} />
          ) : (
            <div className="space-y-2 thin-scrollbar" style={{ maxHeight: '16rem', overflowY: 'auto' }}>
              {(moversData?.gainers || []).slice(0, 5).map((s: any) => {
                const pct = Number(s.change_percent ?? s.changePercent ?? 0);
                return (
                  <div key={s.symbol} className="flex justify-between items-center py-1">
                    <ClickableEntity type="symbol" value={s.symbol}>
                      ${s.symbol}
                    </ClickableEntity>
                    <div className="text-right">
                      <div className="text-base font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                        {typeof s.price === 'number' ? `$${s.price.toFixed(2)}` : s.price}
                      </div>
                      <div className="text-sm" style={{ color: sigmatiqTheme.colors.status.success }}>
                        +{pct.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Losers (mobile: full width; desktop: one third) */}
      <div 
        className="rounded-xl border md:col-span-6 lg:col-span-4 cursor-pointer"
        style={{ backgroundColor: sigmatiqTheme.colors.background.secondary, borderColor: sigmatiqTheme.colors.border.default }}
        onClick={() => { setActiveHelper('list'); setHelperContext({ kind: 'movers', params: { direction: 'losers' } }); }}
      >
        <div className="p-4 border-b" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
              Top Losers
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: sigmatiqTheme.colors.text.muted }}>as of {fmtTime(moversUpdatedAt)}</span>
              <ArrowDownRight className="w-4 h-4" style={{ color: sigmatiqTheme.colors.status.error }} />
              <button
                aria-label="View all losers"
                className="p-1 rounded hover:opacity-80"
                style={{ color: sigmatiqTheme.colors.text.secondary }}
                onClick={(e) => { e.stopPropagation(); setActiveHelper('list'); setHelperContext({ kind: 'movers', params: { direction: 'losers' } }); }}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4" onClick={(e) => e.stopPropagation()}>
          {moversLoading ? (
            <LoadingIndicator message="Loading losers" size="small" />
          ) : moversError ? (
            <ErrorMessage error={moversError} onRetry={() => refetchMovers()} />
          ) : (
            <div className="space-y-2 thin-scrollbar" style={{ maxHeight: '16rem', overflowY: 'auto' }}>
              {(moversData?.losers || []).slice(0, 5).map((s: any) => {
                const pct = Number(s.change_percent ?? s.changePercent ?? 0);
                return (
                  <div key={s.symbol} className="flex justify-between items-center py-1">
                    <ClickableEntity type="symbol" value={s.symbol}>
                      ${s.symbol}
                    </ClickableEntity>
                    <div className="text-right">
                      <div className="text-base font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                        {typeof s.price === 'number' ? `$${s.price.toFixed(2)}` : s.price}
                      </div>
                      <div className="text-sm" style={{ color: sigmatiqTheme.colors.status.error }}>
                        {pct.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* ROW: Opportunities & Focus */}
      <div className="md:col-span-6 lg:col-span-12 px-1 text-[11px] uppercase tracking-wide" style={{ color: sigmatiqTheme.colors.text.muted }}>
        Opportunities & Focus
      </div>

      {/* Top Opportunities (half width on desktop) */}
      <div className="md:col-span-6 lg:col-span-6">
        <div 
          className="rounded-xl border"
          style={{ backgroundColor: sigmatiqTheme.colors.background.secondary, borderColor: sigmatiqTheme.colors.border.default }}
        >
          <div className="p-4 border-b" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Top Opportunities
              </h3>
              <Activity className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.teal }} />
            </div>
          </div>
          <div className="p-4 space-y-3" style={{ maxHeight: '18rem', overflowY: 'auto' }}>
            {oppsLoading ? (
              <LoadingIndicator message="Finding opportunities" size="small" />
            ) : oppsError ? (
              <ErrorMessage error={oppsError} onRetry={() => refetchOpps()} />
            ) : (
              (() => {
                const opps = (opportunitiesData as any)?.preview?.opportunities || [];
                if (!opps || opps.length === 0) {
                  return (
                    <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                      No opportunities returned
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {opps.slice(0, 4).map((opp: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg border hover:scale-[1.01] transition-all"
                           style={{ backgroundColor: sigmatiqTheme.colors.background.primary, borderColor: sigmatiqTheme.colors.border.default }}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                                {Array.isArray(opp.symbols) && opp.symbols.length > 0 ? opp.symbols.slice(0,3).join(', ') : (opp.type || 'Opportunity')}
                              </span>
                              {opp.type && (
                                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${sigmatiqTheme.colors.primary.teal}20`, color: sigmatiqTheme.colors.primary.teal }}>
                                  {opp.type}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {opp.confidence != null && (
                              <div className="text-sm font-semibold" style={{ color: sigmatiqTheme.colors.primary.teal }}>
                                Conf: {Number(opp.confidence).toFixed(0)}
                              </div>
                            )}
                          </div>
                        </div>
                        {opp.description && (
                          <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                            {opp.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>

      {/* Focus Symbol (wide on desktop) */}
      {selectedSymbol && (
        <div 
          className="rounded-xl border md:col-span-6 lg:col-span-8"
          style={{ 
            backgroundColor: sigmatiqTheme.colors.background.secondary,
            borderColor: sigmatiqTheme.colors.border.default 
          }}
        >
            <div className="p-4 border-b" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                  Focus: {selectedSymbol}
                </h3>
                <button
                  onClick={() => {
                    setActiveHelper('charting');
                    setHelperContext({ symbol: selectedSymbol, source: 'focus' });
                  }}
                  className="text-sm flex items-center gap-1 hover:opacity-80"
                  style={{ color: sigmatiqTheme.colors.primary.teal }}
                >
                  View Chart <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {focusLoading ? (
                <LoadingIndicator message="Loading focus symbol" size="small" />
              ) : focusError ? (
                <ErrorMessage error={focusError} onRetry={() => refetchFocus()} />
              ) : focusData ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Price</div>
                    <div className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                      {typeof focusData.price === 'number' ? `$${focusData.price.toFixed(2)}` : focusData.price}
                    </div>
                    <div className="text-xs" style={{ color: (focusData.change ?? 0) >= 0 ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error }}>
                      {focusData.change != null ? `${(focusData.change >= 0 ? '+' : '')}${Number(focusData.change).toFixed(2)}%` : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>VWAP</div>
                    <div className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                      {typeof focusData.vwap === 'number' ? `$${focusData.vwap.toFixed(2)}` : (focusData.vwap ?? '—')}
                    </div>
                    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                      {focusData.vwap != null && focusData.price != null ? `${(((focusData.price as number) - (focusData.vwap as number)) / (focusData.vwap as number) * 100).toFixed(2)}% dist` : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>RVOL</div>
                    <div className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.primary.teal }}>
                      {focusData.rvol != null ? `${Number(focusData.rvol).toFixed(2)}x` : '—'}
                    </div>
                    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                      {focusData.rvol != null ? (Number(focusData.rvol) >= 1.5 ? 'High activity' : 'Normal') : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Range %</div>
                    <div className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                      {focusData.range != null ? `${Number(focusData.range).toFixed(0)}%` : '—'}
                    </div>
                    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                      &nbsp;
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Badges */}
              <div className="flex gap-2 mt-4 flex-wrap">
                <span className="text-xs px-2 py-1 rounded" style={{
                  backgroundColor: `${sigmatiqTheme.colors.status.success}20`,
                  color: sigmatiqTheme.colors.status.success
                }}>
                  Above VWAP
                </span>
                <span className="text-xs px-2 py-1 rounded" style={{
                  backgroundColor: `${sigmatiqTheme.colors.primary.teal}20`,
                  color: sigmatiqTheme.colors.primary.teal
                }}>
                  High RVOL
                </span>
                <span className="text-xs px-2 py-1 rounded" style={{
                  backgroundColor: `${sigmatiqTheme.colors.status.warning}20`,
                  color: sigmatiqTheme.colors.status.warning
                }}>
                  Near Resistance
                </span>
              </div>
            </div>
          </div>
      )}

      {/* ROW: Insights & Tools */}
      <div className="md:col-span-6 lg:col-span-12 px-1 text-[11px] uppercase tracking-wide" style={{ color: sigmatiqTheme.colors.text.muted }}>
        Insights & Tools
      </div>

      {/* AI Insights (half width) */}
      <div
        className="rounded-xl border md:col-span-6 lg:col-span-6"
        style={{ backgroundColor: sigmatiqTheme.colors.background.secondary, borderColor: sigmatiqTheme.colors.border.default }}
      >
        <div className="p-4 border-b" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
              AI Insights
            </h3>
            <span className="text-[11px]" style={{ color: sigmatiqTheme.colors.text.muted }}>as of {fmtTime(insightsUpdatedAt)}</span>
          </div>
        </div>
        <div className="p-4">
          {insightsLoading ? (
            <LoadingIndicator message="Fetching insights" size="small" />
          ) : insightsError ? (
            <ErrorMessage error={insightsError} onRetry={() => refetchInsights()} />
          ) : (
            <div className="space-y-3" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              {aiInsights?.preview?.opportunities && aiInsights.preview.opportunities.length > 0 ? (
                aiInsights.preview.opportunities.slice(0, 2).map((opp: any, idx: number) => (
                  <div key={idx}>
                    <div className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                      {opp.type || 'Opportunity'}
                    </div>
                    <div className="text-sm">{opp.description || ''}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm">No insights available.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Screeners (half width) */}
      <div
        className="rounded-xl border md:col-span-6 lg:col-span-6"
        style={{ backgroundColor: sigmatiqTheme.colors.background.secondary, borderColor: sigmatiqTheme.colors.border.default }}
      >
        <div className="p-4 border-b" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
          <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
            Quick Screeners
          </h3>
        </div>
        <div className="p-4 space-y-2">
          <button
            className="w-full text-left p-3 rounded-lg border transition-all hover:scale-[1.02]"
            style={{ backgroundColor: sigmatiqTheme.colors.background.primary, borderColor: sigmatiqTheme.colors.border.default }}
            onClick={() => setActiveHelper('action')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-base" style={{ color: sigmatiqTheme.colors.text.primary }}>Oversold RSI</div>
                <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>RSI &lt; 30</div>
              </div>
            </div>
          </button>
          <button
            className="w-full text-left p-3 rounded-lg border transition-all hover:scale-[1.02]"
            style={{ backgroundColor: sigmatiqTheme.colors.background.primary, borderColor: sigmatiqTheme.colors.border.default }}
            onClick={() => setActiveHelper('action')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-base" style={{ color: sigmatiqTheme.colors.text.primary }}>Volume Breakout</div>
                <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>Vol &gt; 2x Avg</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ROW: Calendar & Alerts */}
      <div className="md:col-span-6 lg:col-span-12 px-1 text-[11px] uppercase tracking-wide" style={{ color: sigmatiqTheme.colors.text.muted }}>
        Calendar & Alerts
      </div>

      {/* Today's Calendar */}
      <div 
        className="rounded-xl border md:col-span-6 lg:col-span-6"
        style={{ 
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderColor: sigmatiqTheme.colors.border.default 
        }}
      >
          <div className="p-4 border-b" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Today's Calendar
              </h3>
              <Clock className="w-4 h-4" style={{ color: sigmatiqTheme.colors.text.muted }} />
            </div>
          </div>
          <div className="p-4 space-y-3">
            {/* Economic Events Today */}
            <div>
              <div className="text-sm font-semibold mb-2" style={{ color: sigmatiqTheme.colors.text.primary }}>Economic</div>
              {econQ.isLoading ? (
                <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>Loading…</div>
              ) : (Array.isArray(econQ.data) && econQ.data.length > 0) ? (
                <div className="space-y-1">
                  {econQ.data.slice(0,6).map((e: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded border" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px]" style={{ color: sigmatiqTheme.colors.text.muted }}>{e.time_local || e.time || '-'}</span>
                        <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.primary }}>{e.name || e.event || 'Event'}</span>
                      </div>
                      <div className="text-right text-[11px]" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                        {e.actual != null && <div>Actual: {e.actual}</div>}
                        {e.consensus != null && <div>Est: {e.consensus}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>No events today</div>
              )}
            </div>
            {/* Holidays Today */}
            <div>
              <div className="text-sm font-semibold mb-2" style={{ color: sigmatiqTheme.colors.text.primary }}>Holidays</div>
              {holQ.isLoading ? (
                <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>Loading…</div>
              ) : todaysHolidays.length > 0 ? (
                <div className="space-y-1">
                  {todaysHolidays.map((h: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded border" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
                      <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.primary }}>{h.name || h.title || 'Holiday'}</div>
                      <div className="text-[11px]" style={{ color: sigmatiqTheme.colors.text.secondary }}>{h.status || h.market_status || ''}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>No holidays today</div>
              )}
            </div>
          </div>
      </div>

      {/* Alerts Inbox */}
      <div 
        className="rounded-xl border md:col-span-6 lg:col-span-6"
        style={{ 
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderColor: sigmatiqTheme.colors.border.default 
        }}
      >
          <div className="p-4 border-b" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Alerts Inbox
              </h3>
              <Bell className="w-4 h-4" style={{ color: sigmatiqTheme.colors.text.muted }} />
            </div>
          </div>
          <div className="p-4">
            <ErrorMessage error="Alerts are not wired to backend yet" />
          </div>
        </div>
    </div>
  );
};

export default DayTradingDashboard;
  const fmtTime = (ts?: number) => {
    try {
      if (!ts) return '';
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };
