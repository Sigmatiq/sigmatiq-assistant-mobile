# Visual Testing Checklist

## Test Devices & Screen Sizes

### Mobile Devices (Test in Portrait & Landscape)
- [ ] iPhone SE (375 x 667)
- [ ] iPhone 12/13 (390 x 844)
- [ ] iPhone 14 Pro Max (430 x 932)
- [ ] Samsung Galaxy S20 (360 x 800)
- [ ] Pixel 5 (393 x 851)

### Tablets
- [ ] iPad Mini (768 x 1024)
- [ ] iPad Air (820 x 1180)
- [ ] iPad Pro 12.9" (1024 x 1366)

### Desktop
- [ ] Small Desktop (1024 x 768)
- [ ] Medium Desktop (1280 x 800)
- [ ] Large Desktop (1440 x 900)
- [ ] Full HD (1920 x 1080)
- [ ] 4K (2560 x 1440)

## Components to Test

### 1. Header (OptimizedHeader)
- [ ] Logo size and positioning
- [ ] Market clock visibility and alignment
- [ ] Ticker bar scrolling animation
- [ ] Mobile menu button appears < 1024px
- [ ] Border and shadow rendering
- [ ] Fixed positioning doesn't overlap content

### 2. Assistant Panel
- [ ] Panel slide-in animation from right
- [ ] Proper width on mobile (100%) vs desktop (400px)
- [ ] Backdrop overlay on mobile
- [ ] Close button positioning
- [ ] Helper content scrollability
- [ ] Floating assistant button position (bottom-right)
- [ ] Floating button visibility with/without context
- [ ] Panel doesn't push main content on desktop

### 3. StockInfoHelper
- [ ] Header with symbol and name
- [ ] Action buttons spacing and alignment
- [ ] Tooltips positioning and visibility
- [ ] Tab navigation layout
- [ ] Price display with change indicators
- [ ] Content sections scrollability
- [ ] Loading states
- [ ] Error states

### 4. WatchlistCard
- [ ] Card border and background
- [ ] Header with icon and title
- [ ] Watchlist dropdown selector
- [ ] Symbol list layout
- [ ] Price and change alignment
- [ ] Scroll behavior for long lists
- [ ] Empty state message
- [ ] Refresh button animation

### 5. Dashboard
- [ ] Grid layout responsiveness
- [ ] Card spacing and padding
- [ ] Content overflow handling
- [ ] Mobile stacking behavior

### 6. Floating Elements
- [ ] Floating assistant button z-index
- [ ] Tooltips above all content
- [ ] Dropdown menus positioning
- [ ] Modal/overlay stacking

## Visual Consistency Checks

### Colors & Theme
- [ ] Background colors match theme
- [ ] Text colors have proper contrast
- [ ] Border colors consistent
- [ ] Hover states visible
- [ ] Active states clear
- [ ] Success/error color indicators

### Typography
- [ ] Font sizes readable on all devices
- [ ] Line height appropriate
- [ ] Text truncation with ellipsis
- [ ] Font weights distinct

### Spacing
- [ ] Consistent padding in cards
- [ ] Proper margins between sections
- [ ] Button tap targets (min 44px mobile)
- [ ] No content touching edges

### Animations
- [ ] Smooth transitions
- [ ] No janky animations
- [ ] Loading spinners centered
- [ ] Ticker scroll speed appropriate

## Edge Cases

### Content States
- [ ] Empty states display correctly
- [ ] Long text truncates properly
- [ ] Large numbers format correctly
- [ ] Missing data handled gracefully

### Interactions
- [ ] Touch targets large enough on mobile
- [ ] Hover states don't stick on touch devices
- [ ] Scroll doesn't interfere with swipe
- [ ] Keyboard doesn't push layout

### Browser Specific
- [ ] Chrome/Edge tooltips work
- [ ] Safari mobile safe areas
- [ ] Firefox scrollbar styling
- [ ] Mobile browser chrome considered

## Testing Process

1. **Setup**: Open app in browser DevTools
2. **Device Toggle**: Press F12 → Ctrl+Shift+M
3. **Test Each Device**: Select from device dropdown
4. **Check Orientation**: Test portrait and landscape
5. **Interact**: Click buttons, hover elements, scroll
6. **Document Issues**: Screenshot any visual problems

## Common Issues to Watch For

- Text overlapping on small screens
- Horizontal scrollbars appearing
- Fixed elements covering content
- Buttons too small to tap
- Tooltips cut off by viewport
- Z-index stacking problems
- Animation performance on mobile
- Inconsistent spacing
- Images not scaling properly
- Form inputs zooming on mobile

## Notes Section

_Add any visual issues found during testing:_

---

Last tested: [Date]
Tested by: [Name]
Browser versions: [List]