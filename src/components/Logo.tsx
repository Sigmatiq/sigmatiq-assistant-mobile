import React from 'react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'bubble';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'full', 
  className = '',
  showText = true 
}) => {
  const sizes = {
    xs: { width: 100, height: 20, iconSize: 20, fontSize: '12px', tagSize: '8px' },
    sm: { width: 120, height: 24, iconSize: 24, fontSize: '14px', tagSize: '9px' },
    md: { width: 160, height: 32, iconSize: 32, fontSize: '18px', tagSize: '10px' },
    lg: { width: 200, height: 48, iconSize: 48, fontSize: '24px', tagSize: '12px' }
  };

  const currentSize = sizes[size];

  // Use the official assistant logo bubble for icon variant
  if (variant === 'bubble') {
    return (
      <img 
        src="/assistant-logo-bubble.svg" 
        alt="SIGMATIQ Assistant" 
        className={className}
        style={{ 
          height: currentSize.iconSize,
          width: 'auto'
        }}
      />
    );
  }

  // Pixel grid logo (3x3 grid representing SIGMA)
  const renderPixelGrid = () => {
    const pixelSize = currentSize.iconSize / 3.5;
    const gap = pixelSize * 0.15;
    
    return (
      <div 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ 
          width: currentSize.iconSize, 
          height: currentSize.iconSize,
          background: sigmatiqTheme.colors.background.secondary,
          borderRadius: '8px',
          padding: `${pixelSize * 0.25}px`,
          boxShadow: sigmatiqTheme.shadows.glow
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: `${gap}px`,
        }}>
          {/* Top row - all teal */}
          <div style={{ width: pixelSize, height: pixelSize, background: sigmatiqTheme.colors.primary.teal, borderRadius: '2px' }} />
          <div style={{ width: pixelSize, height: pixelSize, background: sigmatiqTheme.colors.primary.teal, borderRadius: '2px' }} />
          <div style={{ width: pixelSize, height: pixelSize, background: sigmatiqTheme.colors.primary.teal, borderRadius: '2px' }} />
          
          {/* Middle row - teal, golden, teal */}
          <div style={{ width: pixelSize, height: pixelSize, background: sigmatiqTheme.colors.primary.tealLight, borderRadius: '2px' }} />
          <div style={{ width: pixelSize, height: pixelSize, background: sigmatiqTheme.colors.primary.golden, borderRadius: '2px' }} />
          <div style={{ width: pixelSize, height: pixelSize, background: sigmatiqTheme.colors.primary.tealLight, borderRadius: '2px' }} />
          
          {/* Bottom row - all dark teal */}
          <div style={{ width: pixelSize, height: pixelSize, background: sigmatiqTheme.colors.primary.tealDark, borderRadius: '2px' }} />
          <div style={{ width: pixelSize, height: pixelSize, background: sigmatiqTheme.colors.primary.tealDark, borderRadius: '2px' }} />
          <div style={{ width: pixelSize, height: pixelSize, background: sigmatiqTheme.colors.primary.tealDark, borderRadius: '2px' }} />
        </div>
      </div>
    );
  };

  if (variant === 'icon') {
    return renderPixelGrid();
  }

  // Full logo with text
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {renderPixelGrid()}
      {showText && (
        <div className="flex flex-col">
          <span 
            style={{ 
              fontSize: currentSize.fontSize,
              fontWeight: 700,
              color: sigmatiqTheme.colors.text.primary,
              letterSpacing: '1px',
              lineHeight: 1
            }}
          >
            SIGMATIQ
          </span>
          <span 
            style={{ 
              fontSize: currentSize.tagSize,
              color: sigmatiqTheme.colors.text.secondary,
              letterSpacing: '1px',
              marginTop: '2px',
              fontWeight: 600
            }}
          >
            ASSISTANT
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;