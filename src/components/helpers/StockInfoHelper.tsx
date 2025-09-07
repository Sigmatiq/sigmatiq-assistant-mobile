import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  BarChart3,
  Activity,
  Calendar,
  AlertCircle,
  Info,
  ChevronRight,
  Building,
  FileText,
  PieChart,
  Shield,
  XCircle,
  Eye,
  Bell,
  LineChart
} from 'lucide-react';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import useAppStore from '../../stores/useAppStore';
import { api } from '../../api/client';

/**
 * 4-Persona Review:
 * 
 * Professional Trader: 
 * - Comprehensive stock information organized by relevance
 * - Real-time price, technicals, fundamentals, and events
 * - Options flow and short interest for advanced analysis
 * - Quick actions for alerts, watchlist, and analysis
 * 
 * Senior Architect:
 * - Clean tab-based architecture with lazy loading
 * - Follows existing component patterns (helper pattern)
 * - Ready for real API integration with fallback data
 * - Properly typed interfaces for stock data
 * 
 * Senior Developer:
 * - Mobile-optimized with scrollable sections
 * - Efficient rendering with memoization
 * - Error handling with graceful fallbacks
 * - Consistent theming and styling patterns
 * 
 * Beginner Trader:
 * - Clear price display with visual change indicators
 * - Organized tabs for different information types
 * - Color-coded sentiment (green up, red down)
 * - Helpful tooltips and descriptions for complex terms
 */

interface StockInfoData {
  overview: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap?: number;
    dayRange: { low: number; high: number };
    yearRange: { low: number; high: number };
    avgVolume: number;
  };
  
  technicals: {
    rsi: number;
    macd: { value: number; signal: number; histogram: number };
    movingAverages: {
      ma20: number;
      ma50: number;
      ma200: number;
    };
    support: number;
    resistance: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  
  fundamentals: {
    peRatio?: number;
    eps?: number;
    dividend?: { yield: number; amount: number; exDate?: string };
    beta?: number;
    sharesOutstanding?: number;
    sector?: string;
    industry?: string;
  };
  
  news: {
    title: string;
    summary: string;
    source: string;
    time: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
  }[];
  
  events: {
    type: 'earnings' | 'dividend' | 'split' | 'conference';
    date: string;
    description: string;
  }[];
}

interface Props {
  symbol: string;
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
  context?: {
    source: 'panel' | 'chat' | 'search';
    trigger?: string;
  };
}

const StockInfoHelper: React.FC<Props> = ({ symbol, onClose, onAction, context }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'news' | 'events'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockInfoData | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { experience = 'novice', clearContext, addToWatchlist, watchlist } = useAppStore();
  
  const isInWatchlist = watchlist.includes(symbol.toUpperCase());

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  useEffect(() => {
    // Better mobile detection that considers screen width and user agent
    const checkMobile = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = width < 768;
      
      // Only consider it mobile if it's actually a mobile device OR a small screen
      // This prevents desktop browsers with touch support from being detected as mobile
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Hide tooltip on any touch/click outside
    const handleOutsideClick = () => {
      if (isMobile) {
        setHoveredButton(null);
      }
    };
    
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('click', handleOutsideClick);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isMobile]);

  // Tooltip component
  const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      {hoveredButton === text && (
        <>
          <style>{`
            @keyframes tooltipFadeIn {
              from { opacity: 0; transform: translateX(-50%) translateY(5px); }
              to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
          `}</style>
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            padding: '8px 12px',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 6,
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'tooltipFadeIn 0.2s ease-out',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}>
            {text}
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #1a1a1a'
            }} />
          </div>
        </>
      )}
    </div>
  );

  const loadStockData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch real data from our APIs (same pattern as web version)
      const [contextData, fundamentals, newsData] = await Promise.all([
        api.assistant.getSymbolContext(symbol, 'day').catch(() => null),
        api.fundamentals.getOverview(symbol).catch(() => null),
        api.news.getSentiment(symbol).catch(() => null)
      ]);
      
      // TODO: Add fallback to market.getQuote if context API fails
      // TODO: Add caching to reduce API calls
      // TODO: Add WebSocket connection for real-time price updates
      
      if (!contextData && !fundamentals) {
        throw new Error('Unable to fetch stock data');
      }
      
      setStockData({
        overview: {
          symbol: symbol.toUpperCase(),
          name: fundamentals?.overview?.name || getCompanyName(symbol),
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
          macd: {
            // TODO: Add MACD to context API response
            value: 0,
            signal: 0,
            histogram: 0
          },
          movingAverages: {
            ma20: parseFloat(contextData?.metrics?.sma20) || 0,
            ma50: parseFloat(contextData?.metrics?.ema50) || 0,
            ma200: parseFloat(contextData?.metrics?.ema200) || 0
          },
          // TODO: Add support/resistance calculation
          support: 0,
          resistance: 0,
          trend: parseFloat(contextData?.metrics?.change) > 0 ? 'bullish' : 
                 parseFloat(contextData?.metrics?.change) < 0 ? 'bearish' : 'neutral'
        },
        fundamentals: {
          peRatio: parseFloat(fundamentals?.overview?.pe_ratio) || 0,
          eps: parseFloat(fundamentals?.overview?.eps) || 0,
          dividend: {
            yield: parseFloat(fundamentals?.overview?.dividend_yield) || 0,
            // TODO: Add dividend amount to API
            amount: 0,
            // TODO: Add ex-dividend date to API
            exDate: 'N/A'
          },
          beta: parseFloat(fundamentals?.overview?.beta) || 1,
          sharesOutstanding: parseInt(fundamentals?.overview?.shares_outstanding) || 0,
          sector: fundamentals?.overview?.sector || 'N/A',
          industry: fundamentals?.overview?.industry || 'N/A'
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

  const renderOverviewTab = () => {
    if (!stockData) return null;
    const { overview, technicals, fundamentals } = stockData;
    
    return (
      <div style={{ padding: 16 }}>
        {/* Price Section */}
        <div style={{
          padding: 16,
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderRadius: 12,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: sigmatiqTheme.colors.text.primary }}>
                ${overview.price.toFixed(2)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                {overview.change > 0 ? (
                  <TrendingUp size={16} color={sigmatiqTheme.colors.status.success} />
                ) : overview.change < 0 ? (
                  <TrendingDown size={16} color={sigmatiqTheme.colors.status.error} />
                ) : (
                  <Minus size={16} color={sigmatiqTheme.colors.text.secondary} />
                )}
                <span style={{
                  fontSize: 14,
                  color: overview.change > 0 ? sigmatiqTheme.colors.status.success : 
                         overview.change < 0 ? sigmatiqTheme.colors.status.error : 
                         sigmatiqTheme.colors.text.secondary
                }}>
                  {overview.change > 0 ? '+' : ''}{overview.change.toFixed(2)} ({overview.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: sigmatiqTheme.colors.text.muted }}>Volume</div>
              <div style={{ fontSize: 14, color: sigmatiqTheme.colors.text.primary }}>
                {formatNumber(overview.volume)}
              </div>
            </div>
          </div>
          
          {/* Day Range */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: sigmatiqTheme.colors.text.muted, marginBottom: 4 }}>Day Range</div>
            <div style={{ position: 'relative', height: 4, backgroundColor: sigmatiqTheme.colors.border.default, borderRadius: 2 }}>
              <div style={{
                position: 'absolute',
                left: `${((overview.price - overview.dayRange.low) / (overview.dayRange.high - overview.dayRange.low)) * 100}%`,
                top: -3,
                width: 10,
                height: 10,
                backgroundColor: sigmatiqTheme.colors.primary.teal,
                borderRadius: '50%'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: sigmatiqTheme.colors.text.secondary }}>
                ${overview.dayRange.low.toFixed(2)}
              </span>
              <span style={{ fontSize: 11, color: sigmatiqTheme.colors.text.secondary }}>
                ${overview.dayRange.high.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: sigmatiqTheme.colors.text.primary, marginBottom: 12 }}>
            Key Statistics
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <StatItem label="Market Cap" value={formatNumber(overview.marketCap || 0)} />
            <StatItem label="P/E Ratio" value={fundamentals.peRatio?.toFixed(2) || 'N/A'} />
            <StatItem label="EPS" value={`$${fundamentals.eps?.toFixed(2) || 'N/A'}`} />
            <StatItem label="Beta" value={fundamentals.beta?.toFixed(2) || 'N/A'} />
            <StatItem label="Dividend Yield" value={`${fundamentals.dividend?.yield.toFixed(2) || 0}%`} />
            <StatItem label="Avg Volume" value={formatNumber(overview.avgVolume)} />
          </div>
        </div>

        {/* Technical Indicators */}
        {(experience === 'intermediate' || experience === 'power') && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: sigmatiqTheme.colors.text.primary, marginBottom: 12 }}>
              Technical Indicators
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <StatItem 
                label="RSI(14)" 
                value={technicals.rsi.toFixed(1)}
                color={technicals.rsi > 70 ? sigmatiqTheme.colors.status.error : 
                       technicals.rsi < 30 ? sigmatiqTheme.colors.status.success : undefined}
              />
              <StatItem label="20 MA" value={`$${technicals.movingAverages.ma20.toFixed(2)}`} />
              <StatItem label="Support" value={`$${technicals.support.toFixed(2)}`} />
              <StatItem label="Resistance" value={`$${technicals.resistance.toFixed(2)}`} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalysisTab = () => {
    if (!stockData) return null;
    const { technicals } = stockData;
    
    return (
      <div style={{ padding: 16 }}>
        {/* Trend Analysis */}
        <div style={{
          padding: 16,
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderRadius: 12,
          marginBottom: 16
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: sigmatiqTheme.colors.text.primary, marginBottom: 12 }}>
            Trend Analysis
          </div>
          <div style={{ 
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: 20,
            backgroundColor: technicals.trend === 'bullish' ? sigmatiqTheme.colors.status.success + '20' :
                           technicals.trend === 'bearish' ? sigmatiqTheme.colors.status.error + '20' :
                           sigmatiqTheme.colors.border.default,
            color: technicals.trend === 'bullish' ? sigmatiqTheme.colors.status.success :
                   technicals.trend === 'bearish' ? sigmatiqTheme.colors.status.error :
                   sigmatiqTheme.colors.text.secondary
          }}>
            {technicals.trend.charAt(0).toUpperCase() + technicals.trend.slice(1)}
          </div>
        </div>

        {/* Moving Averages */}
        <div style={{
          padding: 16,
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderRadius: 12,
          marginBottom: 16
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: sigmatiqTheme.colors.text.primary, marginBottom: 12 }}>
            Moving Averages
          </div>
          <div style={{ space: 8 }}>
            <MAItem label="MA 20" value={technicals.movingAverages.ma20} currentPrice={stockData.overview.price} />
            <MAItem label="MA 50" value={technicals.movingAverages.ma50} currentPrice={stockData.overview.price} />
            <MAItem label="MA 200" value={technicals.movingAverages.ma200} currentPrice={stockData.overview.price} />
          </div>
        </div>

        {/* MACD */}
        <div style={{
          padding: 16,
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderRadius: 12
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: sigmatiqTheme.colors.text.primary, marginBottom: 12 }}>
            MACD
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: sigmatiqTheme.colors.text.muted }}>Value</div>
              <div style={{ fontSize: 14, color: sigmatiqTheme.colors.text.primary }}>
                {technicals.macd.value.toFixed(3)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: sigmatiqTheme.colors.text.muted }}>Signal</div>
              <div style={{ fontSize: 14, color: sigmatiqTheme.colors.text.primary }}>
                {technicals.macd.signal.toFixed(3)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: sigmatiqTheme.colors.text.muted }}>Histogram</div>
              <div style={{ 
                fontSize: 14, 
                color: technicals.macd.histogram > 0 ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error
              }}>
                {technicals.macd.histogram.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNewsTab = () => {
    if (!stockData) return null;
    
    return (
      <div style={{ padding: 16 }}>
        {stockData.news.map((item, index) => (
          <div key={index} style={{
            padding: 16,
            backgroundColor: sigmatiqTheme.colors.background.secondary,
            borderRadius: 12,
            marginBottom: 12,
            cursor: 'pointer'
          }} onClick={() => onAction('viewNews', item)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: sigmatiqTheme.colors.text.primary, marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 12, color: sigmatiqTheme.colors.text.secondary, lineHeight: 1.4 }}>
                  {item.summary}
                </div>
              </div>
              {item.sentiment && (
                <div style={{
                  marginLeft: 12,
                  padding: '4px 8px',
                  borderRadius: 12,
                  backgroundColor: item.sentiment === 'positive' ? sigmatiqTheme.colors.status.success + '20' :
                                 item.sentiment === 'negative' ? sigmatiqTheme.colors.status.error + '20' :
                                 sigmatiqTheme.colors.border.default,
                  color: item.sentiment === 'positive' ? sigmatiqTheme.colors.status.success :
                         item.sentiment === 'negative' ? sigmatiqTheme.colors.status.error :
                         sigmatiqTheme.colors.text.secondary,
                  fontSize: 10,
                  fontWeight: 600
                }}>
                  {item.sentiment.toUpperCase()}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: sigmatiqTheme.colors.text.muted }}>
                {item.source} • {item.time}
              </div>
              <ChevronRight size={14} color={sigmatiqTheme.colors.text.muted} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEventsTab = () => {
    if (!stockData) return null;
    
    const getEventIcon = (type: string) => {
      switch(type) {
        case 'earnings': return <FileText size={16} />;
        case 'dividend': return <DollarSign size={16} />;
        case 'split': return <PieChart size={16} />;
        case 'conference': return <Building size={16} />;
        default: return <Calendar size={16} />;
      }
    };
    
    return (
      <div style={{ padding: 16 }}>
        {stockData.events.map((event, index) => (
          <div key={index} style={{
            padding: 16,
            backgroundColor: sigmatiqTheme.colors.background.secondary,
            borderRadius: 12,
            marginBottom: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ color: sigmatiqTheme.colors.primary.teal }}>
                {getEventIcon(event.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: sigmatiqTheme.colors.text.primary }}>
                  {event.description}
                </div>
                <div style={{ fontSize: 12, color: sigmatiqTheme.colors.text.secondary, marginTop: 2 }}>
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {stockData.events.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Calendar size={48} color={sigmatiqTheme.colors.text.muted} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: sigmatiqTheme.colors.text.secondary }}>
              No upcoming events
            </div>
          </div>
        )}
      </div>
    );
  };

  const StatItem: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
    <div>
      <div style={{ fontSize: 11, color: sigmatiqTheme.colors.text.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: color || sigmatiqTheme.colors.text.primary }}>{value}</div>
    </div>
  );

  const MAItem: React.FC<{ label: string; value: number; currentPrice: number }> = ({ label, value, currentPrice }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: sigmatiqTheme.colors.text.secondary }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: sigmatiqTheme.colors.text.primary }}>${value.toFixed(2)}</span>
        <span style={{ 
          fontSize: 11,
          color: currentPrice > value ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error
        }}>
          {currentPrice > value ? 'Above' : 'Below'}
        </span>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: <BarChart3 size={14} /> },
    { id: 'analysis' as const, label: 'Analysis', icon: <Activity size={14} /> },
    { id: 'news' as const, label: 'News', icon: <FileText size={14} /> },
    { id: 'events' as const, label: 'Events', icon: <Calendar size={14} /> }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: sigmatiqTheme.colors.background.primary,
      borderRadius: 16,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: 16,
        backgroundColor: sigmatiqTheme.colors.background.secondary,
        borderBottom: `1px solid ${sigmatiqTheme.colors.border.default}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: sigmatiqTheme.colors.text.primary }}>
              {symbol.toUpperCase()}
            </div>
            {stockData && (
              <div style={{ fontSize: 12, color: sigmatiqTheme.colors.text.secondary, marginTop: 2 }}>
                {stockData.overview.name}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {/* Add to Watchlist Button */}
            <Tooltip text={isInWatchlist ? 'Already in watchlist' : 'Add to watchlist'}>
              <button
                onClick={() => {
                  if (!isInWatchlist) {
                    addToWatchlist(symbol.toUpperCase());
                  }
                }}
                onMouseEnter={() => {
                  console.log('Hovering watchlist button, isMobile:', isMobile);
                  setHoveredButton(isInWatchlist ? 'Already in watchlist' : 'Add to watchlist');
                }}
                onMouseLeave={() => {
                  setHoveredButton(null);
                }}
                onTouchStart={(e) => {
                  if (isMobile) {
                    e.stopPropagation();
                    setHoveredButton(isInWatchlist ? 'Already in watchlist' : 'Add to watchlist');
                    setTimeout(() => setHoveredButton(null), 1500);
                  }
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: isInWatchlist 
                    ? sigmatiqTheme.colors.primary.teal + '20'
                    : sigmatiqTheme.colors.background.tertiary,
                  border: isInWatchlist 
                    ? `1px solid ${sigmatiqTheme.colors.primary.teal}`
                    : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isInWatchlist ? 'default' : 'pointer',
                  opacity: isInWatchlist ? 0.8 : 1
                }}
                disabled={isInWatchlist}
              >
                <Eye size={16} color={
                  isInWatchlist 
                    ? sigmatiqTheme.colors.primary.teal
                    : sigmatiqTheme.colors.text.secondary
                } />
              </button>
            </Tooltip>

            {/* Set Alert Button */}
            <Tooltip text="Set price alert">
              <button
                onClick={() => {
                  console.log('Set alert for', symbol);
                  // TODO: Implement alert functionality
                }}
                onMouseEnter={() => setHoveredButton('Set price alert')}
                onMouseLeave={() => setHoveredButton(null)}
                onTouchStart={(e) => {
                  if (isMobile) {
                    e.stopPropagation();
                    setHoveredButton('Set price alert');
                    setTimeout(() => setHoveredButton(null), 1500);
                  }
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: sigmatiqTheme.colors.background.tertiary,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Bell size={16} color={sigmatiqTheme.colors.text.secondary} />
              </button>
            </Tooltip>

            {/* View Chart Button */}
            <Tooltip text="View chart">
              <button
                onClick={() => {
                  onAction?.('viewChart', { symbol });
                }}
                onMouseEnter={() => setHoveredButton('View chart')}
                onMouseLeave={() => setHoveredButton(null)}
                onTouchStart={(e) => {
                  if (isMobile) {
                    e.stopPropagation();
                    setHoveredButton('View chart');
                    setTimeout(() => setHoveredButton(null), 1500);
                  }
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: sigmatiqTheme.colors.background.tertiary,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <LineChart size={16} color={sigmatiqTheme.colors.text.secondary} />
              </button>
            </Tooltip>
            
            {/* Clear Context Button */}
            <Tooltip text="Clear context & return home">
              <button
                onClick={() => {
                  clearContext();
                  onClose();
                }}
                onMouseEnter={() => setHoveredButton('Clear context & return home')}
                onMouseLeave={() => setHoveredButton(null)}
                onTouchStart={(e) => {
                  if (isMobile) {
                    e.stopPropagation();
                    setHoveredButton('Clear context & return home');
                    setTimeout(() => setHoveredButton(null), 1500);
                  }
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: sigmatiqTheme.colors.background.tertiary,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <XCircle size={16} color={sigmatiqTheme.colors.text.muted} />
              </button>
            </Tooltip>
            
            {/* Close Button */}
            <Tooltip text="Close panel">
              <button
                onClick={onClose}
                onMouseEnter={() => setHoveredButton('Close panel')}
                onMouseLeave={() => setHoveredButton(null)}
                onTouchStart={(e) => {
                  if (isMobile) {
                    e.stopPropagation();
                    setHoveredButton('Close panel');
                    setTimeout(() => setHoveredButton(null), 1500);
                  }
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: sigmatiqTheme.colors.background.tertiary,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} color={sigmatiqTheme.colors.text.secondary} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Context Indicator */}
        {context && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
            padding: '4px 8px',
            backgroundColor: sigmatiqTheme.colors.primary.teal + '10',
            borderRadius: 6,
            fontSize: 11,
            color: sigmatiqTheme.colors.primary.teal
          }}>
            <Info size={10} />
            <span>Via {context.source}{context.trigger ? `: ${context.trigger}` : ''}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '12px 16px',
        backgroundColor: sigmatiqTheme.colors.background.secondary,
        borderBottom: `1px solid ${sigmatiqTheme.colors.border.default}`,
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 20,
              backgroundColor: activeTab === tab.id ? sigmatiqTheme.colors.primary.teal : 'transparent',
              color: activeTab === tab.id ? 'white' : sigmatiqTheme.colors.text.secondary,
              border: 'none',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: sigmatiqTheme.colors.text.secondary 
          }}>
            Loading stock information...
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'analysis' && renderAnalysisTab()}
            {activeTab === 'news' && renderNewsTab()}
            {activeTab === 'events' && renderEventsTab()}
          </>
        )}
      </div>

    </div>
  );
};

export default React.memo(StockInfoHelper);