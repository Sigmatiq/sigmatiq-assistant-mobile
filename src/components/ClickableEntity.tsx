import React from 'react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import useAppStore from '../stores/useAppStore';

type EntityType = 'symbol' | 'indicator' | 'strategy' | 'pattern' | 'term';

interface ClickableEntityProps {
  type: EntityType;
  value: string;
  children: React.ReactNode;
  showPreview?: boolean;
  className?: string;
  onClick?: (value: string) => void;
}

const ClickableEntity: React.FC<ClickableEntityProps> = ({
  type,
  value,
  children,
  showPreview = true,
  className = '',
  onClick
}) => {
  const { setSelectedSymbol, setActiveView } = useAppStore();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onClick) {
      onClick(value);
      return;
    }

    // Default actions based on type
    switch (type) {
      case 'symbol':
        setSelectedSymbol(value);
        // Could also trigger panel or navigation
        break;
      case 'indicator':
        // TODO: Add indicator to current context
        console.log('Indicator clicked:', value);
        break;
      case 'strategy':
        // TODO: Show strategy details
        console.log('Strategy clicked:', value);
        break;
      case 'pattern':
        // TODO: Show pattern examples
        console.log('Pattern clicked:', value);
        break;
      case 'term':
        // TODO: Show educational content
        console.log('Term clicked:', value);
        break;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'symbol':
        return {
          color: sigmatiqTheme.colors.primary.teal,
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'all 0.2s',
          fontWeight: '500',
          '&:hover': {
            textDecoration: 'underline',
            filter: 'brightness(1.2)'
          }
        };
      
      case 'indicator':
        return {
          backgroundColor: sigmatiqTheme.colors.primary.golden + '20',
          color: sigmatiqTheme.colors.primary.golden,
          padding: '2px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'inline-block',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: sigmatiqTheme.colors.primary.golden + '30'
          }
        };
      
      case 'strategy':
        return {
          background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`,
          color: 'white',
          padding: '2px 12px',
          borderRadius: '9999px',
          cursor: 'pointer',
          display: 'inline-block',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        };
      
      case 'pattern':
        return {
          borderBottom: '1px dashed #06B6D4',
          color: '#06B6D4',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderBottomStyle: 'solid'
          }
        };
      
      case 'term':
        return {
          borderBottom: '1px dotted',
          borderColor: sigmatiqTheme.colors.text.muted,
          cursor: 'help',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: sigmatiqTheme.colors.text.secondary
          }
        };
      
      default:
        return {};
    }
  };

  const baseStyles = getStyles();

  return (
    <span
      className={`clickable-entity clickable-${type} ${className}`}
      onClick={handleClick}
      style={baseStyles}
      title={showPreview ? `Click to explore ${value}` : undefined}
      onMouseEnter={(e) => {
        // Apply hover styles
        const hoverStyles = baseStyles['&:hover'];
        if (hoverStyles) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        // Reset to base styles
        Object.assign(e.currentTarget.style, baseStyles);
      }}
    >
      {children}
    </span>
  );
};

export default ClickableEntity;