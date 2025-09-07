import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  PiggyBank,
  ChevronDown,
  Check
} from 'lucide-react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import useAppStore from '../stores/useAppStore';

interface ProfileOption {
  value: 'day' | 'swing' | 'options' | 'investing';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const profiles: ProfileOption[] = [
  {
    value: 'day',
    label: 'Day Trading',
    description: 'Intraday movements & real-time data',
    icon: TrendingUp
  },
  {
    value: 'swing',
    label: 'Swing Trading',
    description: 'Multi-day positions & trends',
    icon: BarChart3
  },
  {
    value: 'options',
    label: 'Options Trading',
    description: 'Derivatives & volatility analysis',
    icon: Target
  },
  {
    value: 'investing',
    label: 'Long-term Investing',
    description: 'Fundamentals & valuation',
    icon: PiggyBank
  }
];

const ProfileSwitcher: React.FC = () => {
  const { tradingProfile, setTradingProfile, experience } = useAppStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const currentProfile = profiles.find(p => p.value === tradingProfile) || profiles[0];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileSelect = (profile: 'day' | 'swing' | 'options' | 'investing') => {
    setTradingProfile(profile);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-[1.02]"
        style={{
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderColor: isOpen ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.border.default
        }}
      >
        <currentProfile.icon 
          className="w-4 h-4" 
          style={{ color: sigmatiqTheme.colors.primary.teal }} 
        />
        <div className="text-left">
          <div className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
            {currentProfile.label}
          </div>
          <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
            {experience === 'novice' ? 'Beginner' : 
             experience === 'intermediate' ? 'Intermediate' : 'Advanced'}
          </div>
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: sigmatiqTheme.colors.text.muted }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute z-50 mt-2 w-72 rounded-xl shadow-lg border overflow-hidden"
          style={{
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderColor: sigmatiqTheme.colors.border.default,
            right: 0,
            boxShadow: sigmatiqTheme.shadows.lg
          }}
        >
          <div 
            className="p-3 border-b"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              borderColor: sigmatiqTheme.colors.border.default 
            }}
          >
            <div className="text-xs font-medium uppercase tracking-wider" 
                 style={{ color: sigmatiqTheme.colors.text.muted }}>
              Select Trading Profile
            </div>
          </div>

          <div className="p-2">
            {profiles.map((profile) => (
              <button
                key={profile.value}
                onClick={() => handleProfileSelect(profile.value)}
                className="w-full text-left p-3 rounded-lg mb-1 transition-all hover:translate-x-1"
                style={{
                  backgroundColor: tradingProfile === profile.value 
                    ? `${sigmatiqTheme.colors.primary.teal}15`
                    : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (tradingProfile !== profile.value) {
                    e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.background.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (tradingProfile !== profile.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="p-2 rounded-lg mt-0.5"
                    style={{
                      backgroundColor: tradingProfile === profile.value
                        ? `${sigmatiqTheme.colors.primary.teal}20`
                        : sigmatiqTheme.colors.background.tertiary
                    }}
                  >
                    <profile.icon 
                      className="w-4 h-4"
                      style={{ 
                        color: tradingProfile === profile.value
                          ? sigmatiqTheme.colors.primary.teal
                          : sigmatiqTheme.colors.text.secondary
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm" 
                           style={{ color: sigmatiqTheme.colors.text.primary }}>
                        {profile.label}
                      </div>
                      {tradingProfile === profile.value && (
                        <Check 
                          className="w-4 h-4" 
                          style={{ color: sigmatiqTheme.colors.primary.teal }}
                        />
                      )}
                    </div>
                    <div className="text-xs mt-0.5" 
                         style={{ color: sigmatiqTheme.colors.text.muted }}>
                      {profile.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Experience Level Section */}
          <div 
            className="p-3 border-t"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              borderColor: sigmatiqTheme.colors.border.default 
            }}
          >
            <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
              Experience: <span className="font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                {experience === 'novice' ? 'Beginner' : 
                 experience === 'intermediate' ? 'Intermediate' : 'Advanced'}
              </span>
            </div>
            <div className="text-xs mt-1" style={{ color: sigmatiqTheme.colors.text.muted }}>
              Change in Settings →
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSwitcher;