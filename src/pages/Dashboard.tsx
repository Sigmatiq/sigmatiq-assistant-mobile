import React, { useEffect, useState } from 'react';
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
import WatchlistCard from '../components/WatchlistCard';

const Dashboard = () => {
  const { 
    watchlist, 
    marketStatus, 
    setActiveView, 
    setSelectedSymbol, 
    setMarketStatus,
    setActiveHelper,
    setHelperContext
  } = useAppStore();
  
  // Calculate market status and time remaining
  const calculateMarketStatus = () => {
    const now = new Date();
    const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const hours = easternTime.getHours();
    const minutes = easternTime.getMinutes();
    const day = easternTime.getDay();
    
    // Market hours in minutes from midnight
    const preMarketStart = 4 * 60; // 4:00 AM ET
    const marketOpen = 9 * 60 + 30; // 9:30 AM ET
    const marketClose = 16 * 60; // 4:00 PM ET
    const afterHoursEnd = 20 * 60; // 8:00 PM ET
    const currentMinutes = hours * 60 + minutes;
    
    // Helper to calculate time until next market open
    const getTimeUntilOpen = () => {
      let minutesUntilOpen;
      if (day === 5 && currentMinutes >= afterHoursEnd) {
        // Friday after 8pm - market opens Monday
        minutesUntilOpen = (7 - day) * 24 * 60 + (24 - hours) * 60 - minutes + marketOpen;
      } else if (day === 6) {
        // Saturday - market opens Monday
        minutesUntilOpen = (7 - day) * 24 * 60 + (24 - hours) * 60 - minutes + marketOpen;
      } else if (day === 0) {
        // Sunday - market opens Monday
        minutesUntilOpen = (24 - hours) * 60 - minutes + marketOpen;
      } else if (currentMinutes >= afterHoursEnd) {
        // Weekday after 8pm - market opens tomorrow
        minutesUntilOpen = (24 - hours) * 60 - minutes + marketOpen;
      } else {
        // Same day
        minutesUntilOpen = marketOpen - currentMinutes;
      }
      
      const hoursUntilOpen = Math.floor(minutesUntilOpen / 60);
      const minsUntilOpen = minutesUntilOpen % 60;
      return `Opens in ${hoursUntilOpen}h ${minsUntilOpen}m`;
    };
    
    // Weekend
    if (day === 0 || day === 6) {
      return { status: 'closed', timeRemaining: getTimeUntilOpen() };
    }
    
    // Weekday schedule
    if (currentMinutes < preMarketStart) {
      // Closed (midnight to 4am)
      return { status: 'closed', timeRemaining: getTimeUntilOpen() };
    } else if (currentMinutes >= preMarketStart && currentMinutes < marketOpen) {
      // Pre-market (4am to 9:30am)
      const minutesUntilOpen = marketOpen - currentMinutes;
      const hoursUntilOpen = Math.floor(minutesUntilOpen / 60);
      const minsUntilOpen = minutesUntilOpen % 60;
      return { 
        status: 'pre-market', 
        timeRemaining: `Opens in ${hoursUntilOpen}h ${minsUntilOpen}m` 
      };
    } else if (currentMinutes >= marketOpen && currentMinutes < marketClose) {
      // Market open (9:30am to 4pm)
      const minutesUntilClose = marketClose - currentMinutes;
      const hoursUntilClose = Math.floor(minutesUntilClose / 60);
      const minsUntilClose = minutesUntilClose % 60;
      return { 
        status: 'open', 
        timeRemaining: `Closes in ${hoursUntilClose}h ${minsUntilClose}m` 
      };
    } else if (currentMinutes >= marketClose && currentMinutes < afterHoursEnd) {
      // After-hours (4pm to 8pm)
      const minutesUntilEnd = afterHoursEnd - currentMinutes;
      const hoursUntilEnd = Math.floor(minutesUntilEnd / 60);
      const minsUntilEnd = minutesUntilEnd % 60;
      return { 
        status: 'after-hours', 
        timeRemaining: `After-hours ends in ${hoursUntilEnd}h ${minsUntilEnd}m` 
      };
    } else {
      // Closed (8pm to midnight)
      return { status: 'closed', timeRemaining: getTimeUntilOpen() };
    }
  };
  
  const [marketInfo, setMarketInfo] = React.useState(calculateMarketStatus());
  
  // Update market status in store and local state
  React.useEffect(() => {
    const updateMarketStatus = () => {
      const info = calculateMarketStatus();
      setMarketInfo(info);
      // Update store with proper status
      if (info.status === 'open') {
        setMarketStatus('open');
      } else if (info.status === 'pre-market') {
        setMarketStatus('pre-market');
      } else if (info.status === 'after-hours') {
        setMarketStatus('after-hours');
      } else {
        setMarketStatus('closed');
      }
    };

    // Update immediately on mount
    updateMarketStatus();
    
    // Then update every minute
    const interval = setInterval(updateMarketStatus, 60000);
    
    return () => clearInterval(interval);
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

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Market Status Card */}
      <div className="max-w-sm">
        <div 
          className="rounded-xl p-4 border"
          style={{ 
            backgroundColor: sigmatiqTheme.colors.background.secondary,
            borderColor: sigmatiqTheme.colors.border.default 
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: sigmatiqTheme.colors.text.muted }}>
              MARKET STATUS
            </span>
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: marketInfo.status === 'open' 
                  ? sigmatiqTheme.colors.status.success 
                  : marketInfo.status === 'pre-market' || marketInfo.status === 'after-hours'
                  ? sigmatiqTheme.colors.status.warning
                  : sigmatiqTheme.colors.status.error 
              }}
            />
          </div>
          <div className="text-lg font-bold mb-1" style={{ color: sigmatiqTheme.colors.text.primary }}>
            {marketInfo.status === 'open' ? 'Markets Open' : 
             marketInfo.status === 'pre-market' ? 'Pre-Market' :
             marketInfo.status === 'after-hours' ? 'After Hours' : 'Markets Closed'}
          </div>
          <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
            {marketInfo.timeRemaining}
          </div>
        </div>
      </div>

      {/* Market Sentiment & Breadth */}
      <div className="grid grid-cols-1 gap-4">
        {/* Market Breadth */}
        <div 
          className="rounded-xl p-4 border"
          style={{ 
            backgroundColor: sigmatiqTheme.colors.background.secondary,
            borderColor: sigmatiqTheme.colors.border.default 
          }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: sigmatiqTheme.colors.text.primary }}>
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
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    52w Highs
                  </span>
                  <span className="text-xs font-semibold" style={{ color: sigmatiqTheme.colors.status.success }}>
                    {marketBreadth.highs52w}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    52w Lows
                  </span>
                  <span className="text-xs font-semibold" style={{ color: sigmatiqTheme.colors.status.error }}>
                    {marketBreadth.lows52w}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
                <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
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
                          <div className="font-semibold text-xs mb-1" style={{ color: sigmatiqTheme.colors.text.accent }}>
                            {opp.type}
                          </div>
                          <div className="text-xs mb-1" style={{ color: sigmatiqTheme.colors.text.primary }}>
                            {opp.description}
                          </div>
                          {opp.symbols && opp.symbols.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {opp.symbols.map((sym: string) => (
                                <span 
                                  key={sym}
                                  className="px-2 py-1 rounded text-xs font-medium cursor-pointer hover:opacity-80"
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
              <h3 className="text-sm font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Quick Screeners
              </h3>
              <button 
                onClick={() => setActiveView('screener')}
                className="text-xs flex items-center gap-1 hover:opacity-80"
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
            <h3 className="text-sm font-semibold mb-3" style={{ color: sigmatiqTheme.colors.text.primary }}>
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
              <h3 className="text-sm font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
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
                  <div className="text-xs text-center py-2" style={{ color: sigmatiqTheme.colors.text.muted }}>
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
              <h3 className="text-sm font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
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
                  <div className="text-xs text-center py-2" style={{ color: sigmatiqTheme.colors.text.muted }}>
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
        <span className="text-xs font-medium" style={{ color: sigmatiqTheme.colors.text.muted }}>
          {name}
        </span>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" style={{ color: sigmatiqTheme.colors.status.success }} />
        ) : (
          <TrendingDown className="w-4 h-4" style={{ color: sigmatiqTheme.colors.status.error }} />
        )}
      </div>
      <div className="text-lg font-bold" style={{ color: sigmatiqTheme.colors.text.primary }}>
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
        <h4 className="font-medium text-sm mb-2" style={{ color: sigmatiqTheme.colors.text.primary }}>
          {title}
        </h4>
        <div className="text-xs leading-relaxed mb-3" style={{ color: sigmatiqTheme.colors.text.secondary }}>
          {content}
        </div>
        <button 
          onClick={onAction}
          className="text-xs font-medium hover:opacity-80"
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
          <div className="font-medium text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>
            {name}
          </div>
          <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
            {description}
          </div>
        </div>
      </div>
      <div 
        className="px-2 py-1 rounded text-xs font-medium"
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
        <div className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
          ${typeof price === 'number' ? price.toFixed(2) : price}
        </div>
      )}
      <div className="text-xs" style={{ 
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
      <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
        {type}
      </span>
    </div>
    <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
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
    <div className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
      {title}
    </div>
    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
      {description}
    </div>
  </button>
);

export default Dashboard;