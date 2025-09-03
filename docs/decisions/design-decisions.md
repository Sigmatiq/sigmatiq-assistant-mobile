# Design Decisions

## 1. Analysis-Only Application
**Decision**: No portfolio tracking, trading execution, or personal financial data.

**Rationale**:
- Focused on market analysis and research
- Reduces compliance and security requirements
- Cleaner, more focused user experience
- Easier to scale and maintain

**Implications**:
- No buy/sell buttons
- No P&L tracking
- No position management
- Focus on screeners, charts, and analysis tools

---

## 2. Mobile-First Design
**Decision**: Design for mobile first, then scale up to desktop.

**Rationale**:
- Most users check markets on mobile
- Forces simplicity and focus
- Better performance on all devices
- Progressive enhancement approach

**Implementation**:
- Touch-friendly targets (min 44px)
- Bottom navigation for mobile
- Swipeable cards and sections
- Responsive breakpoints: 640px, 768px, 1024px

---

## 3. Everything is Clickable Context
**Decision**: All financial entities (tickers, indicators, terms) are clickable and set context.

**Rationale**:
- Natural exploration and discovery
- Reduces manual search/input
- Educational through interaction
- Connects related information

**Examples**:
- Click $AAPL → Sets stock context
- Click RSI → Shows RSI explanation and adds to chart
- Click "Volume Spike" → Runs volume screener
- Click "Bullish Divergence" → Shows pattern examples

**Visual Indicators**:
- Tickers: Teal color with $ prefix
- Indicators: Golden badges
- Strategies: Purple pills
- Terms: Dotted underline

---

## 4. Context-Aware Assistant Panel
**Decision**: Assistant panel only appears when there's relevant context, no manual toggle.

**Rationale**:
- Reduces UI clutter
- Appears when needed
- Saves screen space
- More intuitive UX

**Triggers**:
- Symbol selected
- On screener/charts pages
- When analysis is running

---

## 5. Progressive Disclosure
**Decision**: Show simple interface by default, reveal advanced features on demand.

**Rationale**:
- Not overwhelming for beginners
- Power users can access everything
- Reduces cognitive load
- Cleaner initial experience

**Implementation**:
- "Advanced" toggle in settings
- Expandable sections
- "Show more" buttons
- Keyboard shortcuts for power users

---

## 6. Real-Time Data with Mock Fallback
**Decision**: Use real APIs when available, mock data for development.

**Rationale**:
- Can develop without backend
- Graceful degradation
- Easier testing
- Demo-friendly

**Implementation**:
- TanStack Query for data fetching
- Mock data in API client
- Environment flags for data source

---

## 7. SIGMATIQ Branding
**Decision**: Use official SIGMATIQ colors and branding consistently.

**Colors**:
- Primary Teal: #1ABC9C
- Primary Golden: #F59E0B
- Dark backgrounds: #0A1414, #0F1A1A
- Success: #10B981
- Error: #EF4444

**Logo**: 3x3 pixel grid design
- Top row: All teal
- Middle: Teal-Golden-Teal
- Bottom: Dark teal

---

## 8. No Emojis Policy
**Decision**: Use Lucide icons instead of emojis throughout the UI.

**Rationale**:
- Professional appearance
- Consistent across platforms
- Better accessibility
- Faster rendering

---

## 9. Auto-Scrolling Market Ticker
**Decision**: Continuous scroll animation for market tickers in header.

**Implementation**:
- CSS-only animation (performance)
- Pause on hover
- Duplicate content for seamless loop
- User-customizable watchlist

---

## 10. Component Architecture
**Decision**: Feature-based folder structure with co-located styles.

**Structure**:
```
pages/
  Dashboard/
    index.tsx
    components/
    styles.css
components/
  shared/
    ClickableEntity/
    MarketTicker/
```

**Benefits**:
- Easy to find related code
- Better code splitting
- Clearer dependencies
- Easier to test