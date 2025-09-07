import React from 'react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import Logo from './Logo';
import MarketClock from './MarketClock';
import TickerBar from './TickerBar';
import useAppStore from '../stores/useAppStore';

/**
 * Optimized header component that doesn't cause re-renders
 * Uses memoized sub-components for timer and ticker
 */
const OptimizedHeader = React.memo(() => {
  const { toggleMobileMenu } = useAppStore();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50"
      style={{ 
        backgroundColor: sigmatiqTheme.colors.background.secondary,
        borderBottom: `1px solid ${sigmatiqTheme.colors.border.default}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Top bar with logo and market status */}
      <div 
        className="flex items-center justify-between px-3 lg:px-6 py-2"
      >
        <div className="flex items-center">
          {/* Logo - clickable on mobile to open menu */}
          {isMobile ? (
            <button
              onClick={toggleMobileMenu}
              className="flex items-center transition-all hover:opacity-80"
              aria-label="Toggle menu"
            >
              <Logo size="xs" variant="full" />
            </button>
          ) : (
            <Logo size="sm" variant="full" />
          )}
        </div>
        
        {/* Market clock - isolated component that updates independently */}
        <MarketClock />
      </div>

      {/* Ticker bar - uses CSS animations, not React re-renders */}
      <TickerBar />
    </header>
  );
});

OptimizedHeader.displayName = 'OptimizedHeader';

export default OptimizedHeader;