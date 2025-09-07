# Sigmatiq Assistant Mobile - Consolidated Understanding Document

## 🎯 Purpose
This document serves as a comprehensive reference for understanding and working on the Sigmatiq Assistant Mobile application. It consolidates project structure, requirements, patterns, and implementation guidelines.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Core Concepts](#core-concepts)
5. [Trading Profiles & Requirements](#trading-profiles--requirements)
6. [Helper System Architecture](#helper-system-architecture)
7. [API Integration Patterns](#api-integration-patterns)
8. [State Management](#state-management)
9. [Component Patterns](#component-patterns)
10. [Implementation Guidelines](#implementation-guidelines)

---

## 🌟 Project Overview

**Sigmatiq Assistant Mobile** is an **analysis-only** trading application focused on:
- Market research and technical analysis
- Stock discovery and screening
- Educational content for traders
- Multi-profile support (Day Trading, Swing Trading, Options, Long-term Investing)
- Three experience levels (Beginner, Intermediate, Advanced)

### Key Principles
- **Mobile-first design** with responsive layouts
- **Beginner-first approach** with progressive disclosure
- **Context-aware interfaces** that adapt to user needs
- **Analysis-only** (no portfolio tracking or trading execution)

---

## 💻 Tech Stack

```javascript
{
  "frontend": {
    "framework": "React 19.1.1",
    "language": "TypeScript 5.8.3",
    "build": "Vite 7.1.2",
    "styling": "Tailwind CSS 3.4.17",
    "state": "Zustand 5.0.8",
    "data": "TanStack Query 5.85.9",
    "ui": "Radix UI",
    "animations": "Framer Motion 12.23.12",
    "icons": "Lucide React 0.542.0"
  },
  "api": {
    "client": "Axios 1.11.0",
    "realtime": "Socket.io Client 4.8.1"
  },
  "dev": {
    "port": 3001,
    "proxy": {
      "/api/core": "http://localhost:8050",
      "/api/assistant": "http://localhost:8090"
    }
  }
}
```

---

## 📁 Project Structure

```
src/
├── api/                      # API Layer
│   ├── client.ts            # Axios instances & API methods
│   ├── queries.ts           # TanStack Query hooks
│   └── types.ts             # TypeScript interfaces
│
├── components/              # UI Components
│   ├── layouts/            # Layout components
│   │   └── MobileLayout.tsx
│   ├── helpers/            # Specialized helper interfaces
│   │   ├── ChartingHelper.tsx
│   │   ├── ActionHelper.tsx
│   │   ├── LearningHelper.tsx
│   │   ├── StockInfoHelper.tsx
│   │   └── AssistantHelper.tsx
│   ├── AssistantPanel.tsx  # Context-aware assistant
│   ├── MobileHeader.tsx    # Top navigation
│   ├── MobileNav.tsx       # Bottom/side navigation
│   └── [various].tsx       # Other components
│
├── pages/                   # Page Components
│   ├── Dashboard.tsx       # Main dashboard (to be enhanced)
│   └── Chat.tsx           # AI assistant chat
│
├── stores/                  # State Management
│   └── useAppStore.ts      # Zustand global store
│
├── styles/                  # Styling
│   └── sigmatiq-theme.ts   # Design system tokens
│
└── App.tsx                  # Root component
```

---

## 🔑 Core Concepts

### 1. Navigation System
- **5 Main Views**: Dashboard, Chat, Screener, Charts, Settings
- **Responsive Navigation**:
  - Mobile: Bottom navigation bar
  - Tablet: Side navigation panel
  - Desktop: Fixed sidebar

### 2. Responsive Breakpoints
```css
/* Mobile: < 768px */
/* Tablet: 768px - 1280px */
/* Desktop: > 1280px */
```

### 3. Design System (sigmatiq-theme)
```typescript
{
  colors: {
    primary: { teal, coral },
    background: { primary, secondary, tertiary, card },
    text: { primary, secondary, muted, accent },
    status: { success, error, warning, info },
    border: { default, active }
  },
  shadows: { sm, md, lg, glow }
}
```

---

## 📊 Trading Profiles & Requirements

### Four Trading Profiles

#### 1. Day Trading
**Focus**: Intraday movements, real-time data
**Key Metrics**: RVOL, VWAP, Spread, Session Range
**Cards** (7 total):
- Watchlist with intraday metrics
- Top Opportunities (score/coverage/reliability)
- Focus Symbol (mini overview)
- Market Breadth (A/D, volume)
- Top Gainers/Losers
- Today's Calendar
- Alerts Inbox

#### 2. Swing Trading
**Focus**: Multi-day positions, trend analysis
**Key Metrics**: 1-5 day returns, ATR%, Gap analysis
**Cards** (6 total):
- Watchlist with multi-day metrics
- Top Opportunities with entry/stop/targets
- Focus Symbol with trend/S&R
- Market Pulse (sector rotation)
- Events Calendar (2-week view)
- Alerts Inbox

#### 3. Options Trading
**Focus**: Derivatives, volatility, Greeks
**Key Metrics**: IV Rank, Expected Move, Skew
**Cards** (6 total):
- Watchlist with IV metrics
- Strategy Ideas (spreads)
- Focus Underlying (expected move cone)
- IV Pulse (term structure)
- Events & Movers
- Alerts Inbox

#### 4. Long-Term Investing
**Focus**: Fundamentals, valuation
**Key Metrics**: P/E, Growth rates, Dividends
**Cards** (6 total):
- Watchlist with valuation metrics
- Top Opportunities with thesis
- Focus Company (financials)
- Research Feed (news/filings)
- Sector/Factor Pulse
- Calendar (quarterly events)

### Three Experience Levels

#### Beginner
- Safe defaults, clear explanations
- Analysis-only actions
- Basic liquidity badges
- Reliability/coverage prominently shown

#### Intermediate
- Additional data density
- More metrics and indicators
- Liquidity scores
- Trend/regime tags

#### Advanced/Pro
- Rich information display
- Indicator breakdowns
- Expected slippage details
- Correlation analysis

### Canonical Signal Schema
```typescript
{
  score: number,          // -100 to +100
  coverage: number,       // 0-100%
  reliability: number,    // 0-100%
  indicators_used: number,
  total_indicators: number,
  regime: 'trend' | 'range' | 'volatile'
}
```

---

## 🚀 Helper System Architecture

### Helper Components
1. **ChartingHelper** - Technical analysis and charting
2. **ActionHelper** - Quick actions (screeners, alerts)
3. **LearningHelper** - Educational content
4. **StockInfoHelper** - Comprehensive stock info
5. **AssistantHelper** - AI-powered assistance

### Context Management
```typescript
interface HelperContext {
  symbol?: string;
  source?: 'panel' | 'chat' | 'search' | 'floating-button';
  trigger?: string;
  topic?: string;
  tradingProfile?: 'day' | 'swing' | 'options' | 'investing';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
}
```

### Responsive Helper Display

#### Mobile (<768px)
- Floating Action Button (FAB)
- Bottom drawer (85vh max)
- Full-width interface

#### Tablet (768-1280px)
- Fixed side panel (450px wide)
- Embedded StockInfoPanel
- Context-specific sections

#### Desktop (>1280px)
- Centered modal (90vw, max 1400px)
- Side panel with quick actions
- Multi-column layouts

### Helper Action Pattern
```typescript
const handleHelperAction = (action: string, data?: any) => {
  switch(action) {
    case 'runScreener':
      setActiveView('screener');
      clearHelper();
      break;
    case 'viewChart':
      setActiveHelper('charting');
      setHelperContext({ symbol: data.symbol });
      break;
    // ... other actions
  }
}
```

---

## 🔌 API Integration Patterns

### API Client Structure
```typescript
// Development: Uses proxy paths
// Production: Uses configured base URL
const buildApiPath = (service: 'core' | 'assistant', path: string) => {
  if (isDevelopment) {
    return `/api/${service}${path}`;
  }
  return `${API_BASE_URL}${path}`;
};
```

### API Organization
```typescript
export const api = {
  market: {
    getMarketBreadth: async () => {...},
    getMarketSummary: async (symbols: string[]) => {...},
    getChartData: async (symbol, timeframe, limit) => {...}
  },
  screener: {
    runScreener: async (request) => {...},
    getTopMovers: async () => {...}
  },
  assistant: {
    ask: async (query, mode) => {...},
    getInsights: async () => {...}
  }
}
```

### TanStack Query Patterns
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['marketBreadth'],
  queryFn: api.market.getMarketBreadth,
  refetchInterval: marketStatus === 'open' ? 120000 : false,
  staleTime: 60000,
  retry: 2
});
```

---

## 🗂️ State Management

### Zustand Store Structure
```typescript
interface AppState {
  // User
  user: User | null;
  experience: 'novice' | 'intermediate' | 'power';
  
  // Navigation
  activeView: 'dashboard' | 'chat' | 'screener' | 'charts' | 'settings';
  isMobileMenuOpen: boolean;
  
  // Helper State
  activeHelper: HelperType | null;
  helperContext: HelperContext;
  
  // Market Data
  watchlist: string[];
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
  selectedSymbol: string | null;
  
  // UI State
  theme: 'dark' | 'light' | 'auto';
  chatContext: ChatContext;
}
```

### Persistent State
```typescript
// Only persists essential user preferences
persist: ['user', 'experience', 'watchlist', 'theme']
```

---

## 🧩 Component Patterns

### Card Component Pattern
```typescript
const DashboardCard = ({ title, icon: Icon, content, actions }) => (
  <div className="rounded-xl p-4 border" style={{
    backgroundColor: sigmatiqTheme.colors.background.secondary,
    borderColor: sigmatiqTheme.colors.border.default
  }}>
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-base font-semibold">{title}</h3>
      <Icon className="w-4 h-4" />
    </div>
    <div>{content}</div>
    {actions && <div className="mt-3">{actions}</div>}
  </div>
);
```

### Clickable Entity Pattern
```typescript
<ClickableEntity type="symbol" value="AAPL">
  $AAPL
</ClickableEntity>
// Types: symbol, indicator, term, pattern
```

### Loading States
```typescript
<LoadingIndicator message="Loading data" size="small" />
```

### Error Handling
```typescript
<ErrorMessage 
  error={error} 
  onRetry={() => refetch()} 
/>
```

---

## 📝 Implementation Guidelines

### 1. Adding New Dashboard Profiles

```typescript
// 1. Extend store with profile selection
interface AppState {
  tradingProfile: 'day' | 'swing' | 'options' | 'investing';
  setTradingProfile: (profile) => void;
}

// 2. Create profile-specific dashboard component
const DayTradingDashboard = () => {
  // Profile-specific cards and layout
};

// 3. Add profile switcher to Dashboard.tsx
const Dashboard = () => {
  const { tradingProfile } = useAppStore();
  
  switch(tradingProfile) {
    case 'day': return <DayTradingDashboard />;
    case 'swing': return <SwingTradingDashboard />;
    // ... etc
  }
};
```

### 2. Adding New Helper

```typescript
// 1. Create helper component in components/helpers/
const NewHelper = ({ context, onClose, onAction }) => {
  // Helper implementation
};

// 2. Add to AssistantPanel lazy imports
const NewHelper = lazy(() => import('./helpers/NewHelper'));

// 3. Add case to HelperModal rendering
{activeHelper === 'new' && <NewHelper {...props} />}
```

### 3. API Endpoint Addition

```typescript
// 1. Add to api/client.ts
export const newApi = {
  getData: async (params) => {
    const response = await apiClient.get(
      buildApiPath('assistant', '/new/endpoint'),
      { params }
    );
    return response.data;
  }
};

// 2. Create query hook in api/queries.ts
export const useNewDataQuery = (params) => {
  return useQuery({
    queryKey: ['newData', params],
    queryFn: () => newApi.getData(params),
    staleTime: 60000
  });
};
```

### 4. Performance Considerations
- Use React.memo for expensive components
- Lazy load helpers and non-critical components
- Implement virtual scrolling for long lists
- Cache API responses with TanStack Query
- Debounce user inputs and API calls

### 5. Mobile Optimization
- Touch targets minimum 44x44px
- Bottom sheets for mobile interactions
- Swipe gestures for navigation
- Optimize images and assets
- Progressive loading strategies

### 6. Testing Approach
- Unit tests for utility functions
- Component testing with React Testing Library
- E2E tests with Playwright
- Visual regression testing
- Performance monitoring

---

## 🚦 Rules of Engagement Reference

Always follow the Rules of Engagement:
1. **Discuss first, implement after agreement**
2. **Beginner trader focus first**
3. **Testing is critical** - unit and automated tests required
4. **One point at a time** in discussions
5. **Small, reviewable changes**
6. **4-persona review** before PR:
   - Professional Trader: Does it add edge?
   - Senior Architect: Is design coherent?
   - Senior Developer: Is code clean and tested?
   - Beginner Trader: Is it explainable simply?

---

## 🔄 Next Steps for Dashboard Enhancement

1. **Phase 1**: Profile Selection UI
   - Add profile switcher to header
   - Store profile preference
   - Create base dashboard components

2. **Phase 2**: Implement Day Trading Dashboard
   - Create 7 required cards
   - Integrate with existing APIs
   - Add real-time updates

3. **Phase 3**: Add Other Profiles
   - Swing Trading Dashboard
   - Options Trading Dashboard
   - Long-term Investing Dashboard

4. **Phase 4**: Experience Level Integration
   - Add experience level switcher
   - Implement progressive disclosure
   - Add contextual help

5. **Phase 5**: Helper Integration
   - Create profile-specific helpers
   - Connect dashboard cards to helpers
   - Implement cross-navigation

---

## 📚 Reference Documents

- `/docs/enhancements/day_trading_dashboard.md`
- `/docs/enhancements/swing_trading_dashboard.md`
- `/docs/enhancements/options_trading_dashboard.md`
- `/docs/enhancements/long_term_investing_dashboard.md`
- `/docs/enhancements/assistant_api_mapping.md`
- `/docs/enhancements/core_api_mapping.md`
- `/RULES_OF_ENGAGEMENT.md`

---

*Last Updated: 2025-09-06*
*This document should be updated as the project evolves*