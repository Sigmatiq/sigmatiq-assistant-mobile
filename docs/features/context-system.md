# Interactive Context System

## Overview
Every financial entity in the application is clickable and sets global context, enabling natural exploration and discovery.

## Context Types

### 1. Symbol Context
**Format**: `$AAPL`, `$TSLA`, `$SPY`

**Visual Style**:
- Color: Teal (#1ABC9C)
- Prefix: $ symbol
- Hover: Underline + glow effect
- Click: Ripple animation

**Actions on Click**:
- Sets global selectedSymbol
- Shows mini preview card
- Updates all charts/analysis
- Triggers AssistantPanel appearance

### 2. Indicator Context
**Format**: `RSI`, `MACD`, `Bollinger Bands`

**Visual Style**:
- Background: Golden badge (#F59E0B)
- Padding: 2px 8px
- Border-radius: 4px
- Hover: Darker shade

**Actions on Click**:
- Shows indicator explanation
- Offers "Add to Chart" option
- Shows current value if symbol selected
- Links to educational content

### 3. Strategy Context
**Format**: `Mean Reversion`, `Momentum Trading`, `Pairs Trading`

**Visual Style**:
- Background: Purple gradient
- Pill shape (rounded-full)
- Text: White
- Hover: Scale 1.05

**Actions on Click**:
- Shows strategy description
- Offers screener preset
- Shows backtesting option
- Lists related indicators

### 4. Pattern Context
**Format**: `Cup & Handle`, `Head & Shoulders`, `Bull Flag`

**Visual Style**:
- Border: 1px dashed
- Color: Cyan
- Icon: Small chart icon
- Hover: Solid border

**Actions on Click**:
- Shows pattern visualization
- Lists matching stocks
- Shows success statistics
- Educational content

### 5. Market Terms
**Format**: `Support Level`, `Resistance`, `Volume Spike`

**Visual Style**:
- Text decoration: Dotted underline
- Color: Inherit
- Cursor: Help
- Hover: Tooltip

**Actions on Click**:
- Shows definition popup
- Related concepts
- Current examples
- "Find stocks with..." option

## Implementation

### Context Provider
```typescript
interface ContextState {
  // Current context
  selectedSymbol: string | null;
  selectedIndicator: string | null;
  selectedStrategy: string | null;
  selectedPattern: string | null;
  selectedTimeframe: '1m' | '5m' | '1h' | '1d' | '1w';
  
  // History
  contextHistory: ContextItem[];
  
  // Actions
  setContext: (type: ContextType, value: string) => void;
  clearContext: () => void;
  goBack: () => void;
  
  // Multi-select
  compareSymbols: string[];
  addToCompare: (symbol: string) => void;
}
```

### ClickableEntity Component
```typescript
interface ClickableEntityProps {
  type: 'symbol' | 'indicator' | 'strategy' | 'pattern' | 'term';
  value: string;
  children: React.ReactNode;
  showPreview?: boolean;
  className?: string;
}
```

### Usage Examples

#### In Market Summary:
```tsx
<p>
  <ClickableEntity type="symbol" value="SPY">
    $SPY
  </ClickableEntity> is showing 
  <ClickableEntity type="pattern" value="bull-flag">
    Bull Flag
  </ClickableEntity> pattern with 
  <ClickableEntity type="indicator" value="rsi">
    RSI
  </ClickableEntity> at 72.
</p>
```

#### In Screener Results:
```tsx
{results.map(stock => (
  <div key={stock.symbol}>
    <ClickableEntity type="symbol" value={stock.symbol}>
      ${stock.symbol}
    </ClickableEntity>
    <ClickableEntity type="indicator" value="volume">
      Volume: {stock.volumeRatio}x
    </ClickableEntity>
  </div>
))}
```

## Context Flow

### Single Click Flow
1. User clicks entity
2. Context updates globally
3. All components react:
   - Charts update
   - Assistant panel shows
   - Related data loads
   - Breadcrumb updates

### Multi-Select Flow (Ctrl/Cmd + Click)
1. First click sets primary context
2. Ctrl+Click adds to comparison
3. Comparison view opens
4. Side-by-side analysis

### Right-Click Menu
Options vary by entity type:
- **Symbol**: Chart, News, Options, Compare
- **Indicator**: Add to Chart, Learn, Screener
- **Pattern**: Find Similar, Backtest, Alert

## Visual Feedback

### Hover States
- **Preview delay**: 500ms
- **Preview content**: Mini chart/definition
- **Animation**: Fade in

### Click Feedback
- **Ripple**: Material design ripple
- **Highlight**: Brief glow effect
- **Transition**: Smooth 200ms

### Active Context
- **Border**: 2px solid primary
- **Background**: Primary color at 10% opacity
- **Persistence**: Until cleared/changed

## Keyboard Support

### Shortcuts
- `S` + click: Add to screener
- `C` + click: Add to chart
- `A` + click: Set alert
- `Esc`: Clear context

### Navigation
- `Tab`: Navigate clickables
- `Enter`: Activate
- `Arrow keys`: Navigate suggestions

## Mobile Interactions

### Touch Gestures
- **Tap**: Set context
- **Long press**: Preview
- **Swipe up**: More options
- **Pinch**: Compare mode

### Optimizations
- Larger touch targets (44px min)
- Delayed hover on touch
- Bottom sheet for options
- Haptic feedback

## Performance

### Optimizations
- Debounced context updates
- Memoized click handlers
- Virtual scrolling for long lists
- Lazy load preview content

### Caching
- Recent contexts cached
- Popular entities pre-loaded
- Preview data cached 5min
- History limited to 50 items

## Analytics Tracking

### Events to Track
- Entity clicks by type
- Context paths (user journeys)
- Most clicked entities
- Context duration
- Conversion to actions

## Future Enhancements

1. **Smart Suggestions**
   - ML-based next click prediction
   - Related entity recommendations

2. **Voice Activation**
   - "Show me AAPL"
   - "Add RSI to chart"

3. **Collaborative Context**
   - Share context state
   - Sync across devices

4. **Context Templates**
   - Save context combinations
   - Quick context switching