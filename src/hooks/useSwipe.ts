import { useRef } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

interface UseSwipeOptions {
  onSwipe: (dir: SwipeDirection) => void;
  threshold?: number; // min distance in px
  restraint?: number; // max perpendicular distance
  allowedTime?: number; // ms
}

export default function useSwipe({ onSwipe, threshold = 50, restraint = 80, allowedTime = 500 }: UseSwipeOptions) {
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const isDragging = useRef(false);

  // Touch events for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    startX.current = t.pageX;
    startY.current = t.pageY;
    startTime.current = new Date().getTime();
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    const distX = t.pageX - startX.current;
    const distY = t.pageY - startY.current;
    const elapsed = new Date().getTime() - startTime.current;
    let dir: SwipeDirection = null;
    if (elapsed <= allowedTime) {
      if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
        dir = distX < 0 ? 'left' : 'right';
      } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
        dir = distY < 0 ? 'up' : 'down';
      }
    }
    if (dir) onSwipe(dir);
  };

  // Mouse events for desktop (including device emulation)
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
    startY.current = e.pageY;
    startTime.current = new Date().getTime();
    e.preventDefault(); // Prevent text selection
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const distX = e.pageX - startX.current;
    const distY = e.pageY - startY.current;
    const elapsed = new Date().getTime() - startTime.current;
    let dir: SwipeDirection = null;
    
    if (elapsed <= allowedTime) {
      if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
        dir = distX < 0 ? 'left' : 'right';
      } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
        dir = distY < 0 ? 'up' : 'down';
      }
    }
    if (dir) onSwipe(dir);
  };

  const onMouseLeave = () => {
    isDragging.current = false;
  };

  return { 
    onTouchStart, 
    onTouchEnd,
    onMouseDown,
    onMouseUp,
    onMouseLeave
  };
}