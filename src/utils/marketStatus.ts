export type MarketPhase = 'pre' | 'open' | 'after' | 'closed';

export interface MarketStatus {
  phase: MarketPhase;
  label: string; // Human label: Pre‑Market | Markets Open | After‑Hours | Markets Closed
  timeText: string; // e.g., Closes in 2h 15m / Opens in 1h 00m / After-hours ends in 45m
}

// Compute market status in US/Eastern based on wall-clock time. Holidays not handled (treated as closed).
export function computeMarketStatus(nowLocal: Date = new Date()): MarketStatus {
  // Convert to ET using Intl APIs (DST aware)
  const etString = nowLocal.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const et = new Date(etString);
  const day = et.getDay(); // 0 Sun .. 6 Sat
  const h = et.getHours();
  const m = et.getMinutes();
  const currentMinutes = h * 60 + m;

  // Minutes from midnight for key boundaries (ET)
  const PRE_MARKET_START = 4 * 60; // 04:00
  const MARKET_OPEN = 9 * 60 + 30; // 09:30
  const MARKET_CLOSE = 16 * 60; // 16:00
  const AFTER_HOURS_END = 20 * 60; // 20:00

  const fmt = (mins: number) => {
    const hh = Math.floor(Math.max(0, mins) / 60);
    const mm = Math.max(0, mins) % 60;
    return `${hh}h ${mm}m`;
  };

  const untilOpenToday = MARKET_OPEN - currentMinutes;
  const untilClose = MARKET_CLOSE - currentMinutes;
  const untilAfterEnd = AFTER_HOURS_END - currentMinutes;

  // Helper to compute minutes until next business day's open (simple; weekends only)
  const minutesUntilNextOpen = () => {
    // If Fri late after-hours or weekend, jump to Monday 09:30
    const todayIndex = day; // 0..6
    let daysToAdd = 0;
    if (todayIndex === 5 && currentMinutes >= AFTER_HOURS_END) {
      // Friday after 8pm → Monday
      daysToAdd = 3;
    } else if (todayIndex === 6) {
      // Saturday → Monday
      daysToAdd = 2;
    } else if (todayIndex === 0) {
      // Sunday → Monday
      daysToAdd = 1;
    } else if (currentMinutes >= AFTER_HOURS_END) {
      // Weekday after 8pm → next day
      daysToAdd = 1;
    } else if (currentMinutes < PRE_MARKET_START) {
      // Before 4am same day
      daysToAdd = 0;
    } else if (currentMinutes >= PRE_MARKET_START && currentMinutes < MARKET_OPEN) {
      // Pre‑market → open same day
      daysToAdd = 0;
    } else if (currentMinutes >= MARKET_OPEN && currentMinutes < MARKET_CLOSE) {
      // Open → close same day (not used here)
      daysToAdd = 0;
    } else if (currentMinutes >= MARKET_CLOSE && currentMinutes < AFTER_HOURS_END) {
      // After‑hours → end same day (then next open tomorrow)
      daysToAdd = 1;
    }
    // Minutes remaining today until midnight
    const minsToMidnight = (24 * 60) - currentMinutes;
    if (daysToAdd === 0) {
      return untilOpenToday;
    }
    // Add full days plus to 09:30 next open
    return minsToMidnight + (daysToAdd - 1) * 24 * 60 + MARKET_OPEN;
  };

  // Weekend handling
  if (day === 0 || day === 6) {
    return { phase: 'closed', label: 'Markets Closed', timeText: `Opens in ${fmt(minutesUntilNextOpen())}` };
  }

  // Weekday phases
  if (currentMinutes < PRE_MARKET_START) {
    return { phase: 'closed', label: 'Markets Closed', timeText: `Opens in ${fmt(minutesUntilNextOpen())}` };
  } else if (currentMinutes < MARKET_OPEN) {
    return { phase: 'pre', label: 'Pre‑Market', timeText: `Opens in ${fmt(untilOpenToday)}` };
  } else if (currentMinutes < MARKET_CLOSE) {
    return { phase: 'open', label: 'Markets Open', timeText: `Closes in ${fmt(untilClose)}` };
  } else if (currentMinutes < AFTER_HOURS_END) {
    return { phase: 'after', label: 'After‑Hours', timeText: `After‑hours ends in ${fmt(untilAfterEnd)}` };
  } else {
    return { phase: 'closed', label: 'Markets Closed', timeText: `Opens in ${fmt(minutesUntilNextOpen())}` };
  }
}

