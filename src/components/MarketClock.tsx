import React, { useState, useEffect } from 'react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import useAppStore from '../stores/useAppStore';

/**
 * Isolated Market Clock component that updates every second
 * without causing parent re-renders
 */
const MarketClock = React.memo(() => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { marketStatus, setMarketStatus } = useAppStore();

  useEffect(() => {
    const updateMarketStatus = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      
      let newStatus: 'closed' | 'open' | 'pre-market' | 'after-hours';
      
      if (day === 0 || day === 6) {
        newStatus = 'closed';
      } else if (hour >= 9.5 && hour < 16) {
        newStatus = 'open';
      } else if (hour >= 4 && hour < 9.5) {
        newStatus = 'pre-market';
      } else if (hour >= 16 && hour < 20) {
        newStatus = 'after-hours';
      } else {
        newStatus = 'closed';
      }
      
      // Only update if status actually changed
      if (newStatus !== marketStatus) {
        setMarketStatus(newStatus);
      }
    };

    // Update immediately
    updateMarketStatus();
    
    // Then check every minute (not every second!)
    const timer = setInterval(updateMarketStatus, 60000);

    // Update time display every second (local state only)
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(clockTimer);
    };
  }, [marketStatus, setMarketStatus]);

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

  const getStatusLabel = () => {
    switch (marketStatus) {
      case 'open': return 'MARKET OPEN';
      case 'pre-market': return 'PRE-MARKET';
      case 'after-hours': return 'AFTER HOURS';
      default: return 'MARKET CLOSED';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div 
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase"
        style={{ 
          backgroundColor: getStatusColor() + '20',
          color: getStatusColor()
        }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ 
            backgroundColor: getStatusColor(),
            animation: marketStatus === 'open' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
          }}
        />
        {getStatusLabel()}
      </div>
      <span className="text-xs font-medium" style={{ color: sigmatiqTheme.colors.text.secondary }}>
        {formatTime(currentTime)} ET
      </span>
    </div>
  );
});

MarketClock.displayName = 'MarketClock';

export default MarketClock;