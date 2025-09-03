import { Menu, Bell, Search, Plus, X, Edit3 } from 'lucide-react';
import useAppStore from '../stores/useAppStore';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';

const MobileHeader = () => {
  const { toggleMobileMenu, marketStatus, setMarketStatus, watchlist, addToWatchlist, removeFromWatchlist } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddTicker, setShowAddTicker] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [editMode, setEditMode] = useState(false);

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

  return (
    <header 
      className="border-b safe-top"
      style={{
        backgroundColor: sigmatiqTheme.colors.background.secondary,
        borderColor: sigmatiqTheme.colors.border.default
      }}
    >
      <div className="px-4 py-3">
        {/* Top Row */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="touch-target flex items-center justify-center rounded-lg transition-all"
              style={{ color: sigmatiqTheme.colors.text.secondary }}
            >
              <Menu className="w-6 h-6" />
            </button>
            <Logo size="sm" variant="full" />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
              {formatTime(currentTime)}
            </span>
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: getStatusColor() }}
            />
          </div>

          <div className="flex gap-2">
            <button 
              className="touch-target flex items-center justify-center rounded-lg transition-all"
              style={{ color: sigmatiqTheme.colors.text.secondary }}
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              className="touch-target flex items-center justify-center rounded-lg transition-all"
              style={{ color: sigmatiqTheme.colors.text.secondary }}
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Market Ticker Row - Auto-scrolling */}
        <div className="relative overflow-hidden -mx-4">
          <div 
            className={`flex gap-4 text-xs whitespace-nowrap ${!editMode && watchlist.length > 0 ? 'ticker-scroll' : ''}`}
            style={{
              paddingRight: editMode ? '0' : '100%'
            }}
          >
            {/* Control buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddTicker(true)}
                className="flex items-center gap-1 px-2 py-1 rounded transition-all"
                style={{ 
                  backgroundColor: sigmatiqTheme.colors.primary.teal + '20',
                  color: sigmatiqTheme.colors.primary.teal,
                  border: `1px solid ${sigmatiqTheme.colors.primary.teal}40`
                }}
              >
                <Plus className="w-3 h-3" />
                <span className="font-semibold">ADD</span>
              </button>
              
              {/* Edit mode toggle - only show on touch devices */}
              {'ontouchstart' in window && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-1 px-2 py-1 rounded transition-all"
                  style={{ 
                    backgroundColor: editMode ? sigmatiqTheme.colors.status.error + '20' : 'transparent',
                    color: editMode ? sigmatiqTheme.colors.status.error : sigmatiqTheme.colors.text.secondary,
                    border: `1px solid ${editMode ? sigmatiqTheme.colors.status.error : sigmatiqTheme.colors.border.default}`
                  }}
                >
                  <Edit3 className="w-3 h-3" />
                  <span className="font-semibold">{editMode ? 'DONE' : 'EDIT'}</span>
                </button>
              )}
            </div>
            
            {/* Default market indices */}
            <MarketTicker symbol="SPY" price="452.35" change="+0.48%" isPositive={true} />
            <MarketTicker symbol="QQQ" price="382.60" change="-0.33%" isPositive={false} />
            
            {/* User's watchlist (excluding SPY and QQQ as they're shown above) */}
            {watchlist.filter(s => s !== 'SPY' && s !== 'QQQ').map(symbol => (
              <MarketTicker 
                key={symbol}
                symbol={symbol} 
                price={getRandomPrice(symbol)} 
                change={getRandomChange()} 
                isPositive={Math.random() > 0.5}
                onRemove={() => removeFromWatchlist(symbol)}
                forceShowRemove={editMode}
              />
            ))}
            
            {/* Duplicate for seamless scrolling */}
            <button
              onClick={() => setShowAddTicker(true)}
              className="flex items-center gap-1 px-2 py-1 rounded transition-all"
              style={{ 
                backgroundColor: sigmatiqTheme.colors.primary.teal + '20',
                color: sigmatiqTheme.colors.primary.teal,
                border: `1px solid ${sigmatiqTheme.colors.primary.teal}40`
              }}
            >
              <Plus className="w-3 h-3" />
              <span className="font-semibold">ADD</span>
            </button>
            
            <MarketTicker symbol="SPY" price="452.35" change="+0.48%" isPositive={true} />
            <MarketTicker symbol="QQQ" price="382.60" change="-0.33%" isPositive={false} />
            
            {watchlist.filter(s => s !== 'SPY' && s !== 'QQQ').map((symbol, idx) => (
              <MarketTicker 
                key={`${symbol}-dup-${idx}`}
                symbol={symbol} 
                price={getRandomPrice(symbol)} 
                change={getRandomChange()} 
                isPositive={Math.random() > 0.5}
                onRemove={() => removeFromWatchlist(symbol)}
              />
            ))}
          </div>
        </div>
        
        {/* Add ticker modal */}
        {showAddTicker && (
          <div 
            className="absolute top-full left-0 right-0 bg-black/50 z-50"
            style={{ minHeight: '100px' }}
            onClick={() => setShowAddTicker(false)}
          >
            <div 
              className="mx-4 mt-2 p-3 rounded-lg shadow-lg"
              style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                  Add Ticker to Watchlist
                </span>
                <button
                  onClick={() => {
                    setShowAddTicker(false);
                    setNewTicker('');
                  }}
                  className="p-1 rounded hover:bg-gray-700 transition-colors"
                  style={{ color: sigmatiqTheme.colors.text.secondary }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
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
                  className="flex-1 px-3 py-2 rounded text-sm"
                  style={{ 
                    backgroundColor: sigmatiqTheme.colors.background.primary,
                    color: sigmatiqTheme.colors.text.primary,
                    border: `1px solid ${sigmatiqTheme.colors.border.default}`
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
                  className="px-4 py-2 rounded text-sm font-medium transition-opacity"
                  style={{ 
                    backgroundColor: newTicker ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.primary.teal + '60',
                    color: 'white',
                    cursor: newTicker ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!newTicker}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
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

const MarketTicker = ({ 
  symbol, 
  price, 
  change, 
  isPositive,
  onRemove,
  forceShowRemove = false
}: { 
  symbol: string; 
  price: string; 
  change: string; 
  isPositive: boolean;
  onRemove?: () => void;
  forceShowRemove?: boolean;
}) => {
  const [showRemove, setShowRemove] = useState(false);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Handle long press for mobile
  const handleTouchStart = () => {
    if (onRemove) {
      const timer = setTimeout(() => {
        setShowRemove(true);
      }, 500); // 500ms long press
      setTouchTimer(timer);
    }
  };
  
  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };
  
  return (
    <div 
      className="flex items-center gap-2 whitespace-nowrap relative select-none"
      onMouseEnter={() => setShowRemove(true)}
      onMouseLeave={() => setShowRemove(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={() => {
        // On mobile, toggle remove button on tap (if ticker is removable)
        if (onRemove && 'ontouchstart' in window) {
          setShowRemove(!showRemove);
        }
      }}
    >
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
      {onRemove && (showRemove || forceShowRemove) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
            setShowRemove(false);
          }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
          style={{ 
            backgroundColor: sigmatiqTheme.colors.status.error,
            border: '2px solid white'
          }}
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}
    </div>
  );
};

export default MobileHeader;