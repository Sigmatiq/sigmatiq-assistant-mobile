import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  PiggyBank
} from 'lucide-react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import useAppStore from '../stores/useAppStore';

interface ProfileTab {
  value: 'day' | 'swing' | 'options' | 'investing';
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const profiles: ProfileTab[] = [
  {
    value: 'day',
    label: 'Day Trading',
    shortLabel: 'Day',
    icon: TrendingUp
  },
  {
    value: 'swing',
    label: 'Swing Trading',
    shortLabel: 'Swing',
    icon: BarChart3
  },
  {
    value: 'options',
    label: 'Options Trading',
    shortLabel: 'Options',
    icon: Target
  },
  {
    value: 'investing',
    label: 'Long-term Investing',
    shortLabel: 'Invest',
    icon: PiggyBank
  }
];

const MobileProfileTabs: React.FC = () => {
  const { tradingProfile, setTradingProfile } = useAppStore();
  const [isAnimating, setIsAnimating] = React.useState(false);
  
  const handleProfileChange = (profile: 'day' | 'swing' | 'options' | 'investing') => {
    if (profile === tradingProfile) return;
    
    setIsAnimating(true);
    setTradingProfile(profile);
    
    // Haptic feedback on mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Calculate active tab index for indicator position
  const activeIndex = profiles.findIndex(p => p.value === tradingProfile);

  return (
    <>
      {/* Mobile/Tablet: Horizontal scrollable tabs */}
      <div className="lg:hidden w-full">
        <div className="relative">
          {/* Tab container with horizontal scroll */}
          <div className="flex overflow-x-auto scrollbar-hide py-2">
            <div className="flex gap-2 px-4 min-w-full justify-between">
              {profiles.map((profile) => {
                const isActive = tradingProfile === profile.value;
                const Icon = profile.icon;
                
                return (
                  <button
                    key={profile.value}
                    onClick={() => handleProfileChange(profile.value)}
                    className={`
                      flex flex-col items-center justify-center px-4 py-3 rounded-xl min-w-[80px]
                      transition-all duration-200 transform
                      ${isActive ? 'scale-105' : 'scale-100'}
                      ${isAnimating && isActive ? 'animate-pulse' : ''}
                    `}
                    style={{
                      backgroundColor: isActive 
                        ? `${sigmatiqTheme.colors.primary.teal}15`
                        : sigmatiqTheme.colors.background.secondary,
                      borderWidth: '1px',
                      borderColor: isActive 
                        ? sigmatiqTheme.colors.primary.teal
                        : 'transparent'
                    }}
                  >
                    <Icon 
                      className={`w-5 h-5 mb-1 transition-colors duration-200`}
                      style={{ 
                        color: isActive 
                          ? sigmatiqTheme.colors.primary.teal
                          : sigmatiqTheme.colors.text.muted
                      }}
                    />
                    <span 
                      className={`text-xs font-medium transition-colors duration-200`}
                      style={{ 
                        color: isActive 
                          ? sigmatiqTheme.colors.primary.teal
                          : sigmatiqTheme.colors.text.secondary
                      }}
                    >
                      {profile.shortLabel}
                    </span>
                    {isActive && (
                      <div 
                        className="absolute -bottom-1 w-12 h-1 rounded-full"
                        style={{ backgroundColor: sigmatiqTheme.colors.primary.teal }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Segmented control style */}
      <div className="hidden lg:block">
        <div 
          className="inline-flex p-1 rounded-xl"
          style={{ 
            backgroundColor: sigmatiqTheme.colors.background.secondary,
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          {profiles.map((profile) => {
            const isActive = tradingProfile === profile.value;
            const Icon = profile.icon;
            
            return (
              <button
                key={profile.value}
                onClick={() => handleProfileChange(profile.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  transition-all duration-200
                  ${isActive ? 'shadow-md' : ''}
                `}
                style={{
                  backgroundColor: isActive 
                    ? sigmatiqTheme.colors.background.card
                    : 'transparent',
                  color: isActive 
                    ? sigmatiqTheme.colors.primary.teal
                    : sigmatiqTheme.colors.text.secondary
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {profile.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

// Alternative: Swipeable pill tabs for mobile
export const SwipeableProfilePills: React.FC = () => {
  const { tradingProfile, setTradingProfile } = useAppStore();
  
  return (
    <div className="lg:hidden w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 py-2">
        {profiles.map((profile) => {
          const isActive = tradingProfile === profile.value;
          const Icon = profile.icon;
          
          return (
            <button
              key={profile.value}
              onClick={() => setTradingProfile(profile.value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap
                transition-all duration-200
                ${isActive ? 'ring-2' : ''}
              `}
              style={{
                backgroundColor: isActive 
                  ? sigmatiqTheme.colors.primary.teal
                  : sigmatiqTheme.colors.background.secondary,
                color: isActive 
                  ? 'white'
                  : sigmatiqTheme.colors.text.secondary,
                ringColor: isActive ? `${sigmatiqTheme.colors.primary.teal}40` : 'transparent'
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {profile.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Alternative: Bottom sheet selector for mobile
export const BottomSheetProfileSelector: React.FC = () => {
  const { tradingProfile, setTradingProfile, experience } = useAppStore();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const currentProfile = profiles.find(p => p.value === tradingProfile) || profiles[0];
  const CurrentIcon = currentProfile.icon;
  
  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          border: `1px solid ${sigmatiqTheme.colors.border.default}`
        }}
      >
        <CurrentIcon className="w-4 h-4" style={{ color: sigmatiqTheme.colors.primary.teal }} />
        <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
          {currentProfile.label}
        </span>
      </button>

      {/* Bottom sheet overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            style={{ backdropFilter: 'blur(4px)' }}
          />
          
          {/* Bottom sheet */}
          <div 
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl"
            style={{ backgroundColor: sigmatiqTheme.colors.background.card }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div 
                className="w-12 h-1 rounded-full"
                style={{ backgroundColor: sigmatiqTheme.colors.border.default }}
              />
            </div>
            
            {/* Title */}
            <div className="px-4 pb-2">
              <h3 className="text-base font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Select Trading Profile
              </h3>
              <p className="text-xs mt-1" style={{ color: sigmatiqTheme.colors.text.muted }}>
                Choose your trading style and time horizon
              </p>
            </div>
            
            {/* Profile options */}
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {profiles.map((profile) => {
                const Icon = profile.icon;
                const isActive = tradingProfile === profile.value;
                
                return (
                  <button
                    key={profile.value}
                    onClick={() => {
                      setTradingProfile(profile.value);
                      setIsOpen(false);
                      // Haptic feedback
                      if ('vibrate' in navigator) {
                        navigator.vibrate(10);
                      }
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{
                      backgroundColor: isActive 
                        ? `${sigmatiqTheme.colors.primary.teal}15`
                        : sigmatiqTheme.colors.background.secondary,
                      border: `1px solid ${isActive ? sigmatiqTheme.colors.primary.teal : 'transparent'}`
                    }}
                  >
                    <div 
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: isActive
                          ? `${sigmatiqTheme.colors.primary.teal}20`
                          : sigmatiqTheme.colors.background.tertiary
                      }}
                    >
                      <Icon 
                        className="w-5 h-5"
                        style={{ 
                          color: isActive
                            ? sigmatiqTheme.colors.primary.teal
                            : sigmatiqTheme.colors.text.secondary
                        }}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>
                        {profile.label}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: sigmatiqTheme.colors.text.muted }}>
                        {profile.value === 'day' && 'Intraday movements & real-time data'}
                        {profile.value === 'swing' && 'Multi-day positions & trends'}
                        {profile.value === 'options' && 'Derivatives & volatility analysis'}
                        {profile.value === 'investing' && 'Fundamentals & valuation'}
                      </div>
                    </div>
                    {isActive && (
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sigmatiqTheme.colors.primary.teal }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Safe area padding for devices with home indicator */}
            <div className="h-safe-area-inset-bottom" />
          </div>
        </div>
      )}
    </>
  );
};

export default MobileProfileTabs;