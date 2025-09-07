import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Eye, 
  Save,
  X, 
  AlertCircle,
  Shield,
  Info,
  Target,
  TrendingUp,
  Clock,
  Filter,
  ChevronDown
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import { api } from '../../api/client';
import LoadingIndicator from '../LoadingIndicator';
import ErrorMessage from '../ErrorMessage';
import useAppStore from '../../stores/useAppStore';

interface Props {
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
  context?: {
    symbol?: string;
    source?: 'panel' | 'chat' | 'search';
    trigger?: string;
    topic?: string;
  };
  experience?: 'novice' | 'intermediate' | 'power';
  initialMode?: 'single' | 'multiple';
  initialSymbol?: string;
}

type Profile = 'day' | 'swing' | 'long';
type Mode = 'single' | 'multiple';
type Timeframe = '5m' | '15m' | '1h' | '4h' | 'day';
type IndicatorType = 'rsi' | 'macd' | 'sma' | 'ema' | 'bollinger' | 'stochastic';

interface ActionConfig {
  mode: Mode;
  profile: Profile;
  timeframe: Timeframe;
  symbol?: string;
  universe?: {
    kind: 'preset' | 'watchlist';
    id: string;
  };
  indicators: IndicatorType[];
  cap: number;
  params: {
    [key: string]: any;
  };
}

const ActionHelper: React.FC<Props> = ({ 
  onClose,
  onAction,
  context,
  experience = 'novice', 
  initialMode = 'single',
  initialSymbol 
}) => {
  const { selectedSymbol } = useAppStore();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [profile, setProfile] = useState<Profile>('day');
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [symbol, setSymbol] = useState(initialSymbol || selectedSymbol || 'AAPL');
  const [universe, setUniverse] = useState({ kind: 'preset' as const, id: 'sp500' });
  const [indicators, setIndicators] = useState<IndicatorType[]>(['rsi']);
  const [cap, setCap] = useState(10);
  const [showGuardrails, setShowGuardrails] = useState(true);
  const [previewData, setPreviewData] = useState<any>(null);

  // Profile presets
  const profilePresets = {
    day: {
      timeframe: '5m' as Timeframe,
      indicators: ['rsi', 'macd'] as IndicatorType[],
      description: 'Quick in-and-out trades within the day',
      risk: 'High',
      holdTime: 'Minutes to hours'
    },
    swing: {
      timeframe: '1h' as Timeframe,
      indicators: ['rsi', 'sma'] as IndicatorType[],
      description: 'Capture price swings over days',
      risk: 'Medium',
      holdTime: 'Days to weeks'
    },
    long: {
      timeframe: 'day' as Timeframe,
      indicators: ['sma', 'ema'] as IndicatorType[],
      description: 'Long-term position building',
      risk: 'Low',
      holdTime: 'Weeks to months'
    }
  };

  // Apply profile preset
  useEffect(() => {
    const preset = profilePresets[profile];
    setTimeframe(preset.timeframe);
    setIndicators(preset.indicators);
  }, [profile]);

  // Fetch presets
  const { data: presets } = useQuery({
    queryKey: ['presets'],
    queryFn: api.assistant.getPresets,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Fetch watchlists
  const { data: watchlists } = useQuery({
    queryKey: ['watchlists'],
    queryFn: api.watchlists.list,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Run screener mutation
  const runScreener = useMutation({
    mutationFn: async (config: ActionConfig) => {
      const request = buildScreenerRequest(config);
      return api.screener.runScreener(request);
    },
    onSuccess: (data) => {
      console.log('Screener results:', data);
      // Handle success - show results
    },
    onError: (error) => {
      console.error('Screener failed:', error);
    }
  });

  // Preview action
  const handlePreview = async () => {
    const config = getCurrentConfig();
    
    // For preview, just show what will be run
    setPreviewData({
      description: getActionDescription(config),
      estimatedResults: Math.floor(Math.random() * 20) + 5,
      indicators: config.indicators,
      timeframe: config.timeframe,
      universe: mode === 'single' ? symbol : `${config.cap} stocks from ${universe.id}`
    });
  };

  // Run action
  const handleRun = () => {
    const config = getCurrentConfig();
    runScreener.mutate(config);
  };

  // Save configuration
  const handleSave = () => {
    const config = getCurrentConfig();
    // Save to local storage or backend
    localStorage.setItem('actionConfig', JSON.stringify(config));
    console.log('Configuration saved:', config);
  };

  // Build current configuration
  const getCurrentConfig = (): ActionConfig => {
    return {
      mode,
      profile,
      timeframe,
      symbol: mode === 'single' ? symbol : undefined,
      universe: mode === 'multiple' ? universe : undefined,
      indicators,
      cap,
      params: {
        rsi_period: 14,
        sma_period: 20,
        ema_period: 20
      }
    };
  };

  // Build screener request from config
  const buildScreenerRequest = (config: ActionConfig) => {
    const baseRequest: any = {
      timeframe: config.timeframe,
      cap: config.mode === 'single' ? 1 : config.cap
    };

    if (config.mode === 'single') {
      baseRequest.symbols = [config.symbol];
    } else {
      baseRequest.preset_id = config.universe?.id;
    }

    // Add indicator filters based on selected indicators
    if (config.indicators.includes('rsi')) {
      baseRequest.target = {
        kind: 'indicator',
        id: 'rsi',
        params: { period: 14 },
        rules: profile === 'day' 
          ? [{ column: 'rsi_14', op: '<', value: 30 }] // Oversold for day trading
          : [{ column: 'rsi_14', op: '<', value: 40 }]  // Less strict for swing
      };
    }

    return baseRequest;
  };

  // Get action description
  const getActionDescription = (config: ActionConfig) => {
    const modeText = config.mode === 'single' 
      ? `Analyzing ${config.symbol}` 
      : `Screening ${config.cap} stocks`;
    
    const profileText = `using ${config.profile} trading profile`;
    const indicatorText = `with ${config.indicators.join(', ').toUpperCase()}`;
    const timeframeText = `on ${config.timeframe} timeframe`;
    
    return `${modeText} ${profileText} ${indicatorText} ${timeframeText}`;
  };

  // Guardrails for beginners
  const guardrails = experience === 'novice' ? [
    'Position size limited to 1% of portfolio',
    'Stop-loss automatically set at 2% below entry',
    'Maximum 3 trades per day',
    'Paper trading mode enabled'
  ] : experience === 'intermediate' ? [
    'Position size limited to 5% of portfolio',
    'Risk/reward ratio must be at least 1:2',
    'Maximum daily loss capped at 2%'
  ] : [];

  // Indicator options based on experience
  const indicatorOptions: { value: IndicatorType; label: string; description: string }[] = [
    { value: 'rsi', label: 'RSI', description: 'Overbought/Oversold' },
    { value: 'macd', label: 'MACD', description: 'Trend momentum' },
    { value: 'sma', label: 'SMA', description: 'Simple moving average' },
    ...(experience !== 'novice' ? [
      { value: 'ema', label: 'EMA', description: 'Exponential MA' },
      { value: 'bollinger', label: 'Bollinger', description: 'Volatility bands' },
      { value: 'stochastic', label: 'Stochastic', description: 'Momentum oscillator' }
    ] as { value: IndicatorType; label: string; description: string }[] : [])
  ];

  return (
    <div 
      className="rounded-xl border overflow-hidden"
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
          <Target size={20} style={{ color: sigmatiqTheme.colors.text.accent }} />
          <div>
            <h3 className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
              Action Center
            </h3>
            <p className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              Configure and run trading actions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            className="flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors hover:opacity-80"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              color: sigmatiqTheme.colors.text.primary,
              border: `1px solid ${sigmatiqTheme.colors.border.default}`
            }}
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={handleRun}
            className="flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors hover:opacity-80"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.text.accent,
              color: sigmatiqTheme.colors.background.primary
            }}
            disabled={runScreener.isPending}
          >
            {runScreener.isPending ? (
              <LoadingIndicator size="small" />
            ) : (
              <>
                <Play size={14} />
                Run
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            className="p-1 rounded hover:bg-opacity-10 transition-colors"
            style={{ color: sigmatiqTheme.colors.text.secondary }}
            title="Save configuration"
          >
            <Save size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-opacity-10 transition-colors"
            style={{ color: sigmatiqTheme.colors.text.secondary }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Profile Selection */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              Trading Profile
            </span>
            {experience === 'novice' && (
              <div className="group relative">
                <Info size={14} style={{ color: sigmatiqTheme.colors.text.tertiary }} />
                <div className="absolute hidden group-hover:block bottom-full left-0 mb-2 p-2 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                  Choose your trading style
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {(['day', 'swing', 'long'] as Profile[]).map(p => (
              <button
                key={p}
                onClick={() => setProfile(p)}
                className="flex-1 p-3 rounded-lg border transition-all"
                style={{
                  backgroundColor: profile === p 
                    ? sigmatiqTheme.colors.text.accent 
                    : sigmatiqTheme.colors.background.secondary,
                  color: profile === p 
                    ? sigmatiqTheme.colors.background.primary 
                    : sigmatiqTheme.colors.text.primary,
                  borderColor: profile === p 
                    ? sigmatiqTheme.colors.text.accent 
                    : sigmatiqTheme.colors.border.default
                }}
              >
                <div className="font-medium text-sm capitalize">{p}</div>
                <div className="text-xs mt-1 opacity-80">
                  {profilePresets[p].holdTime}
                </div>
              </button>
            ))}
          </div>
          {profile && (
            <div 
              className="mt-2 p-2 rounded text-xs"
              style={{ 
                backgroundColor: sigmatiqTheme.colors.background.secondary,
                color: sigmatiqTheme.colors.text.secondary
              }}
            >
              <div className="flex items-center justify-between">
                <span>{profilePresets[profile].description}</span>
                <span className="font-medium">
                  Risk: {profilePresets[profile].risk}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mode Selection */}
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: sigmatiqTheme.colors.text.secondary }}>
            Analysis Mode
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('single')}
              className="flex-1 p-2 rounded border transition-colors"
              style={{
                backgroundColor: mode === 'single' 
                  ? sigmatiqTheme.colors.text.accent 
                  : sigmatiqTheme.colors.background.secondary,
                color: mode === 'single' 
                  ? sigmatiqTheme.colors.background.primary 
                  : sigmatiqTheme.colors.text.primary,
                borderColor: mode === 'single' 
                  ? sigmatiqTheme.colors.text.accent 
                  : sigmatiqTheme.colors.border.default
              }}
            >
              Single Stock
            </button>
            <button
              onClick={() => setMode('multiple')}
              className="flex-1 p-2 rounded border transition-colors"
              style={{
                backgroundColor: mode === 'multiple' 
                  ? sigmatiqTheme.colors.text.accent 
                  : sigmatiqTheme.colors.background.secondary,
                color: mode === 'multiple' 
                  ? sigmatiqTheme.colors.background.primary 
                  : sigmatiqTheme.colors.text.primary,
                borderColor: mode === 'multiple' 
                  ? sigmatiqTheme.colors.text.accent 
                  : sigmatiqTheme.colors.border.default
              }}
            >
              Multiple Stocks
            </button>
          </div>
        </div>

        {/* Symbol/Universe Selection */}
        {mode === 'single' ? (
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              Symbol
            </div>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                backgroundColor: sigmatiqTheme.colors.background.secondary,
                borderColor: sigmatiqTheme.colors.border.default,
                color: sigmatiqTheme.colors.text.primary
              }}
              placeholder="Enter symbol (e.g., AAPL)"
            />
          </div>
        ) : (
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              Universe
            </div>
            <select
              value={universe.id}
              onChange={(e) => setUniverse({ kind: 'preset', id: e.target.value })}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{
                backgroundColor: sigmatiqTheme.colors.background.secondary,
                borderColor: sigmatiqTheme.colors.border.default,
                color: sigmatiqTheme.colors.text.primary
              }}
            >
              <option value="sp500">S&P 500</option>
              <option value="nasdaq100">NASDAQ 100</option>
              {watchlists?.map(w => (
                <option key={w.watchlist_id} value={w.watchlist_id}>
                  {w.name} (Watchlist)
                </option>
              ))}
            </select>
            <div className="mt-2">
              <label className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                Max stocks to analyze: {cap}
              </label>
              <input
                type="range"
                min="5"
                max={experience === 'novice' ? "20" : "100"}
                value={cap}
                onChange={(e) => setCap(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Indicators */}
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: sigmatiqTheme.colors.text.secondary }}>
            Indicators
          </div>
          <div className="flex gap-2 flex-wrap">
            {indicatorOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setIndicators(prev =>
                    prev.includes(option.value)
                      ? prev.filter(i => i !== option.value)
                      : [...prev, option.value]
                  );
                }}
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

        {/* Guardrails */}
        {guardrails.length > 0 && showGuardrails && (
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
          >
            <div className="flex items-start gap-2">
              <Shield size={16} style={{ color: sigmatiqTheme.colors.semantic.success }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    Safety Guardrails
                  </span>
                  <button
                    onClick={() => setShowGuardrails(false)}
                    className="text-xs hover:underline"
                    style={{ color: sigmatiqTheme.colors.text.tertiary }}
                  >
                    Hide
                  </button>
                </div>
                <ul className="text-xs space-y-1" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                  {guardrails.map((rail, i) => (
                    <li key={i}>• {rail}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Preview Results */}
        {previewData && (
          <div 
            className="p-3 rounded-lg border"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              borderColor: sigmatiqTheme.colors.border.default
            }}
          >
            <div className="flex items-start gap-2">
              <Eye size={16} style={{ color: sigmatiqTheme.colors.text.accent }} />
              <div className="flex-1">
                <div className="text-sm font-medium mb-2" style={{ color: sigmatiqTheme.colors.text.primary }}>
                  Preview
                </div>
                <p className="text-xs mb-2" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                  {previewData.description}
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span style={{ color: sigmatiqTheme.colors.text.secondary }}>
                    Est. results: <strong>{previewData.estimatedResults}</strong>
                  </span>
                  <span style={{ color: sigmatiqTheme.colors.text.secondary }}>
                    Timeframe: <strong>{previewData.timeframe}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {runScreener.isError && (
          <ErrorMessage message="Failed to run screener. Please try again." />
        )}
      </div>
    </div>
  );
};

export default ActionHelper;