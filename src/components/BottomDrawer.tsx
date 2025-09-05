import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'full' | 'auto' | '3/4' | '2/3' | '1/2';
  showHandle?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  height = '3/4',
  showHandle = true,
  closeOnBackdrop = true,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle touch events for swipe-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    currentY.current = e.touches[0].clientY;
    const offset = Math.max(0, currentY.current - startY.current);
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // If dragged more than 100px or 25% of drawer height, close it
    const threshold = drawerRef.current ? drawerRef.current.offsetHeight * 0.25 : 100;
    if (dragOffset > Math.max(100, threshold)) {
      onClose();
    }
    setDragOffset(0);
  };

  // Handle mouse events for desktop drag (optional)
  const handleMouseDown = (e: React.MouseEvent) => {
    startY.current = e.clientY;
    currentY.current = e.clientY;
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    currentY.current = e.clientY;
    const offset = Math.max(0, currentY.current - startY.current);
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const threshold = drawerRef.current ? drawerRef.current.offsetHeight * 0.25 : 100;
    if (dragOffset > Math.max(100, threshold)) {
      onClose();
    }
    setDragOffset(0);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getHeightClass = () => {
    switch (height) {
      case 'full':
        return 'h-full';
      case '3/4':
        return 'h-3/4';
      case '2/3':
        return 'h-2/3';
      case '1/2':
        return 'h-1/2';
      case 'auto':
        return 'max-h-[90vh]';
      default:
        return 'h-3/4';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ 
          backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed inset-x-0 bottom-0 z-50 rounded-t-2xl transition-transform duration-300 ease-out ${getHeightClass()} ${className}`}
        style={{
          backgroundColor: sigmatiqTheme.colors.background.card,
          transform: `translateY(${isOpen ? dragOffset : '100%'}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        {showHandle && (
          <div 
            className="flex justify-center py-2 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <div 
              className="w-12 h-1 rounded-full"
              style={{ backgroundColor: sigmatiqTheme.colors.background.primary }}
            />
          </div>
        )}

        {/* Header */}
        {title && (
          <div 
            className="flex items-center justify-between px-4 pb-3 border-b"
            style={{ borderColor: sigmatiqTheme.colors.background.primary }}
          >
            <h3 className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
              style={{ color: sigmatiqTheme.colors.text.secondary }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomDrawer;