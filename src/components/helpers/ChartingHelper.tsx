import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  LineChart,
  CandlestickChart,
  Settings,
  Maximize2,
  RefreshCw,
  Info,
  ChevronDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import { api } from '../../api/client';
import LoadingIndicator from '../LoadingIndicator';
import ErrorMessage from '../ErrorMessage';
import useAppStore from '../../stores/useAppStore';

interface Props {
  symbol: string;
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
  context?: {
    symbol?: string;
    source?: 'panel' | 'chat' | 'search';
    trigger?: string;
    topic?: string;
  };
  experience?: 'novice' | 'intermediate' | 'power';
}

type ChartType = 'candlestick' | 'line' | 'area';
type TimeFrame = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';
type Indicator = 'sma20' | 'sma50' | 'ema20' | 'rsi' | 'macd' | 'volume';

interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const ChartingHelper: React.FC<Props> = ({ symbol, onClose, onAction, context, experience = 'novice' }) => {
  const { experience: globalExperience } = useAppStore();
  const effectiveExperience = experience || globalExperience || 'novice';
  
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = useState<TimeFrame>('1d');
  const [indicators, setIndicators] = useState<Indicator[]>(['volume', 'sma20']);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch real chart data from API
  const { data: chartData, isLoading, error, refetch } = useQuery({
    queryKey: ['chart', symbol, timeframe],
    queryFn: async () => {
      try {
        // Try to get real data from API
        const response = await api.market.getChartData(symbol, timeframe, 100);
        
        // Transform API response to match our PriceData interface
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map((item: any) => ({
            timestamp: new Date(item.t || item.timestamp).getTime(),
            open: item.o || item.open,
            high: item.h || item.high,
            low: item.l || item.low,
            close: item.c || item.close,
            volume: item.v || item.volume
          }));
        }
        
        // Fallback to sample data if API doesn't return data
        return generateSampleData(symbol, timeframe);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        // Fallback to sample data on error
        return generateSampleData(symbol, timeframe);
      }
    },
    refetchInterval: autoRefresh ? 60000 : false, // Refresh every minute if auto-refresh is on
    staleTime: 30000, // Data is fresh for 30 seconds
  });

  // Calculate indicators
  const calculatedIndicators = useMemo(() => {
    if (!chartData) return {};
    
    const result: any = {};
    
    // Calculate SMA20
    if (indicators.includes('sma20')) {
      result.sma20 = calculateSMA(chartData, 20);
    }
    
    // Calculate SMA50
    if (indicators.includes('sma50')) {
      result.sma50 = calculateSMA(chartData, 50);
    }
    
    // Calculate RSI
    if (indicators.includes('rsi')) {
      result.rsi = calculateRSI(chartData, 14);
    }
    
    return result;
  }, [chartData, indicators]);

  // Timeframe options based on experience
  const timeframeOptions = useMemo(() => {
    const allOptions: { value: TimeFrame; label: string; description: string }[] = [
      { value: '1m', label: '1m', description: 'Scalping' },
      { value: '5m', label: '5m', description: 'Day trading' },
      { value: '15m', label: '15m', description: 'Day trading' },
      { value: '30m', label: '30m', description: 'Intraday' },
      { value: '1h', label: '1h', description: 'Swing' },
      { value: '4h', label: '4h', description: 'Swing' },
      { value: '1d', label: '1D', description: 'Position' },
      { value: '1w', label: '1W', description: 'Long-term' }
    ];

    if (effectiveExperience === 'novice') {
      return allOptions.filter(o => ['15m', '1h', '1d', '1w'].includes(o.value));
    }
    return allOptions;
  }, [effectiveExperience]);

  // Indicator options based on experience
  const indicatorOptions = useMemo(() => {
    const allOptions: { value: Indicator; label: string; description: string; advanced?: boolean }[] = [
      { value: 'volume', label: 'Volume', description: 'Trading volume' },
      { value: 'sma20', label: 'SMA 20', description: '20-period moving average' },
      { value: 'sma50', label: 'SMA 50', description: '50-period moving average' },
      { value: 'ema20', label: 'EMA 20', description: 'Exponential moving average', advanced: true },
      { value: 'rsi', label: 'RSI', description: 'Relative Strength Index' },
      { value: 'macd', label: 'MACD', description: 'Trend following', advanced: true }
    ];

    if (effectiveExperience === 'novice') {
      return allOptions.filter(o => !o.advanced);
    }
    return allOptions;
  }, [effectiveExperience]);

  // Toggle indicator
  const toggleIndicator = (indicator: Indicator) => {
    setIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  // Get latest price info
  const latestPrice = chartData?.[chartData.length - 1];
  const previousPrice = chartData?.[chartData.length - 2];
  const priceChange = latestPrice && previousPrice 
    ? latestPrice.close - previousPrice.close
    : 0;
  const priceChangePercent = previousPrice 
    ? (priceChange / previousPrice.close) * 100
    : 0;

  return (
    <div 
      className={`rounded-xl border ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      style={{ 
        backgroundColor: sigmatiqTheme.colors.background.card,
        borderColor: sigmatiqTheme.colors.border.default 
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: sigmatiqTheme.colors.border.default }}
      >
        <div className="flex items-center gap-3">
          <CandlestickChart size={20} style={{ color: sigmatiqTheme.colors.text.accent }} />
          <div>
            <h3 className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
              {symbol} Chart
            </h3>
            {latestPrice && (
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: sigmatiqTheme.colors.text.primary }}>
                  ${latestPrice.close.toFixed(2)}
                </span>
                <span style={{ 
                  color: priceChange >= 0 
                    ? sigmatiqTheme.colors.semantic.success 
                    : sigmatiqTheme.colors.semantic.error 
                }}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} 
                  ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded transition-colors ${autoRefresh ? 'animate-spin-slow' : ''}`}
            style={{ 
              color: autoRefresh 
                ? sigmatiqTheme.colors.semantic.success 
                : sigmatiqTheme.colors.text.secondary 
            }}
            title={autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'}
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded hover:bg-opacity-10 transition-colors"
            style={{ color: sigmatiqTheme.colors.text.secondary }}
          >
            <Settings size={18} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded hover:bg-opacity-10 transition-colors"
            style={{ color: sigmatiqTheme.colors.text.secondary }}
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-opacity-10 transition-colors"
            style={{ color: sigmatiqTheme.colors.text.secondary }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Timeframe Selector */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              Timeframe
            </span>
            {experience === 'novice' && (
              <div className="group relative">
                <Info size={14} style={{ color: sigmatiqTheme.colors.text.tertiary }} />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 p-2 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                  Choose how much time each candle represents
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {timeframeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value)}
                className="px-3 py-1 rounded text-sm transition-colors"
                style={{
                  backgroundColor: timeframe === option.value 
                    ? sigmatiqTheme.colors.text.accent 
                    : sigmatiqTheme.colors.background.secondary,
                  color: timeframe === option.value 
                    ? sigmatiqTheme.colors.background.primary 
                    : sigmatiqTheme.colors.text.primary,
                  border: `1px solid ${sigmatiqTheme.colors.border.default}`
                }}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Type Selector */}
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: sigmatiqTheme.colors.text.secondary }}>
            Chart Type
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('candlestick')}
              className="flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors"
              style={{
                backgroundColor: chartType === 'candlestick' 
                  ? sigmatiqTheme.colors.text.accent 
                  : sigmatiqTheme.colors.background.secondary,
                color: chartType === 'candlestick' 
                  ? sigmatiqTheme.colors.background.primary 
                  : sigmatiqTheme.colors.text.primary,
                border: `1px solid ${sigmatiqTheme.colors.border.default}`
              }}
            >
              <CandlestickChart size={14} />
              Candlestick
            </button>
            <button
              onClick={() => setChartType('line')}
              className="flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors"
              style={{
                backgroundColor: chartType === 'line' 
                  ? sigmatiqTheme.colors.text.accent 
                  : sigmatiqTheme.colors.background.secondary,
                color: chartType === 'line' 
                  ? sigmatiqTheme.colors.background.primary 
                  : sigmatiqTheme.colors.text.primary,
                border: `1px solid ${sigmatiqTheme.colors.border.default}`
              }}
            >
              <LineChart size={14} />
              Line
            </button>
            <button
              onClick={() => setChartType('area')}
              className="flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors"
              style={{
                backgroundColor: chartType === 'area' 
                  ? sigmatiqTheme.colors.text.accent 
                  : sigmatiqTheme.colors.background.secondary,
                color: chartType === 'area' 
                  ? sigmatiqTheme.colors.background.primary 
                  : sigmatiqTheme.colors.text.primary,
                border: `1px solid ${sigmatiqTheme.colors.border.default}`
              }}
            >
              <BarChart3 size={14} />
              Area
            </button>
          </div>
        </div>

        {/* Indicators */}
        {showSettings && (
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              Indicators
            </div>
            <div className="flex gap-2 flex-wrap">
              {indicatorOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => toggleIndicator(option.value)}
                  className="px-3 py-1 rounded text-sm transition-colors"
                  style={{
                    backgroundColor: indicators.includes(option.value) 
                      ? sigmatiqTheme.colors.text.accent 
                      : sigmatiqTheme.colors.background.secondary,
                    color: indicators.includes(option.value) 
                      ? sigmatiqTheme.colors.background.primary 
                      : sigmatiqTheme.colors.text.primary,
                    border: `1px solid ${sigmatiqTheme.colors.border.default}`
                  }}
                  title={option.description}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingIndicator message="Loading chart data..." size="small" />
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center">
            <ErrorMessage message="Failed to load chart data" />
          </div>
        ) : (
          <div 
            className="h-64 lg:h-96 rounded flex items-center justify-center"
            style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
          >
            {/* Placeholder for actual chart implementation */}
            <div className="text-center">
              <CandlestickChart size={48} style={{ color: sigmatiqTheme.colors.text.tertiary }} />
              <p className="mt-2 text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                Chart visualization would appear here
              </p>
              <p className="text-xs mt-1" style={{ color: sigmatiqTheme.colors.text.tertiary }}>
                {chartType} chart with {timeframe} timeframe
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel for Beginners */}
      {experience === 'novice' && (
        <div 
          className="p-4 m-4 rounded-lg"
          style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
        >
          <div className="flex items-start gap-2">
            <Info size={16} style={{ color: sigmatiqTheme.colors.text.accent }} />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Chart Reading Tips
              </p>
              <ul className="text-xs space-y-1" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                <li>• Green candles show price went up, red shows price went down</li>
                <li>• Taller candles mean bigger price movements</li>
                <li>• Volume bars show how many shares were traded</li>
                <li>• Moving averages help identify trends</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function generateSampleData(symbol: string, timeframe: TimeFrame): PriceData[] {
  // Generate sample data for demonstration
  const data: PriceData[] = [];
  const periods = timeframe === '1m' ? 60 : timeframe === '5m' ? 60 : 50;
  let basePrice = 100;
  
  for (let i = 0; i < periods; i++) {
    const volatility = 0.02;
    const trend = Math.random() > 0.5 ? 1 : -1;
    const change = (Math.random() * volatility * trend);
    
    basePrice *= (1 + change);
    const high = basePrice * (1 + Math.random() * 0.01);
    const low = basePrice * (1 - Math.random() * 0.01);
    const open = basePrice * (1 + (Math.random() - 0.5) * 0.005);
    
    data.push({
      timestamp: Date.now() - (periods - i) * 60000,
      open,
      high,
      low,
      close: basePrice,
      volume: Math.floor(Math.random() * 1000000)
    });
  }
  
  return data;
}

function calculateSMA(data: PriceData[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(0);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
      sma.push(sum / period);
    }
  }
  return sma;
}

function calculateRSI(data: PriceData[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(50); // Default RSI
    } else {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
  }
  
  return rsi;
}

export default ChartingHelper;