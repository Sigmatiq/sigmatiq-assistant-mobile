// SIGMATIQ Brand Theme Configuration - Official Colors
export const sigmatiqTheme = {
  colors: {
    // Primary brand colors (from official SIGMATIQ branding)
    primary: {
      teal: '#1ABC9C',         // Primary SIGMATIQ teal
      tealLight: '#48C9B0',    // Light variant
      tealDark: '#16A085',     // Dark variant
      golden: '#F59E0B',       // SIGMATIQ golden accent
      gradient: 'linear-gradient(135deg, #1ABC9C 0%, #16A085 100%)',
      gradientHorizontal: 'linear-gradient(90deg, #1ABC9C 0%, #16A085 100%)',
    },
    
    // Market status colors
    market: {
      open: '#10B981', // Green
      closed: '#EF4444', // Red
      preMarket: '#F59E0B', // Orange
      afterHours: '#3B82F6', // Blue
    },
    
    // Status colors (from SIGMATIQ brand)
    status: {
      success: '#00C4A7',  // SIGMATIQ success
      warning: '#FFB800',  // SIGMATIQ warning
      error: '#FF5757',    // SIGMATIQ error
      info: '#3B82F6',
    },
    
    // Neutral colors
    neutral: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },
    
    // Background colors for dark theme (SIGMATIQ official)
    background: {
      primary: '#0A1414',   // sq-dark: Main background
      secondary: '#0F1A1A', // sq-surface: Card background
      tertiary: '#1A2F2F',  // sq-surface-2: Elevated elements
      card: '#0F1A1A',      // explicit card surface (alias of secondary)
      hover: '#2A3F3F',     // sq-border: Hover state
    },
    
    // Text colors (SIGMATIQ official)
    text: {
      primary: '#F5F5F7',     // sq-text: Primary text
      secondary: '#8FA5A5',   // sq-text-secondary: Secondary text
      muted: '#6A8080',       // sq-text-muted: Muted text
      accent: '#1ABC9C',      // SIGMATIQ teal accent
    },
    
    // Border colors (SIGMATIQ official)
    border: {
      default: '#2A3F3F',     // sq-border
      hover: 'rgba(26, 188, 156, 0.3)',  // Teal glow on hover
      focus: '#1ABC9C',       // Teal focus
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(26, 188, 156, 0.3)',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

export default sigmatiqTheme;
