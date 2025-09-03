import { Bell, Search, Settings, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import useAppStore from '../stores/useAppStore';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';

const DesktopHeader = () => {
  const { marketStatus, setMarketStatus, watchlist, addToWatchlist, removeFromWatchlist, activeView } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddTicker, setShowAddTicker] = useState(false);
  const [newTicker, setNewTicker] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simple market status logic
      const hour = new Date().getHours();
      const day = new Date().getDay();
      
      if (day === 0 || day === 6) {
        setMarketStatus('closed');
      } else if (hour >= 9.5 && hour < 16) {
        setMarketStatus('open');
      } else if (hour >= 4 && hour < 9.5) {
        setMarketStatus('pre-market');
      } else if (hour >= 16 && hour < 20) {
        setMarketStatus('after-hours');
      } else {
        setMarketStatus('closed');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [setMarketStatus]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
  };

  const getStatusColor = () => {
    switch (marketStatus) {
      case 'open': return sigmatiqTheme.colors.market.open;
      case 'pre-market': return sigmatiqTheme.colors.market.preMarket;
      case 'after-hours': return sigmatiqTheme.colors.market.afterHours;
      default: return sigmatiqTheme.colors.market.closed;
    }
  };

  const getStatusText = () => {
    switch (marketStatus) {
      case 'open': return 'Market Open';
      case 'pre-market': return 'Pre-Market';
      case 'after-hours': return 'After Hours';
      default: return 'Market Closed';
    }
  };

  // Helper functions for demo prices
  const getRandomPrice = (symbol: string) => {
    const prices: Record<string, string> = {
      AAPL: '178.25',
      MSFT: '405.80',
      GOOGL: '142.50',
      AMZN: '145.20',
      NVDA: '485.60',
      TSLA: '238.45',
      META: '512.35',
    };
    return prices[symbol] || (Math.random() * 500).toFixed(2);
  };

  const getRandomChange = () => {
    const change = (Math.random() * 5 - 2.5).toFixed(2);
    return change.startsWith('-') ? change + '%' : '+' + change + '%';
  };

  return (
    <header 
      className="border-b"
      style={{ 
        backgroundColor: sigmatiqTheme.colors.background.secondary,
        borderColor: sigmatiqTheme.colors.border.default 
      }}
    >
      {/* Top bar with page title and actions */}
      <div className="px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold capitalize" style={{ color: sigmatiqTheme.colors.text.primary }}>
            {activeView}
          </h2>
          
          {/* Market Status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full" 
            style={{ 
              backgroundColor: getStatusColor() + '20',
              border: `1px solid ${getStatusColor()}40`
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor() }} />
            <span className="text-sm font-medium" style={{ color: getStatusColor() }}>
              {getStatusText()}
            </span>
            <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button 
            className="p-2 rounded-lg transition-all hover:bg-gray-700"
            style={{ color: sigmatiqTheme.colors.text.secondary }}
          >
            <Search className="w-5 h-5" />
          </button>
          
          {/* Notifications */}
          <button 
            className="p-2 rounded-lg transition-all hover:bg-gray-700 relative"
            style={{ color: sigmatiqTheme.colors.text.secondary }}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          
          {/* Settings */}
          <button 
            className="p-2 rounded-lg transition-all hover:bg-gray-700"
            style={{ color: sigmatiqTheme.colors.text.secondary }}
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {/* User Profile */}
          <button 
            className="p-2 rounded-lg transition-all hover:bg-gray-700"
            style={{ color: sigmatiqTheme.colors.text.secondary }}
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Market Ticker Bar - Desktop version */}
      <div 
        className="px-6 py-2 overflow-x-auto border-t flex gap-4"
        style={{ 
          backgroundColor: sigmatiqTheme.colors.background.primary,
          borderColor: sigmatiqTheme.colors.border.default,
          fontSize: '13px'
        }}
      >
        {/* Add ticker button */}
        <button
          onClick={() => setShowAddTicker(!showAddTicker)}
          className="flex items-center gap-1 px-3 py-1 rounded transition-all hover:opacity-80"
          style={{ 
            backgroundColor: sigmatiqTheme.colors.primary.teal + '20',
            color: sigmatiqTheme.colors.primary.teal,
            border: `1px solid ${sigmatiqTheme.colors.primary.teal}40`,
            minWidth: 'fit-content'
          }}
        >
          <span className="font-semibold">+ Add Ticker</span>
        </button>

        {/* Market Indices */}
        <div className="flex items-center gap-3 px-3 py-1 rounded" 
          style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
        >
          <span className="font-bold" style={{ color: sigmatiqTheme.colors.text.muted }}>INDICES</span>
          <TickerItem symbol="SPY" price="452.35" change="+0.48%" isPositive={true} />
          <TickerItem symbol="QQQ" price="382.60" change="-0.33%" isPositive={false} />
          <TickerItem symbol="DIA" price="385.20" change="+0.22%" isPositive={true} />
        </div>

        {/* User Watchlist */}
        <div className="flex items-center gap-3 px-3 py-1 rounded" 
          style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
        >
          <span className="font-bold" style={{ color: sigmatiqTheme.colors.text.muted }}>WATCHLIST</span>
          {watchlist.filter(s => s !== 'SPY' && s !== 'QQQ').map(symbol => (
            <TickerItem 
              key={symbol}
              symbol={symbol} 
              price={getRandomPrice(symbol)} 
              change={getRandomChange()} 
              isPositive={Math.random() > 0.5}
              onRemove={() => removeFromWatchlist(symbol)}
            />
          ))}
        </div>
      </div>

      {/* Add ticker input - shows below ticker bar */}
      {showAddTicker && (
        <div 
          className="px-6 py-3 border-t flex gap-2"
          style={{ 
            backgroundColor: sigmatiqTheme.colors.background.primary,
            borderColor: sigmatiqTheme.colors.border.default 
          }}
        >
          <input
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTicker) {
                addToWatchlist(newTicker);
                setNewTicker('');
                setShowAddTicker(false);
              } else if (e.key === 'Escape') {
                setShowAddTicker(false);
                setNewTicker('');
              }
            }}
            placeholder="Enter ticker symbol (e.g., GOOGL)"
            className="px-3 py-1.5 rounded text-sm"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              color: sigmatiqTheme.colors.text.primary,
              border: `1px solid ${sigmatiqTheme.colors.border.default}`,
              width: '200px'
            }}
            autoFocus
          />
          <button
            onClick={() => {
              if (newTicker) {
                addToWatchlist(newTicker);
                setNewTicker('');
                setShowAddTicker(false);
              }
            }}
            className="px-4 py-1.5 rounded text-sm font-medium transition-opacity"
            style={{ 
              backgroundColor: newTicker ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.primary.teal + '60',
              color: 'white',
              cursor: newTicker ? 'pointer' : 'not-allowed'
            }}
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowAddTicker(false);
              setNewTicker('');
            }}
            className="px-4 py-1.5 rounded text-sm font-medium transition-opacity"
            style={{ 
              backgroundColor: 'transparent',
              color: sigmatiqTheme.colors.text.secondary,
              border: `1px solid ${sigmatiqTheme.colors.border.default}`
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </header>
  );
};

// Individual ticker item for desktop
const TickerItem = ({ 
  symbol, 
  price, 
  change, 
  isPositive,
  onRemove
}: { 
  symbol: string; 
  price: string; 
  change: string; 
  isPositive: boolean;
  onRemove?: () => void;
}) => {
  return (
    <div className="flex items-center gap-2 group relative">
      <span className="font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
        {symbol}
      </span>
      <span style={{ color: sigmatiqTheme.colors.text.secondary }}>
        ${price}
      </span>
      <span style={{ 
        color: isPositive ? sigmatiqTheme.colors.status.success : sigmatiqTheme.colors.status.error 
      }}>
        {change}
      </span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
          style={{ color: sigmatiqTheme.colors.text.muted }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default DesktopHeader;