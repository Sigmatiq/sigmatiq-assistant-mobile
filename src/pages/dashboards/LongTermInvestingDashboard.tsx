import React from 'react';
import { 
  PiggyBank,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  BarChart3,
  DollarSign,
  Building2,
  Newspaper,
  ChevronRight,
  Plus,
  Eye,
  PieChart,
  BookOpen,
  Star
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import useAppStore from '../../stores/useAppStore';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessage from '../../components/ErrorMessage';
import ClickableEntity from '../../components/ClickableEntity';
import { api } from '../../api/client';

const LongTermInvestingDashboard: React.FC = () => {
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

  // Fetch watchlist with fundamental data
  const { data: watchlistData, isLoading: watchlistLoading } = useQuery({
    queryKey: ['watchlist', 'fundamentals', watchlist],
    queryFn: async () => {
      const data = await api.market.getMarketSummary(watchlist);
      // Transform to array and add mock fundamental data
      return Object.values(data || {}).map((item: any) => ({
        ...item,
        pe: Math.random() * 30 + 10,
        dividendYield: Math.random() * 4,
        growth: Math.random() * 20 - 5,
        score: Math.floor(Math.random() * 30) + 70
      }));
    },
    refetchInterval: 3600000, // 1 hour for long-term
    staleTime: 1800000,
  });

  // Fetch value opportunities
  const { data: opportunitiesData, isLoading: oppsLoading } = useQuery({
    queryKey: ['opportunities', 'value'],
    queryFn: () => api.assistant.ask('undervalued stocks with strong fundamentals', 'analysis'),
    refetchInterval: 3600000,
    staleTime: 1800000,
  });

  // Fetch sector analysis
  const { data: sectorData, isLoading: sectorLoading } = useQuery({
    queryKey: ['sectorAnalysis', 'fundamental'],
    queryFn: () => api.assistant.ask('sector fundamental analysis with PE ratios', 'analysis'),
    refetchInterval: 3600000,
    staleTime: 1800000,
  });

  // Fetch dividend calendar
  const { data: dividendData, isLoading: dividendLoading } = useQuery({
    queryKey: ['dividendCalendar'],
    queryFn: () => api.assistant.ask('upcoming dividend payments this month', 'analysis'),
    refetchInterval: 86400000, // 24 hours
    staleTime: 43200000,
  });

  // Fetch portfolio analysis (mock for now)
  const { data: portfolioData, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolioAnalysis'],
    queryFn: async () => {
      // Return mock portfolio metrics
      return {
        diversificationScore: 75,
        avgPE: 22.5,
        totalYield: 2.1,
        beta: 1.05
      };
    },
    refetchInterval: 300000,
    staleTime: 150000,
  });

  // Fetch research reports
  const { data: researchData, isLoading: researchLoading } = useQuery({
    queryKey: ['researchReports'],
    queryFn: () => api.assistant.ask('latest investment research and analysis', 'analysis'),
    refetchInterval: 3600000,
    staleTime: 1800000,
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: sigmatiqTheme.colors.background.primary }}>
      {/* Dashboard Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Watchlist with Valuation Metrics Card */}
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
                  setHelperContext({ action: 'add_to_watchlist', type: 'fundamental' });
                }}
              />
            </div>
            {watchlistLoading ? (
              <LoadingIndicator size="sm" />
            ) : watchlistData ? (
              <div className="space-y-2">
                {watchlistData.slice(0, 4).map((item: any) => (
                  <div key={item.symbol} className="p-2 rounded-lg hover:bg-opacity-50 transition-colors cursor-pointer"
                       style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
                       onClick={() => setSelectedSymbol(item.symbol)}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <ClickableEntity
                          type="ticker"
                          value={item.symbol}
                          className="font-medium"
                          style={{ color: sigmatiqTheme.colors.text.primary }}
                        />
                        {item.score >= 85 && (
                          <Star className="w-3 h-3" style={{ color: sigmatiqTheme.colors.primary.coral }} />
                        )}
                      </div>
                      <span className={`text-sm font-medium`} style={{ 
                        color: item.changePercent > 0 ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error 
                      }}>
                        {item.changePercent > 0 ? '+' : ''}{item.changePercent?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <span style={{ color: sigmatiqTheme.colors.text.muted }}>
                          <ClickableEntity type="indicator" value="P/E" />: 
                          <span style={{ color: sigmatiqTheme.colors.text.primary }}> {item.pe?.toFixed(1)}</span>
                        </span>
                        {item.dividendYield > 0 && (
                          <span style={{ color: sigmatiqTheme.colors.text.muted }}>
                            <ClickableEntity type="indicator" value="Yield" />: 
                            <span style={{ color: sigmatiqTheme.colors.text.primary }}> {item.dividendYield?.toFixed(2)}%</span>
                          </span>
                        )}
                      </div>
                      {experience !== 'novice' && (
                        <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          Growth: {item.growth?.toFixed(1)}%
                        </span>
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

          {/* 2. Top Opportunities with Investment Thesis Card */}
          <div className="rounded-xl p-4 border md:col-span-2" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Top Long-term Opportunities
              </h3>
              <PiggyBank className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.coral }} />
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
                       }}
                       onClick={() => {
                         setActiveHelper('analysis');
                         setHelperContext({ 
                           type: 'fundamental_analysis',
                           symbol: opp.symbol
                         });
                       }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ClickableEntity
                            type="ticker"
                            value={opp.symbol}
                            className="font-semibold"
                            style={{ color: sigmatiqTheme.colors.text.primary }}
                          />
                          <span className={`text-xs px-2 py-0.5 rounded-full`}
                                style={{ 
                                  backgroundColor: opp.valuation === 'Undervalued' 
                                    ? `${sigmatiqTheme.colors.status.success}20`
                                    : opp.valuation === 'Fair' 
                                    ? `${sigmatiqTheme.colors.primary.teal}20`
                                    : `${sigmatiqTheme.colors.status.warning}20`,
                                  color: opp.valuation === 'Undervalued'
                                    ? sigmatiqTheme.colors.status.success
                                    : opp.valuation === 'Fair'
                                    ? sigmatiqTheme.colors.primary.teal
                                    : sigmatiqTheme.colors.status.warning
                                }}>
                            {opp.valuation || 'Fair'}
                          </span>
                        </div>
                        <div className="text-sm mb-1" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                          {opp.thesis}
                        </div>
                        <div className="flex items-center gap-3 text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          <span><ClickableEntity type="indicator" value="P/E" />: {opp.pe?.toFixed(1)}</span>
                          <span><ClickableEntity type="indicator" value="PEG" />: {opp.peg?.toFixed(2)}</span>
                          {experience !== 'novice' && (
                            <span>Target: {opp.targetReturn || '20-25%'}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: sigmatiqTheme.colors.primary.teal }}>
                          {opp.score || 85}
                        </div>
                        <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                          {opp.reliability || 90}% reliable
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

          {/* 3. Sector Analysis Card */}
          <div className="rounded-xl p-4 border" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Sector Analysis
              </h3>
              <BarChart3 className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.coral }} />
            </div>
            {sectorLoading ? (
              <LoadingIndicator size="sm" />
            ) : sectorData?.sectors ? (
              <div className="space-y-2">
                {sectorData.sectors.slice(0, 4).map((sector: any) => (
                  <div key={sector.name} className="p-2 rounded-lg cursor-pointer hover:bg-opacity-70"
                       style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
                       onClick={() => {
                         setActiveHelper('analysis');
                         setHelperContext({ 
                           type: 'sector_analysis',
                           sector: sector.name
                         });
                       }}>
                    <div className="flex items-center justify-between mb-1">
                      <ClickableEntity
                        type="sector"
                        value={sector.name}
                        className="text-sm font-medium"
                        style={{ color: sigmatiqTheme.colors.text.primary }}
                      />
                      <span className="text-sm" style={{ 
                        color: sector.ytdReturn > 0 
                          ? sigmatiqTheme.colors.status.success 
                          : sigmatiqTheme.colors.status.error 
                      }}>
                        {sector.ytdReturn > 0 ? '+' : ''}{sector.ytdReturn?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: sigmatiqTheme.colors.text.muted }}>
                        <ClickableEntity type="indicator" value="Avg P/E" />: {sector.avgPE?.toFixed(1)}
                      </span>
                      {experience !== 'novice' && (
                        <span style={{ color: sigmatiqTheme.colors.text.muted }}>
                          {sector.outlook || 'Neutral'}
                        </span>
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

          {/* 4. Dividend Calendar Card */}
          <div className="rounded-xl p-4 border" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Upcoming Dividends
              </h3>
              <DollarSign className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.teal }} />
            </div>
            {dividendLoading ? (
              <LoadingIndicator size="sm" />
            ) : dividendData?.dividends ? (
              <div className="space-y-2">
                {dividendData.dividends.slice(0, 3).map((div: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg"
                       style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
                    <div>
                      <ClickableEntity
                        type="ticker"
                        value={div.symbol}
                        className="text-sm font-medium"
                        style={{ color: sigmatiqTheme.colors.text.primary }}
                      />
                      <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                        Ex-Date: {div.exDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.status.success }}>
                        ${div.amount?.toFixed(2)}
                      </div>
                      <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                        {div.yield?.toFixed(2)}% yield
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No upcoming dividends
              </div>
            )}
          </div>

          {/* 5. Portfolio Analysis Card */}
          <div className="rounded-xl p-4 border" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Portfolio Health
              </h3>
              <PieChart className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.coral }} />
            </div>
            {portfolioLoading ? (
              <LoadingIndicator size="sm" />
            ) : portfolioData ? (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <ClickableEntity
                      type="indicator"
                      value="Diversification"
                      className="text-sm"
                      style={{ color: sigmatiqTheme.colors.text.secondary }}
                    />
                    <span className="text-sm font-medium" style={{ 
                      color: portfolioData.diversificationScore > 70 
                        ? sigmatiqTheme.colors.status.success 
                        : portfolioData.diversificationScore > 40
                        ? sigmatiqTheme.colors.status.warning
                        : sigmatiqTheme.colors.status.error 
                    }}>
                      {portfolioData.diversificationScore || 75}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" 
                         style={{ 
                           width: `${portfolioData.diversificationScore || 75}%`,
                           backgroundColor: portfolioData.diversificationScore > 70 
                             ? sigmatiqTheme.colors.status.success 
                             : portfolioData.diversificationScore > 40
                             ? sigmatiqTheme.colors.status.warning
                             : sigmatiqTheme.colors.status.error
                         }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <ClickableEntity
                      type="indicator"
                      value="Avg P/E"
                      style={{ color: sigmatiqTheme.colors.text.secondary }}
                    />
                    <span style={{ color: sigmatiqTheme.colors.text.primary }}>
                      {portfolioData.avgPE?.toFixed(1) || '22.5'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <ClickableEntity
                      type="indicator"
                      value="Total Yield"
                      style={{ color: sigmatiqTheme.colors.text.secondary }}
                    />
                    <span style={{ color: sigmatiqTheme.colors.text.primary }}>
                      {portfolioData.totalYield?.toFixed(2) || '2.1'}%
                    </span>
                  </div>
                  {experience !== 'novice' && (
                    <div className="flex justify-between text-sm">
                      <ClickableEntity
                        type="indicator"
                        value="Beta"
                        style={{ color: sigmatiqTheme.colors.text.secondary }}
                      />
                      <span style={{ color: sigmatiqTheme.colors.text.primary }}>
                        {portfolioData.beta?.toFixed(2) || '1.05'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No portfolio data
              </div>
            )}
          </div>

          {/* 6. Research & Learning Card */}
          <div className="rounded-xl p-4 border lg:col-span-2" style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default
          }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Research & Learning
              </h3>
              <BookOpen className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.teal }} />
            </div>
            {researchLoading ? (
              <LoadingIndicator size="sm" />
            ) : researchData?.reports ? (
              <div className="space-y-2">
                {researchData.reports.slice(0, 3).map((report: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-opacity-70 transition-colors"
                       style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
                       onClick={() => {
                         setActiveHelper('learning');
                         setHelperContext({ 
                           type: 'research_report',
                           id: report.id,
                           title: report.title
                         });
                       }}>
                    {report.type === 'analysis' ? (
                      <FileText className="w-4 h-4 mt-0.5" style={{ color: sigmatiqTheme.colors.primary.teal }} />
                    ) : (
                      <Newspaper className="w-4 h-4 mt-0.5" style={{ color: sigmatiqTheme.colors.primary.coral }} />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                        {report.symbol && (
                          <ClickableEntity
                            type="ticker"
                            value={report.symbol}
                            className="font-medium mr-1"
                          />
                        )}
                        {report.title}
                      </div>
                      <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                        {report.summary} • {report.date}
                      </div>
                      {report.topics && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {report.topics.slice(0, 3).map((topic: string) => (
                            <ClickableEntity
                              key={topic}
                              type="topic"
                              value={topic}
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{ 
                                backgroundColor: `${sigmatiqTheme.colors.primary.teal}20`,
                                color: sigmatiqTheme.colors.primary.teal 
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: sigmatiqTheme.colors.text.muted }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
                No research reports available
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LongTermInvestingDashboard;