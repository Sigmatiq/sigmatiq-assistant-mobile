import React from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Target,
  Calendar,
  Bell,
  Activity,
  DollarSign,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  Plus,
  Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import useAppStore from '../../stores/useAppStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import ClickableEntity from '../../components/ClickableEntity';
import { api } from '../../api/client';

const SwingTradingDashboard: React.FC = () => {
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

  // Fetch watchlist data with swing metrics (3-5 day performance)
  const { data: watchlistData, isLoading: watchlistLoading } = useQuery({
    queryKey: ['watchlist', 'swing', watchlist],
    queryFn: async () => {
      const data = await api.market.getMarketSummary(watchlist);
      return data;
    },
    refetchInterval: 300000, // 5 minutes for swing trading
    staleTime: 240000,
  });

  // Fetch swing opportunities
  const { data: opportunitiesData, isLoading: oppsLoading } = useQuery({
    queryKey: ['opportunities', 'swing'],
    queryFn: () => api.assistant.ask('swing trading setups with technical patterns', 'analysis'),
    refetchInterval: 600000, // 10 minutes
    staleTime: 480000,
  });

  // Fetch sector rotation data
  const { data: sectorData, isLoading: sectorLoading } = useQuery({
    queryKey: ['sectorRotation'],
    queryFn: () => api.assistant.ask('sector rotation analysis', 'analysis'),
    refetchInterval: 600000,
    staleTime: 300000,
  });

  // Fetch economic calendar
  const { data: calendarData, isLoading: calendarLoading } = useQuery({
    queryKey: ['economicCalendar'],
    queryFn: () => api.assistant.ask('upcoming economic events this week', 'analysis'),
    refetchInterval: 3600000, // 1 hour
    staleTime: 1800000,
  });

  // Fetch alerts
  const { data: alertsData, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts', 'swing'],
    queryFn: () => api.assistant.ask('swing trading alerts and breakouts', 'analysis'),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Fetch focus symbol details
  const { data: focusData, isLoading: focusLoading } = useQuery({
    queryKey: ['focusSymbol', selectedSymbol || watchlist[0]],
    queryFn: () => api.market.getQuote(selectedSymbol || watchlist[0]),
    enabled: !!(selectedSymbol || watchlist[0]),
    refetchInterval: 300000,
    staleTime: 120000,
  });

  const focusSymbol = selectedSymbol || watchlist[0] || 'SPY';

  return (
    <div className="space-y-4">
      {/* Dashboard Grid */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Watchlist Card */}
          <div className="rounded-xl p-4 border" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Watchlist
              </h3>
              <Plus 
                className="w-4 h-4 cursor-pointer" 
                style={{ color: sigmatiqTheme.colors.primary.teal }}
                onClick={() => {
                  setActiveHelper('search');
                  setHelperContext({ action: 'add_to_watchlist' });
                }}
              />
            </div>
            {watchlistLoading ? (
              <LoadingIndicator size="sm" />
            ) : watchlistData ? (
              <div className="space-y-2">
                {watchlistData.slice(0, 5).map((item: any) => (
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
                      {item.pattern && (
                        <ClickableEntity
                          type="pattern"
                          value={item.pattern}
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: `${sigmatiqTheme.colors.primary.teal}20`,
                            color: sigmatiqTheme.colors.primary.teal 
                          }}
                        />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium" style={{ 
                        color: item.changePercent > 0 ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error 
                      }}>
                        {item.changePercent > 0 ? '+' : ''}{item.changePercent?.toFixed(2)}%
                      </div>
                      <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                        5D: {item.change5d > 0 ? '+' : ''}{item.change5d?.toFixed(2)}%
                      </div>
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

          {/* 2. Top Opportunities Card */}
          <div className="rounded-xl p-4 border md:col-span-2" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Top Swing Opportunities
              </h3>
              <Target className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.coral }} />
            </div>
            {oppsLoading ? (
              <LoadingIndicator size="sm" />
            ) : opportunitiesData?.opportunities ? (
              <div className="space-y-2">
                {opportunitiesData.opportunities.slice(0, 3).map((opp: any) => (
                  <div key={opp.symbol} className="p-3 rounded-lg border transition-all hover:translate-x-1 cursor-pointer"
                       style={{ 
                         backgroundColor: sigmatiqTheme.colors.background.secondary,
                         borderColor: sigmatiqTheme.colors.border.default 
                       }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ClickableEntity
                            type="ticker"
                            value={opp.symbol}
                            className="font-semibold"
                            style={{ color: sigmatiqTheme.colors.text.primary }}
                          />
                          <ClickableEntity
                            type="pattern"
                            value={opp.setup || opp.pattern}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${sigmatiqTheme.colors.primary.teal}20`,
                              color: sigmatiqTheme.colors.primary.teal 
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-4 text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          <span>Entry: ${opp.entry?.toFixed(2)}</span>
                          <span>Stop: ${opp.stop?.toFixed(2)}</span>
                          <span>Target: ${opp.target?.toFixed(2)}</span>
                          {experience !== 'novice' && opp.entry && opp.stop && opp.target && (
                            <span>R:R = 1:{((opp.target - opp.entry) / (opp.entry - opp.stop)).toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: sigmatiqTheme.colors.primary.teal }}>
                          {opp.score || 75}
                        </div>
                        <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          {opp.reliability || 85}% reliable
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No opportunities found
              </div>
            )}
          </div>

          {/* 3. Focus Symbol Card */}
          <div className="rounded-xl p-4 border" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Focus: <ClickableEntity type="ticker" value={focusSymbol} />
              </h3>
              <Eye className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.teal }} />
            </div>
            {focusLoading ? (
              <LoadingIndicator size="sm" />
            ) : focusData ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    Trend Analysis
                  </div>
                  <div className="flex items-center justify-between">
                    <ClickableEntity
                      type="indicator"
                      value="Primary Trend"
                      className="text-sm"
                      style={{ color: sigmatiqTheme.colors.text.primary }}
                    />
                    <span className="text-sm font-medium flex items-center gap-1" style={{ 
                      color: focusData.trend === 'bullish' ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error 
                    }}>
                      {focusData.trend === 'bullish' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {focusData.trend || 'Neutral'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    Key Levels
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <ClickableEntity
                        type="indicator"
                        value="Resistance"
                        style={{ color: sigmatiqTheme.colors.text.secondary }}
                      />
                      <span style={{ color: sigmatiqTheme.colors.text.primary }}>
                        ${focusData.resistance?.toFixed(2) || '---'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <ClickableEntity
                        type="indicator"
                        value="Support"
                        style={{ color: sigmatiqTheme.colors.text.secondary }}
                      />
                      <span style={{ color: sigmatiqTheme.colors.text.primary }}>
                        ${focusData.support?.toFixed(2) || '---'}
                      </span>
                    </div>
                  </div>
                </div>

                {experience !== 'novice' && (
                  <div>
                    <div className="text-xs uppercase tracking-wider mb-1" style={{ color: sigmatiqTheme.colors.text.muted }}>
                      Position Metrics
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <ClickableEntity
                          type="indicator"
                          value="ATR%"
                          style={{ color: sigmatiqTheme.colors.text.secondary }}
                        />
                        <span style={{ color: sigmatiqTheme.colors.text.primary }}>
                          {focusData.atrPercent?.toFixed(1) || '---'}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: sigmatiqTheme.colors.text.secondary }}>5D Return</span>
                        <span style={{ 
                          color: focusData.change5d > 0 ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error 
                        }}>
                          {focusData.change5d > 0 ? '+' : ''}{focusData.change5d?.toFixed(2) || '---'}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No data available
              </div>
            )}
          </div>

          {/* 4. Market Pulse (Sector Rotation) Card */}
          <div className="rounded-xl p-4 border" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Market Pulse
              </h3>
              <Layers className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.coral }} />
            </div>
            {sectorLoading ? (
              <LoadingIndicator size="sm" />
            ) : sectorData?.sectors ? (
              <div className="space-y-2">
                {sectorData.sectors.slice(0, 4).map((sector: any) => (
                  <div key={sector.name} className="flex items-center justify-between p-2 rounded-lg"
                       style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center`}
                           style={{ 
                             backgroundColor: sector.changePercent > 0.5 
                               ? `${sigmatiqTheme.colors.status.success}20`
                               : sector.changePercent < -0.5
                               ? `${sigmatiqTheme.colors.status.error}20`
                               : `${sigmatiqTheme.colors.text.muted}20`
                           }}>
                        {sector.changePercent > 0.5 ? (
                          <TrendingUp className="w-3 h-3" style={{ color: sigmatiqTheme.colors.status.success }} />
                        ) : sector.changePercent < -0.5 ? (
                          <TrendingDown className="w-3 h-3" style={{ color: sigmatiqTheme.colors.status.error }} />
                        ) : (
                          <Activity className="w-3 h-3" style={{ color: sigmatiqTheme.colors.text.muted }} />
                        )}
                      </div>
                      <ClickableEntity
                        type="sector"
                        value={sector.name}
                        className="text-sm"
                        style={{ color: sigmatiqTheme.colors.text.primary }}
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium" style={{ 
                        color: sector.changePercent > 0 
                          ? sigmatiqTheme.colors.status.success 
                          : sector.changePercent < 0 
                          ? sigmatiqTheme.colors.status.error
                          : sigmatiqTheme.colors.text.muted 
                      }}>
                        {sector.changePercent > 0 ? '+' : ''}{sector.changePercent?.toFixed(2)}%
                      </div>
                      {experience !== 'novice' && sector.flow && (
                        <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          {sector.flow}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No sector data available
              </div>
            )}
          </div>

          {/* 5. Events Calendar Card */}
          <div className="rounded-xl p-4 border" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Upcoming Events
              </h3>
              <Calendar className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.teal }} />
            </div>
            {calendarLoading ? (
              <LoadingIndicator size="sm" />
            ) : calendarData?.events ? (
              <div className="space-y-2">
                {calendarData.events.slice(0, 4).map((event: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg"
                       style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" style={{ color: sigmatiqTheme.colors.text.muted }} />
                      <div>
                        <ClickableEntity
                          type="event"
                          value={event.title}
                          className="text-sm"
                          style={{ color: sigmatiqTheme.colors.text.primary }}
                        />
                        <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          {event.date}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full`}
                          style={{ 
                            backgroundColor: event.impact === 'high' 
                              ? `${sigmatiqTheme.colors.status.error}20`
                              : `${sigmatiqTheme.colors.status.warning}20`,
                            color: event.impact === 'high'
                              ? sigmatiqTheme.colors.status.error
                              : sigmatiqTheme.colors.status.warning
                          }}>
                      {event.impact}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No upcoming events
              </div>
            )}
          </div>

          {/* 6. Alerts Inbox Card */}
          <div className="rounded-xl p-4 border lg:col-span-2" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Alerts Inbox
              </h3>
              <div className="flex items-center gap-2">
                {alertsData?.alerts && alertsData.alerts.filter((a: any) => !a.read).length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full" 
                        style={{ 
                          backgroundColor: `${sigmatiqTheme.colors.primary.coral}20`,
                          color: sigmatiqTheme.colors.primary.coral 
                        }}>
                    {alertsData.alerts.filter((a: any) => !a.read).length} new
                  </span>
                )}
                <Bell className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.coral }} />
              </div>
            </div>
            {alertsLoading ? (
              <LoadingIndicator size="sm" />
            ) : alertsData?.alerts && alertsData.alerts.length > 0 ? (
              <div className="space-y-2">
                {alertsData.alerts.slice(0, 3).map((alert: any) => (
                  <div key={alert.id} className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-opacity-70 transition-colors"
                       style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
                       onClick={() => {
                         setActiveHelper('analysis');
                         setHelperContext({ 
                           type: 'alert',
                           symbol: alert.symbol,
                           message: alert.message 
                         });
                       }}>
                    {alert.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 mt-0.5" style={{ color: sigmatiqTheme.colors.status.warning }} />
                    ) : alert.type === 'success' ? (
                      <TrendingUp className="w-4 h-4 mt-0.5" style={{ color: sigmatiqTheme.colors.status.success }} />
                    ) : (
                      <Bell className="w-4 h-4 mt-0.5" style={{ color: sigmatiqTheme.colors.primary.coral }} />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                        {alert.symbol && (
                          <ClickableEntity
                            type="ticker"
                            value={alert.symbol}
                            className="font-medium mr-1"
                          />
                        )}
                        {alert.title}
                      </div>
                      <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                        {alert.message} • {alert.time}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: sigmatiqTheme.colors.text.muted }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No alerts
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SwingTradingDashboard;