import React from 'react';
import useSwipe from '../hooks/useSwipe';
import type { SwipeDirection } from '../hooks/useSwipe';
import useAppStore from '../stores/useAppStore';

// Transparent gesture capture zones for quick mode changes
// - Top zone (beneath header): swipe left/right → tradingProfile cycle; swipe up/down → experience cycle
// - Bottom zone: swipe up → navigate to Settings

const profiles: Array<'day' | 'swing' | 'investing' | 'options'> = ['day', 'swing', 'investing', 'options'];
const experiences: Array<'novice' | 'intermediate' | 'power'> = ['novice', 'intermediate', 'power'];

export default function GestureLayer() {
  const { tradingProfile, setTradingProfile, experience, setExperience, setActiveView, assetType, setAssetType } = useAppStore();

  const cycle = <T,>(arr: T[], cur: T, dir: 'next' | 'prev') => {
    const i = arr.indexOf(cur);
    if (i === -1) return arr[0];
    const n = dir === 'next' ? (i + 1) % arr.length : (i - 1 + arr.length) % arr.length;
    return arr[n];
  };

  const onSwipeTop = (dir: SwipeDirection) => {
    if (dir === 'left') setTradingProfile(cycle(profiles, tradingProfile, 'next'));
    else if (dir === 'right') setTradingProfile(cycle(profiles, tradingProfile, 'prev'));
    else if (dir === 'up' || dir === 'down') {
      // Map vertical swipe to asset type toggle (stocks <-> options)
      setAssetType(assetType === 'stocks' ? 'options' : 'stocks');
    }
  };

  const onSwipeBottom = (dir: SwipeDirection) => {
    if (dir === 'up') setActiveView('settings');
  };

  const topSwipe = useSwipe({ onSwipe: onSwipeTop, threshold: 40, restraint: 80, allowedTime: 500 });
  const bottomSwipe = useSwipe({ onSwipe: onSwipeBottom, threshold: 30, restraint: 120, allowedTime: 600 });

  return (
    <>
      {/* Top gesture zone: positioned under fixed header (header ~80px). Height small to avoid scroll conflict. */}
      <div
        {...topSwipe}
        aria-hidden
        style={{ position: 'fixed', top: 80, left: 0, right: 0, height: 48, zIndex: 5, background: 'transparent' }}
      />
      {/* Bottom gesture zone: swipe up to open Settings */}
      <div
        {...bottomSwipe}
        aria-hidden
        className="safe-bottom"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 24, zIndex: 5, background: 'transparent' }}
      />
    </>
  );
}
