import React, { useEffect, useState, lazy, Suspense } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, 
  MessageCircle, LineChart, AlertCircle, Zap, Search,
  Brain, Target, BookOpen, Calendar, Bell, ChevronRight,
  ArrowUpRight, ArrowDownRight, Clock, Info, Eye,
  TrendingUp as TrendIcon, Filter, Download, Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import useAppStore from '../stores/useAppStore';
import { useMarketDataQuery } from '../api/queries';
import ClickableEntity from '../components/ClickableEntity';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import { api } from '../api/client';
import { computeMarketStatus } from '../utils/marketStatus';
import WatchlistCard from '../components/WatchlistCard';
// Removed profile tiles (day/swing/options/invest) per request
// Experience level selector removed per request

// Lazy load dashboard components for better performance
const DayTradingDashboard = lazy(() => import('./dashboards/DayTradingDashboard'));
const SwingTradingDashboard = lazy(() => import('./dashboards/SwingTradingDashboard'));
const OptionsTradingDashboard = lazy(() => import('./dashboards/OptionsTradingDashboard'));
const LongTermInvestingDashboard = lazy(() => import('./dashboards/LongTermInvestingDashboard'));

const Dashboard = () => {
  const { 
    watchlist, 
    marketStatus, 
    setActiveView, 
    setSelectedSymbol, 
    setMarketStatus,
    setActiveHelper,
    setHelperContext,
    tradingProfile
  } = useAppStore();
  
  // (Market status computation moved to ticker bar and store effect)
  
  // Keep store marketStatus updated (used for polling cadence)
  React.useEffect(() => {
    const applyStatus = () => {
      const s = computeMarketStatus();
      if (s.phase === 'open') setMarketStatus('open');
      else if (s.phase === 'pre') setMarketStatus('pre-market');
      else if (s.phase === 'after') setMarketStatus('after-hours');
      else setMarketStatus('closed');
    };
    applyStatus();
    const id = setInterval(applyStatus, 60000);
    return () => clearInterval(id);
  }, [setMarketStatus]);
  const { data: marketData, isLoading } = useMarketDataQuery(
    watchlist,
    marketStatus === 'open'
  );

  // Fetch market breadth data
  const { data: marketBreadthData, isLoading: breadthLoading, error: breadthError } = useQuery({
    queryKey: ['marketBreadth'],
    queryFn: api.market.getMarketBreadth,
    refetchInterval: marketStatus === 'open' ? 120000 : false, // Refetch every 2 minutes if market open
    staleTime: 60000, // Data considered fresh for 1 minute
    retry: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
  });

  // VIX data removed - not available from data provider

  // Fetch top movers
  const { data: moversData, isLoading: moversLoading } = useQuery({
    queryKey: ['topMovers'],
    queryFn: api.screener.getTopMovers,
    refetchInterval: marketStatus === 'open' ? 180000 : false, // Refetch every 3 minutes
    staleTime: 90000, // Fresh for 1.5 minutes
  });

  // Indices data removed - shown in top ticker bar instead

  // Fetch AI insights
  const { data: aiInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: () => api.assistant.ask('market opportunities today', 'preview'),
    refetchInterval: 600000, // Refetch every 10 minutes
    staleTime: 300000, // Fresh for 5 minutes
  });

  // Use correct field names from API response
  const marketBreadth = {
    advancers: marketBreadthData?.advance || 0,
    decliners: marketBreadthData?.decline || 0,
    unchanged: marketBreadthData?.unchanged || 0,
    highs52w: marketBreadthData?.highs_52w || 0,
    lows52w: marketBreadthData?.lows_52w || 0,
    cap: marketBreadthData?.cap || 0
  };

  // Calculate market breadth percentage
  const totalStocks = marketBreadth.advancers + marketBreadth.decliners + marketBreadth.unchanged;
  const advancePercent = totalStocks > 0 ? (marketBreadth.advancers / totalStocks * 100).toFixed(1) : '0.0';

  // Use real data for market movers
  const topGainers = moversData?.gainers || [];
  const topLosers = moversData?.losers || [];

  // Check if any critical data is loading
  const isLoadingCritical = breadthLoading;

  // Render profile-specific dashboard
  const renderProfileDashboard = () => {
    switch (tradingProfile) {
      case 'day':
        return <DayTradingDashboard />;
      case 'swing':
        return <SwingTradingDashboard />;
      case 'options':
        return <OptionsTradingDashboard />;
      case 'investing':
        return <LongTermInvestingDashboard />;
      default:
        return <DayTradingDashboard />;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Profile tiles removed per request */}
      
      <div className="p-4 space-y-4">
        {/* Experience level selector removed */}

        {/* Market Status card removed; status displayed in ticker bar */}

      {/* Profile-specific Dashboard */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <LoadingIndicator message="Loading dashboard" size="large" />
        </div>
      }>
        {renderProfileDashboard()}
      </Suspense>

      {/* Legacy dashboard content - keeping market breadth for now */}
      {false && (
      <>
      <div className="grid grid-cols-1 gap-4">
        {/* Market Breadth */}
        <div 
          className="rounded-xl p-4 border"
          style={{ 
            backgroundColor: sigmatiqTheme.colors.background.secondary,
            borderColor: sigmatiqTheme.colors.border.default 
          }}
        >
          <h3 className="text-base font-semibold mb-3" style={{ color: sigmatiqTheme.colors.text.primary }}>
            Market Breadth (S&P 500)
          </h3>
          {breadthLoading ? (
            <div className="flex items-center justify-center h-24">
              <LoadingIndicator message="Loading breadth data" size="small" />
            </div>
          ) : breadthError ? (
            <ErrorMessage 
              error={breadthError} 
              onRetry={() => window.location.reload()} 
            />
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: sigmatiqTheme.colors.status.success }}>
                  Advancing
                </span>
                <span className="font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                  {marketBreadth.advancers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: sigmatiqTheme.colors.status.error }}>
                  Declining
                </span>
                <span className="font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                  {marketBreadth.decliners}
                </span>
              </div>
              {marketBreadth.unchanged > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    Unchanged
                  </span>
                  <span className="font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    {marketBreadth.unchanged}
                  </span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    52w Highs
                  </span>
                  <span className="text-sm font-semibold" style={{ color: sigmatiqTheme.colors.status.success }}>
                    {marketBreadth.highs52w}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    52w Lows
                  </span>
                  <span className="text-sm font-semibold" style={{ color: sigmatiqTheme.colors.status.error }}>
                    {marketBreadth.lows52w}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
                <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                  {advancePercent}% advancing ({marketBreadth.cap} stocks sampled)
                </div>
                {/* Visual bar */}
                <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: sigmatiqTheme.colors.border.default }}>
                  <div 
                    className="h-full transition-all duration-500" 
                    style={{ 
                      width: `${advancePercent}%`,
                      backgroundColor: parseFloat(advancePercent) > 50 ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - AI Insights */}
        <div className="space-y-4">
          <AIInsightCard 
            title="Market Analysis"
            icon={Brain}
            content={
              insightsLoading ? (
                <LoadingIndicator message="Getting insights" size="small" />
              ) : (
                <>
                  {aiInsights?.preview?.opportunities ? (
                    <div className="space-y-3">
                      {aiInsights.preview.opportunities.slice(0, 2).map((opp: any, idx: number) => (
                        <div key={idx}>
                          <div className="font-semibold text-sm mb-1" style={{ color: sigmatiqTheme.colors.text.accent }}>
                            {opp.type}
                          </div>
                          <div className="text-sm mb-1" style={{ color: sigmatiqTheme.colors.text.primary }}>
                            {opp.description}
                          </div>
                          {opp.symbols && opp.symbols.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {opp.symbols.map((sym: string) => (
                                <span 
                                  key={sym}
                                  className="px-2 py-1 rounded text-sm font-medium cursor-pointer hover:opacity-80"
                                  style={{ 
                                    backgroundColor: sigmatiqTheme.colors.background.tertiary,
                                    color: sigmatiqTheme.colors.text.accent 
                                  }}
                                  onClick={() => {
                                    setSelectedSymbol(sym);
                                    setActiveView('charts');
                                  }}
                                >
                                  ${sym}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : aiInsights?.summary ? (
                    <span>{aiInsights.summary}</span>
                  ) : (
                    <>
                      The market shows <ClickableEntity type="term" value="mixed signals">mixed signals</ClickableEntity> with{' '}
                      <ClickableEntity type="indicator" value="RSI">RSI</ClickableEntity> indicating oversold conditions on{' '}
                      <ClickableEntity type="symbol" value="SPY">$SPY</ClickableEntity> while{' '}
                      <ClickableEntity type="pattern" value="bull flag">bull flag</ClickableEntity> patterns emerge in tech stocks.
                    </>
                  )}
                </>
              )
            }
            actionLabel="View Full Analysis"
            onAction={() => console.log('View analysis')}
          />

          <AIInsightCard 
            title="Learning Tip"
            icon={BookOpen}
            content={
              <>
                Understanding <ClickableEntity type="indicator" value="MACD">MACD</ClickableEntity> crossovers can help identify{' '}
                <ClickableEntity type="term" value="trend reversals">trend reversals</ClickableEntity>. Try combining with{' '}
                <ClickableEntity type="indicator" value="volume">volume</ClickableEntity> for confirmation.
              </>
            }
            actionLabel="Learn More"
            onAction={() => console.log('Learn more')}
          />
        </div>

        {/* Center Column - Quick Screeners */}
        <div className="space-y-4">
          <div 
            className="rounded-xl p-4 border"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              borderColor: sigmatiqTheme.colors.border.default 
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Quick Screeners
              </h3>
              <button 
                onClick={() => setActiveView('screener')}
                className="text-sm flex items-center gap-1 hover:opacity-80"
                style={{ color: sigmatiqTheme.colors.primary.teal }}
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              <ScreenerCard 
                name="Oversold RSI"
                description="RSI < 30"
                count={12}
                icon={TrendingDown}
                onClick={() => console.log('Run oversold screener')}
              />
              <ScreenerCard 
                name="Volume Breakout"
                description="Volume > 2x Avg"
                count={28}
                icon={Activity}
                onClick={() => console.log('Run volume screener')}
              />
              <ScreenerCard 
                name="52-Week Highs"
                description="Within 2% of high"
                count={45}
                icon={TrendingUp}
                onClick={() => console.log('Run highs screener')}
              />
              <ScreenerCard 
                name="Bullish Patterns"
                description="Cup & Handle, Flags"
                count={8}
                icon={LineChart}
                onClick={() => console.log('Run pattern screener')}
              />
            </div>
          </div>

          {/* Recent Searches */}
          <div 
            className="rounded-xl p-4 border"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              borderColor: sigmatiqTheme.colors.border.default 
            }}
          >
            <h3 className="text-base font-semibold mb-3" style={{ color: sigmatiqTheme.colors.text.primary }}>
              Your Recent Analysis
            </h3>
            <div className="space-y-2">
              <RecentItem symbol="AAPL" time="2 min ago" type="chart" />
              <RecentItem symbol="TSLA" time="15 min ago" type="screener" />
              <RecentItem symbol="SPY" time="1 hour ago" type="options" />
            </div>
          </div>
        </div>

        {/* Right Column - Market Movers */}
        <div className="space-y-4">
          {/* Top Gainers */}
          <div 
            className="rounded-xl p-4 border"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              borderColor: sigmatiqTheme.colors.border.default 
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Top Gainers
              </h3>
              <ArrowUpRight className="w-4 h-4" style={{ color: sigmatiqTheme.colors.status.success }} />
            </div>
            {moversLoading ? (
              <div className="flex items-center justify-center h-20">
                <LoadingIndicator message="Loading gainers" size="small" />
              </div>
            ) : (
              <div className="space-y-2">
                {topGainers.length > 0 ? (
                  topGainers.slice(0, 5).map(stock => (
                    <MoverItem key={stock.symbol} {...stock} isGainer={true} />
                  ))
                ) : (
                  <div className="text-sm text-center py-2" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    No data available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top Losers */}
          <div 
            className="rounded-xl p-4 border"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              borderColor: sigmatiqTheme.colors.border.default 
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Top Losers
              </h3>
              <ArrowDownRight className="w-4 h-4" style={{ color: sigmatiqTheme.colors.status.error }} />
            </div>
            {moversLoading ? (
              <div className="flex items-center justify-center h-20">
                <LoadingIndicator message="Loading losers" size="small" />
              </div>
            ) : (
              <div className="space-y-2">
                {topLosers.length > 0 ? (
                  topLosers.slice(0, 5).map(stock => (
                    <MoverItem key={stock.symbol} {...stock} isGainer={false} />
                  ))
                ) : (
                  <div className="text-sm text-center py-2" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    No data available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Watchlist */}
          <WatchlistCard />
        </div>
      </div>

      {/* Analysis Tools Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <ToolCard 
          icon={LineChart}
          title="Charts"
          description="Technical analysis"
          onClick={() => {
            setActiveHelper('charting');
            setHelperContext({ symbol: 'SPY', source: 'panel' });
          }}
        />
        <ToolCard 
          icon={Filter}
          title="Screener"
          description="Find stocks"
          onClick={() => {
            setActiveHelper('action');
            setHelperContext({ source: 'panel', trigger: 'screener' });
          }}
        />
        <ToolCard 
          icon={BarChart3}
          title="Compare"
          description="Side by side"
          onClick={() => {
            setActiveHelper('charting');
            setHelperContext({ symbol: 'SPY', source: 'panel', trigger: 'compare' });
          }}
        />
        <ToolCard 
          icon={Target}
          title="Options"
          description="Options flow"
          onClick={() => console.log('Options')}
        />
        <ToolCard 
          icon={Brain}
          title="Learning"
          description="Learn trading"
          onClick={() => {
            setActiveHelper('learning');
            setHelperContext({ source: 'panel', topic: 'basics' });
          }}
        />
        <ToolCard 
          icon={Bell}
          title="Alerts"
          description="Set alerts"
          onClick={() => console.log('Alerts')}
        />
      </div>
      </>
      )}
      </div>
    </div>
  );
};

// Component definitions
const MarketIndexCard = ({ name, value, change, changePercent }: any) => {
  const isPositive = changePercent > 0;
  const displayValue = typeof value === 'string' ? value : value?.toFixed(2) || '---';
  const displayChange = typeof change === 'number' ? change.toFixed(2) : '0.00';
  const displayPercent = typeof changePercent === 'number' ? changePercent.toFixed(2) : '0.00';
  
  return (
    <div 
      className="rounded-xl p-4 border"
      style={{ 
        backgroundColor: sigmatiqTheme.colors.background.secondary,
        borderColor: sigmatiqTheme.colors.border.default 
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.muted }}>
          {name}
        </span>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" style={{ color: sigmatiqTheme.colors.status.success }} />
        ) : (
          <TrendingDown className="w-4 h-4" style={{ color: sigmatiqTheme.colors.status.error }} />
        )}
      </div>
      <div className="text-xl font-bold" style={{ color: sigmatiqTheme.colors.text.primary }}>
        ${displayValue}
      </div>
      <div className="text-sm" style={{ 
        color: isPositive ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error 
      }}>
        {isPositive ? '+' : ''}{displayChange} ({isPositive ? '+' : ''}{displayPercent}%)
      </div>
    </div>
  );
};

const AIInsightCard = ({ title, icon: Icon, content, actionLabel, onAction }: any) => (
  <div 
    className="rounded-xl p-4 border"
    style={{ 
      backgroundColor: sigmatiqTheme.colors.background.secondary,
      borderColor: sigmatiqTheme.colors.border.default 
    }}
  >
    <div className="flex items-start gap-3">
      <div 
        className="p-2 rounded-lg"
        style={{ 
          backgroundColor: sigmatiqTheme.colors.primary.teal + '20',
          color: sigmatiqTheme.colors.primary.teal
        }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-base mb-2" style={{ color: sigmatiqTheme.colors.text.primary }}>
          {title}
        </h4>
        <div className="text-sm leading-relaxed mb-3" style={{ color: sigmatiqTheme.colors.text.secondary }}>
          {content}
        </div>
        <button 
          onClick={onAction}
          className="text-sm font-medium hover:opacity-80"
          style={{ color: sigmatiqTheme.colors.primary.teal }}
        >
          {actionLabel} →
        </button>
      </div>
    </div>
  </div>
);

const ScreenerCard = ({ name, description, count, icon: Icon, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full text-left p-3 rounded-lg border transition-all hover:scale-[1.02]"
    style={{ 
      backgroundColor: sigmatiqTheme.colors.background.primary,
      borderColor: sigmatiqTheme.colors.border.default
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = sigmatiqTheme.colors.primary.teal;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = sigmatiqTheme.colors.border.default;
    }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" style={{ color: sigmatiqTheme.colors.text.muted }} />
        <div>
          <div className="font-medium text-base" style={{ color: sigmatiqTheme.colors.text.primary }}>
            {name}
          </div>
          <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
            {description}
          </div>
        </div>
      </div>
      <div 
        className="px-2 py-1 rounded text-sm font-medium"
        style={{ 
          backgroundColor: sigmatiqTheme.colors.primary.teal + '20',
          color: sigmatiqTheme.colors.primary.teal
        }}
      >
        {count}
      </div>
    </div>
  </button>
);

const MoverItem = ({ symbol, price, change, changePercent, volume, isGainer }: any) => (
  <div className="flex justify-between items-center py-1">
    <ClickableEntity type="symbol" value={symbol}>
      ${symbol}
    </ClickableEntity>
    <div className="text-right">
      {price && (
        <div className="text-base font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
          ${typeof price === 'number' ? price.toFixed(2) : price}
        </div>
      )}
      <div className="text-sm" style={{ 
        color: isGainer ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error 
      }}>
        {isGainer ? '+' : ''}{typeof changePercent === 'number' ? changePercent.toFixed(2) : changePercent}%
      </div>
    </div>
  </div>
);

const RecentItem = ({ symbol, time, type }: any) => (
  <div className="flex justify-between items-center py-1">
    <div className="flex items-center gap-2">
      <ClickableEntity type="symbol" value={symbol}>
        ${symbol}
      </ClickableEntity>
      <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
        {type}
      </span>
    </div>
    <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
      {time}
    </span>
  </div>
);

const ToolCard = ({ icon: Icon, title, description, onClick }: any) => (
  <button
    onClick={onClick}
    className="p-4 rounded-xl border transition-all hover:scale-105"
    style={{ 
      backgroundColor: sigmatiqTheme.colors.background.secondary,
      borderColor: sigmatiqTheme.colors.border.default
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = sigmatiqTheme.colors.primary.teal;
      e.currentTarget.style.boxShadow = `0 0 20px ${sigmatiqTheme.colors.primary.teal}20`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = sigmatiqTheme.colors.border.default;
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <Icon className="w-6 h-6 mb-2" style={{ color: sigmatiqTheme.colors.primary.teal }} />
    <div className="text-base font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
      {title}
    </div>
    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
      {description}
    </div>
  </button>
);

export default Dashboard;
