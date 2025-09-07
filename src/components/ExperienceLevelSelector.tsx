import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Zap,
  Info
} from 'lucide-react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import useAppStore from '../stores/useAppStore';

interface ExperienceLevel {
  value: 'novice' | 'intermediate' | 'power';
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const ExperienceLevelSelector: React.FC = () => {
  const { experience, setExperience } = useAppStore();
  const [showTooltip, setShowTooltip] = React.useState(false);

  const levels: ExperienceLevel[] = [
    { 
      value: 'novice', 
      label: 'Beginner', 
      shortLabel: 'Beginner',
      icon: Sparkles,
      description: 'Simplified view with key metrics and guidance',
      color: sigmatiqTheme.colors.status.success
    },
    { 
      value: 'intermediate', 
      label: 'Intermediate', 
      shortLabel: 'Inter',
      icon: TrendingUp,
      description: 'More metrics and advanced features',
      color: sigmatiqTheme.colors.primary.teal
    },
    { 
      value: 'power', 
      label: 'Advanced', 
      shortLabel: 'Adv',
      icon: Zap,
      description: 'Full metrics, Greeks, and pro tools',
      color: sigmatiqTheme.colors.primary.coral
    }
  ];

  const currentLevel = levels.find(l => l.value === experience) || levels[0];

  return (
    <div className="relative">
      {/* Mobile-optimized horizontal selector */}
      <div className="flex items-center gap-2 p-2 rounded-lg border"
           style={{ 
             backgroundColor: sigmatiqTheme.colors.background.card,
             borderColor: sigmatiqTheme.colors.border.default
           }}>
        
        {/* Info icon for mobile */}
        <button
          className="md:hidden p-1"
          onClick={() => setShowTooltip(!showTooltip)}
          style={{ color: sigmatiqTheme.colors.text.muted }}
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Level buttons */}
        <div className="flex gap-1 flex-1">
          {levels.map((level) => {
            const Icon = level.icon;
            const isActive = experience === level.value;
            
            return (
              <button
                key={level.value}
                onClick={() => setExperience(level.value)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all
                  ${isActive ? 'shadow-sm' : 'hover:bg-opacity-50'}
                `}
                style={{
                  backgroundColor: isActive 
                    ? `${level.color}20`
                    : 'transparent',
                  color: isActive 
                    ? level.color 
                    : sigmatiqTheme.colors.text.secondary,
                  border: `1px solid ${isActive ? level.color : 'transparent'}`,
                  flex: 1
                }}
                title={level.description}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium hidden sm:inline">
                  {level.label}
                </span>
                <span className="text-xs font-medium sm:hidden">
                  {level.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile tooltip */}
      {showTooltip && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-lg shadow-lg z-50 md:hidden"
             style={{ 
               backgroundColor: sigmatiqTheme.colors.background.primary,
               border: `1px solid ${sigmatiqTheme.colors.border.default}`,
               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
             }}>
          <div className="text-xs font-semibold mb-2" style={{ color: sigmatiqTheme.colors.text.primary }}>
            Experience Levels
          </div>
          {levels.map((level) => {
            const Icon = level.icon;
            return (
              <div key={level.value} className="flex items-start gap-2 mb-2">
                <Icon className="w-3 h-3 mt-0.5" style={{ color: level.color }} />
                <div>
                  <div className="text-xs font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    {level.label}
                  </div>
                  <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                    {level.description}
                  </div>
                </div>
              </div>
            );
          })}
          <button
            onClick={() => setShowTooltip(false)}
            className="text-xs mt-2"
            style={{ color: sigmatiqTheme.colors.primary.teal }}
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
};

export default ExperienceLevelSelector;