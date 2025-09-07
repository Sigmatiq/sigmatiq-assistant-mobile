import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  BarChart3,
  Activity,
  Calendar,
  Info,
  FileText,
  Bell,
  LineChart,
  X,
  XCircle
} from 'lucide-react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import { api } from '../api/client';

interface StockInfoPanelProps {
  symbol: string;
  onAction?: (action: string, data?: any) => void;
  onClose?: () => void;
  onClear?: () => void;
}

const StockInfoPanel: React.FC<StockInfoPanelProps> = ({ symbol, onAction, onClose, onClear }) => {
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'news' | 'events'>('overview');

  useEffect(() => {
    if (symbol) {
      loadStockData(symbol);
    }
  }, [symbol]);

  const loadStockData = async (sym: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch real data from our APIs (same pattern as StockInfoHelper)
      const [contextData, fundamentals, newsData] = await Promise.all([
        api.assistant.getSymbolContext(sym, 'day').catch(() => null),
        api.fundamentals.getOverview(sym).catch(() => null),
        api.news.getSentiment(sym).catch(() => null)
      ]);
      
      // TODO: Add fallback to market.getQuote if context API fails
      // TODO: Add caching to reduce API calls
      // TODO: Add WebSocket connection for real-time price updates
      
      if (!contextData && !fundamentals) {
        throw new Error('Unable to fetch stock data');
      }
      
      setStockData({
        overview: {
          symbol: sym.toUpperCase(),
          name: fundamentals?.overview?.name || getCompanyName(sym),
          price: parseFloat(contextData?.metrics?.price) || 0,
          change: parseFloat(contextData?.metrics?.change) || 0,
          changePercent: parseFloat(contextData?.metrics?.change_percent) || 0,
          volume: parseInt(contextData?.metrics?.volume) || 0,
          marketCap: parseFloat(fundamentals?.overview?.market_cap) || 0,
          dayRange: {
            low: parseFloat(contextData?.metrics?.day_low) || 0,
            high: parseFloat(contextData?.metrics?.day_high) || 0
          },
          yearRange: {
            low: parseFloat(contextData?.metrics?.year_low) || 0,
            high: parseFloat(contextData?.metrics?.year_high) || 0
          },
          avgVolume: parseInt(contextData?.metrics?.avg_volume) || 0
        },
        technicals: {
          rsi: parseFloat(contextData?.metrics?.rsi14) || 50,
          trend: parseFloat(contextData?.metrics?.change) > 0 ? 'bullish' : 
                 parseFloat(contextData?.metrics?.change) < 0 ? 'bearish' : 'neutral',
          // TODO: Add support/resistance calculation
          support: 0,
          resistance: 0,
          movingAverages: {
            ma20: parseFloat(contextData?.metrics?.sma20) || 0,
            ma50: parseFloat(contextData?.metrics?.ema50) || 0,
            ma200: parseFloat(contextData?.metrics?.ema200) || 0
          }
        },
        fundamentals: {
          peRatio: parseFloat(fundamentals?.overview?.pe_ratio) || 0,
          eps: parseFloat(fundamentals?.overview?.eps) || 0,
          dividend: {
            yield: parseFloat(fundamentals?.overview?.dividend_yield) || 0,
            // TODO: Add dividend amount to API
            amount: 0
          },
          beta: parseFloat(fundamentals?.overview?.beta) || 1
        },
        news: newsData?.items ? newsData.items.slice(0, 3).map((item: any) => ({
          title: item.title,
          summary: item.summary || '',
          source: item.source || 'News',
          time: item.time_published || 'Recent',
          sentiment: item.overall_sentiment_label?.toLowerCase() || 'neutral'
        })) : [],
        // TODO: Add more news sources
        // TODO: Add real-time news updates via WebSocket
        events: [
          // TODO: Implement earnings calendar API
          // TODO: Implement dividend calendar API
          // TODO: Implement corporate events API (splits, acquisitions, etc.)
        ]
      });
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError('Unable to load stock data. Please try again.');
      // TODO: Add retry mechanism with exponential backoff
      // TODO: Add offline mode with cached data  
      // TODO: Show user-friendly error messages based on error type
    } finally {
      setLoading(false);
    }
  };

  const getCompanyName = (sym: string): string => {
    const names: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'TSLA': 'Tesla, Inc.',
      'STRR': 'Starrer Holdings',
      'AMZN': 'Amazon.com, Inc.'
    };
    return names[sym.toUpperCase()] || `${sym.toUpperCase()} Corporation`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  if (loading || !stockData) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading {symbol}...</div>
          <div className="text-sm text-gray-500">Fetching stock data</div>
        </div>
      </div>
    );
  }

  const { overview, technicals, fundamentals, news, events } = stockData;
  const isPositive = overview.change >= 0;

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header with Close/Clear buttons */}
      <div className="flex items-center justify-between p-3 border-b" style={{ 
        borderColor: sigmatiqTheme.colors.border.default,
        backgroundColor: sigmatiqTheme.colors.background.secondary
      }}>
        <h3 className="text-sm font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
          Stock Information
        </h3>
        <div className="flex gap-2">
          {onClear && (
            <button
              onClick={onClear}
              className="p-1 rounded hover:opacity-70 transition-opacity"
              style={{ color: sigmatiqTheme.colors.text.muted }}
              title="Clear context"
            >
              <XCircle size={18} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:opacity-70 transition-opacity"
              style={{ color: sigmatiqTheme.colors.text.muted }}
              title="Close panel"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Stock Header with Price */}
      <div className="p-4 border-b" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold" style={{ color: sigmatiqTheme.colors.text.primary }}>
              {overview.symbol}
            </h2>
            <p className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>
              {overview.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: sigmatiqTheme.colors.text.primary }}>
              ${overview.price.toFixed(2)}
            </div>
            <div className="flex items-center justify-end gap-1">
              {isPositive ? (
                <TrendingUp size={16} style={{ color: sigmatiqTheme.colors.status.success }} />
              ) : overview.change < 0 ? (
                <TrendingDown size={16} style={{ color: sigmatiqTheme.colors.status.error }} />
              ) : (
                <Minus size={16} style={{ color: sigmatiqTheme.colors.text.muted }} />
              )}
              <span style={{ 
                color: isPositive ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error,
                fontWeight: 'medium'
              }}>
                {isPositive ? '+' : ''}{overview.change.toFixed(2)} ({isPositive ? '+' : ''}{overview.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
        {(['overview', 'analysis', 'news', 'events'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'border-b-2' : ''
            }`}
            style={{
              color: activeTab === tab ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.muted,
              borderColor: activeTab === tab ? sigmatiqTheme.colors.primary.teal : 'transparent'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Key Stats */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                KEY STATISTICS
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Volume</span>
                  <p className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    {formatNumber(overview.volume)}
                  </p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Avg Volume</span>
                  <p className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    {formatNumber(overview.avgVolume)}
                  </p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Day Range</span>
                  <p className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    ${overview.dayRange.low.toFixed(2)} - ${overview.dayRange.high.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>52W Range</span>
                  <p className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    ${overview.yearRange.low.toFixed(2)} - ${overview.yearRange.high.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Market Cap</span>
                  <p className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    ${formatNumber(overview.marketCap)}
                  </p>
                </div>
                <div>
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>P/E Ratio</span>
                  <p className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    {fundamentals.peRatio?.toFixed(2) || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Fundamentals */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                FUNDAMENTALS
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>EPS</span>
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    ${fundamentals.eps?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Dividend Yield</span>
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    {fundamentals.dividend?.yield.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Beta</span>
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    {fundamentals.beta?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                TECHNICAL INDICATORS
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>RSI (14)</span>
                    <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                      {technicals.rsi.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${technicals.rsi}%`,
                        backgroundColor: technicals.rsi > 70 ? sigmatiqTheme.colors.status.error : 
                                       technicals.rsi < 30 ? sigmatiqTheme.colors.status.success : 
                                       sigmatiqTheme.colors.status.warning
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Trend</span>
                  <span 
                    className="text-sm font-medium capitalize"
                    style={{ 
                      color: technicals.trend === 'bullish' ? sigmatiqTheme.colors.status.success :
                             technicals.trend === 'bearish' ? sigmatiqTheme.colors.status.error :
                             sigmatiqTheme.colors.text.muted
                    }}
                  >
                    {technicals.trend}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Support</span>
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    ${technicals.support.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Resistance</span>
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    ${technicals.resistance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                MOVING AVERAGES
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>MA(20)</span>
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    ${technicals.movingAverages.ma20.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>MA(50)</span>
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    ${technicals.movingAverages.ma50.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>MA(200)</span>
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    ${technicals.movingAverages.ma200.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-3">
            {news.map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: sigmatiqTheme.colors.background.primary }}
                onClick={() => onAction?.('viewNews', { article: item })}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium flex-1" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    {item.title}
                  </h4>
                  {item.sentiment && (
                    <span 
                      className="text-xs px-2 py-1 rounded ml-2"
                      style={{ 
                        backgroundColor: item.sentiment === 'positive' ? sigmatiqTheme.colors.status.success + '20' :
                                       item.sentiment === 'negative' ? sigmatiqTheme.colors.status.error + '20' :
                                       sigmatiqTheme.colors.text.muted + '20',
                        color: item.sentiment === 'positive' ? sigmatiqTheme.colors.status.success :
                               item.sentiment === 'negative' ? sigmatiqTheme.colors.status.error :
                               sigmatiqTheme.colors.text.muted
                      }}
                    >
                      {item.sentiment}
                    </span>
                  )}
                </div>
                <p className="text-xs mb-2" style={{ color: sigmatiqTheme.colors.text.muted }}>
                  {item.summary}
                </p>
                <div className="flex justify-between text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                  <span>{item.source}</span>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-3">
            {events.map((event, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg"
                style={{ backgroundColor: sigmatiqTheme.colors.background.primary }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} style={{ color: sigmatiqTheme.colors.primary.teal }} />
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    {event.description}
                  </span>
                </div>
                <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockInfoPanel;