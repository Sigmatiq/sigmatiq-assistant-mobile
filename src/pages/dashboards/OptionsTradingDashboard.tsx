import React from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Calendar,
  Shield,
  DollarSign,
  AlertCircle,
  Target,
  Clock,
  ChevronRight,
  Plus,
  Eye,
  Zap,
  PieChart
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import useAppStore from '../../stores/useAppStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import ClickableEntity from '../../components/ClickableEntity';
import { api } from '../../api/client';

const OptionsTradingDashboard: React.FC = () => {
  const { 
    experience, 
    watchlist, 
    marketStatus,
    selectedSymbol,
    setSelectedSymbol,
    setActiveHelper,
    setHelperContext
  } = useAppStore();

  const marketStatusColor = marketStatus === 'open' 
    ? sigmatiqTheme.colors.status.success 
    : sigmatiqTheme.colors.text.muted;

  // Fetch watchlist with IV data
  const { data: watchlistData, isLoading: watchlistLoading } = useQuery({
    queryKey: ['watchlist', 'options', watchlist],
    queryFn: async () => {
      const data = await api.market.getMarketSummary(watchlist);
      // Transform to array and add mock IV data
      return Object.values(data || {}).map((item: any) => ({
        ...item,
        iv: Math.random() * 40 + 20,
        ivRank: Math.random() * 100,
        ivPercentile: Math.random() * 100
      }));
    },
    refetchInterval: marketStatus === 'open' ? 120000 : false,
    staleTime: 60000,
  });

  // Fetch strategy ideas
  const { data: strategyData, isLoading: strategyLoading } = useQuery({
    queryKey: ['optionStrategies'],
    queryFn: () => api.assistant.ask('options trading strategies for current market conditions', 'analysis'),
    refetchInterval: 600000,
    staleTime: 300000,
  });

  // Fetch unusual options activity
  const { data: flowData, isLoading: flowLoading } = useQuery({
    queryKey: ['optionsFlow'],
    queryFn: api.options.getUnusualOptions,
    refetchInterval: 300000,
    staleTime: 150000,
  });

  // Fetch Greeks exposure
  const { data: greeksData, isLoading: greeksLoading } = useQuery({
    queryKey: ['greeksExposure'],
    queryFn: () => api.assistant.ask('SPY gamma exposure and put call ratio', 'analysis'),
    refetchInterval: 300000,
    staleTime: 150000,
  });

  // Fetch earnings calendar with IV crush opportunities
  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ['earningsCalendar'],
    queryFn: () => api.assistant.ask('upcoming earnings with high IV', 'analysis'),
    refetchInterval: 3600000,
    staleTime: 1800000,
  });

  // Fetch portfolio Greeks (mock for now)
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolioGreeks'],
    queryFn: async () => {
      // Return mock portfolio data for demo
      return {
        positions: [],
        totalDelta: 0,
        totalGamma: 0,
        totalTheta: 0,
        totalVega: 0
      };
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  return (
    <div className="space-y-4">
      {/* Dashboard Grid */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Watchlist with IV Card */}
          <div className="rounded-xl p-4 border" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Watchlist + IV
              </h3>
              <Plus 
                className="w-4 h-4 cursor-pointer" 
                style={{ color: sigmatiqTheme.colors.primary.teal }}
                onClick={() => {
                  setActiveHelper('search');
                  setHelperContext({ action: 'add_to_watchlist', type: 'options' });
                }}
              />
            </div>
            {watchlistLoading ? (
              <LoadingIndicator size="sm" />
            ) : watchlistData ? (
              <div className="space-y-2">
                {watchlistData.slice(0, 4).map((item: any) => (
                  <div key={item.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-opacity-50 transition-colors cursor-pointer"
                       style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
                       onClick={() => setSelectedSymbol(item.symbol)}>
                    <div className="flex items-center gap-2">
                      <ClickableEntity
                        type="ticker"
                        value={item.symbol}
                        className="font-medium"
                        style={{ color: sigmatiqTheme.colors.text.primary }}
                      />
                      {item.ivRank > 70 && (
                        <Zap className="w-3 h-3" style={{ color: sigmatiqTheme.colors.status.warning }} />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <ClickableEntity
                          type="indicator"
                          value="IV"
                          className="text-xs"
                          style={{ color: sigmatiqTheme.colors.text.muted }}
                        />
                        <span style={{ 
                          color: item.iv > 40 ? sigmatiqTheme.colors.status.warning : sigmatiqTheme.colors.text.primary 
                        }}>
                          {item.iv?.toFixed(1)}%
                        </span>
                      </div>
                      {experience !== 'novice' && (
                        <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          IVR: {item.ivRank}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No watchlist data available
              </div>
            )}
          </div>

          {/* 2. Strategy Ideas Card */}
          <div className="rounded-xl p-4 border md:col-span-2" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Strategy Ideas
              </h3>
              <Target className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.coral }} />
            </div>
            {strategyLoading ? (
              <LoadingIndicator size="sm" />
            ) : strategyData?.strategies ? (
              <div className="space-y-2">
                {strategyData.strategies.slice(0, 3).map((strategy: any) => (
                  <div key={`${strategy.symbol}-${strategy.strategy}`} 
                       className="p-3 rounded-lg border transition-all hover:translate-x-1 cursor-pointer"
                       style={{ 
                         backgroundColor: sigmatiqTheme.colors.background.secondary,
                         borderColor: sigmatiqTheme.colors.border.default 
                       }}
                       onClick={() => {
                         setActiveHelper('analysis');
                         setHelperContext({ 
                           type: 'options_strategy',
                           symbol: strategy.symbol,
                           strategy: strategy.strategy
                         });
                       }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ClickableEntity
                            type="ticker"
                            value={strategy.symbol}
                            className="font-semibold"
                            style={{ color: sigmatiqTheme.colors.text.primary }}
                          />
                          <ClickableEntity
                            type="strategy"
                            value={strategy.strategy}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${sigmatiqTheme.colors.primary.teal}20`,
                              color: sigmatiqTheme.colors.primary.teal 
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          <span>Strikes: {strategy.strikes}</span>
                          <span>{strategy.expiry}</span>
                          {strategy.credit && <span>Credit: ${strategy.credit.toFixed(2)}</span>}
                          {experience !== 'novice' && strategy.maxLoss && (
                            <span>Max Loss: ${strategy.maxLoss.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: sigmatiqTheme.colors.primary.teal }}>
                          {strategy.probability || 65}%
                        </div>
                        <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          Win Rate
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No strategy ideas available
              </div>
            )}
          </div>

          {/* 3. Unusual Options Activity Card */}
          <div className="rounded-xl p-4 border" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Options Flow
              </h3>
              <Activity className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.coral }} />
            </div>
            {flowLoading ? (
              <LoadingIndicator size="sm" />
            ) : flowData?.flows ? (
              <div className="space-y-2">
                {flowData.flows.slice(0, 4).map((flow: any, idx: number) => (
                  <div key={idx} className="p-2 rounded-lg cursor-pointer hover:bg-opacity-70 transition-colors"
                       style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
                       onClick={() => {
                         setActiveHelper('analysis');
                         setHelperContext({ 
                           type: 'options_flow',
                           symbol: flow.symbol,
                           strike: flow.strike,
                           expiry: flow.expiry
                         });
                       }}>
                    <div className="flex items-center justify-between mb-1">
                      <ClickableEntity
                        type="ticker"
                        value={flow.symbol}
                        className="font-medium"
                        style={{ color: sigmatiqTheme.colors.text.primary }}
                      />
                      <span className={`text-xs px-1.5 py-0.5 rounded`}
                            style={{ 
                              backgroundColor: flow.type === 'CALL' 
                                ? `${sigmatiqTheme.colors.status.success}20`
                                : `${sigmatiqTheme.colors.status.error}20`,
                              color: flow.type === 'CALL'
                                ? sigmatiqTheme.colors.status.success
                                : sigmatiqTheme.colors.status.error
                            }}>
                        {flow.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: sigmatiqTheme.colors.text.muted }}>
                        ${flow.strike} {flow.expiry}
                      </span>
                      <span style={{ color: sigmatiqTheme.colors.text.primary }}>
                        ${(flow.premium / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No unusual activity
              </div>
            )}
          </div>

          {/* 4. Greeks Exposure Card */}
          <div className="rounded-xl p-4 border" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Market Greeks
              </h3>
              <Shield className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.teal }} />
            </div>
            {greeksLoading ? (
              <LoadingIndicator size="sm" />
            ) : greeksData ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <ClickableEntity
                      type="indicator"
                      value="Gamma Exposure"
                      className="text-sm"
                      style={{ color: sigmatiqTheme.colors.text.secondary }}
                    />
                    <span className="text-sm font-medium" style={{ 
                      color: greeksData.gammaExposure > 0 
                        ? sigmatiqTheme.colors.status.success 
                        : sigmatiqTheme.colors.status.error 
                    }}>
                      {greeksData.gammaExposure > 0 ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    ${Math.abs(greeksData.gammaExposure / 1000000).toFixed(1)}M exposure
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <ClickableEntity
                      type="indicator"
                      value="Put/Call Ratio"
                      className="text-sm"
                      style={{ color: sigmatiqTheme.colors.text.secondary }}
                    />
                    <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                      {greeksData.putCallRatio?.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs" style={{ 
                    color: greeksData.putCallRatio > 1.2 
                      ? sigmatiqTheme.colors.status.error 
                      : greeksData.putCallRatio < 0.8
                      ? sigmatiqTheme.colors.status.success
                      : sigmatiqTheme.colors.text.muted 
                  }}>
                    {greeksData.putCallRatio > 1.2 ? 'Bearish' : greeksData.putCallRatio < 0.8 ? 'Bullish' : 'Neutral'}
                  </div>
                </div>

                {experience !== 'novice' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <ClickableEntity
                        type="indicator"
                        value="Max Pain"
                        className="text-sm"
                        style={{ color: sigmatiqTheme.colors.text.secondary }}
                      />
                      <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                        ${greeksData.maxPain?.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                      SPY Pin Level
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No Greeks data available
              </div>
            )}
          </div>

          {/* 5. Earnings & Events Card */}
          <div className="rounded-xl p-4 border" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Earnings & Events
              </h3>
              <Calendar className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.teal }} />
            </div>
            {earningsLoading ? (
              <LoadingIndicator size="sm" />
            ) : earningsData?.events ? (
              <div className="space-y-2">
                {earningsData.events.slice(0, 4).map((event: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-opacity-70"
                       style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
                       onClick={() => {
                         setActiveHelper('analysis');
                         setHelperContext({ 
                           type: 'earnings_play',
                           symbol: event.symbol,
                           date: event.date
                         });
                       }}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" style={{ color: sigmatiqTheme.colors.text.muted }} />
                      <div>
                        <ClickableEntity
                          type="ticker"
                          value={event.symbol}
                          className="text-sm font-medium"
                          style={{ color: sigmatiqTheme.colors.text.primary }}
                        />
                        <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          {event.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm" style={{ 
                        color: event.ivCrush > 30 
                          ? sigmatiqTheme.colors.status.warning 
                          : sigmatiqTheme.colors.text.primary 
                      }}>
                        {event.ivCrush}% IV
                      </div>
                      {experience !== 'novice' && (
                        <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          {event.expectedMove}% move
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No upcoming earnings
              </div>
            )}
          </div>

          {/* 6. Portfolio Greeks Card */}
          <div className="rounded-xl p-4 border lg:col-span-2" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Portfolio Greeks
              </h3>
              <PieChart className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.coral }} />
            </div>
            {portfolioLoading ? (
              <LoadingIndicator size="sm" />
            ) : portfolioData?.positions && portfolioData.positions.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
                    <ClickableEntity
                      type="indicator"
                      value="Delta"
                      className="text-xs uppercase tracking-wider"
                      style={{ color: sigmatiqTheme.colors.text.muted }}
                    />
                    <div className="text-lg font-semibold mt-1" style={{ 
                      color: portfolioData.totalDelta > 0 
                        ? sigmatiqTheme.colors.status.success 
                        : portfolioData.totalDelta < 0
                        ? sigmatiqTheme.colors.status.error
                        : sigmatiqTheme.colors.text.primary 
                    }}>
                      {portfolioData.totalDelta > 0 ? '+' : ''}{portfolioData.totalDelta?.toFixed(0)}
                    </div>
                  </div>
                  
                  <div className="p-2 rounded-lg" style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
                    <ClickableEntity
                      type="indicator"
                      value="Gamma"
                      className="text-xs uppercase tracking-wider"
                      style={{ color: sigmatiqTheme.colors.text.muted }}
                    />
                    <div className="text-lg font-semibold mt-1" style={{ color: sigmatiqTheme.colors.text.primary }}>
                      {portfolioData.totalGamma?.toFixed(0)}
                    </div>
                  </div>
                  
                  <div className="p-2 rounded-lg" style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
                    <ClickableEntity
                      type="indicator"
                      value="Theta"
                      className="text-xs uppercase tracking-wider"
                      style={{ color: sigmatiqTheme.colors.text.muted }}
                    />
                    <div className="text-lg font-semibold mt-1" style={{ 
                      color: portfolioData.totalTheta < 0 
                        ? sigmatiqTheme.colors.status.error 
                        : sigmatiqTheme.colors.status.success 
                    }}>
                      ${portfolioData.totalTheta?.toFixed(0)}
                    </div>
                  </div>
                  
                  <div className="p-2 rounded-lg" style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
                    <ClickableEntity
                      type="indicator"
                      value="Vega"
                      className="text-xs uppercase tracking-wider"
                      style={{ color: sigmatiqTheme.colors.text.muted }}
                    />
                    <div className="text-lg font-semibold mt-1" style={{ color: sigmatiqTheme.colors.text.primary }}>
                      ${portfolioData.totalVega?.toFixed(0)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {portfolioData.positions.slice(0, 2).map((pos: any) => (
                    <div key={pos.id} className="flex items-center justify-between p-2 rounded-lg text-sm"
                         style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
                      <div className="flex items-center gap-2">
                        <ClickableEntity
                          type="ticker"
                          value={pos.symbol}
                          className="font-medium"
                        />
                        <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          {pos.strike} {pos.type} {pos.expiry}
                        </span>
                      </div>
                      <span style={{ 
                        color: pos.pnl > 0 
                          ? sigmatiqTheme.colors.status.success 
                          : sigmatiqTheme.colors.status.error 
                      }}>
                        {pos.pnl > 0 ? '+' : ''}${pos.pnl?.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No options positions
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default OptionsTradingDashboard;