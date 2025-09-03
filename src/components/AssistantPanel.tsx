import React, { useState } from 'react';
import { 
  X, 
  ChevronUp, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  BookOpen,
  LineChart,
  Sparkles,
  BarChart3,
  Brain,
  Target
} from 'lucide-react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import useAppStore from '../stores/useAppStore';

interface PanelSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: {
    label: string;
    action: () => void;
    description?: string;
  }[];
}

const AssistantPanel = () => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('actions');
  const { setActiveView, selectedSymbol, activeView } = useAppStore();

  // Only show panel when there's relevant context
  const hasContext = selectedSymbol || (activeView && activeView !== 'dashboard');
  
  // Auto-hide on mobile when no context
  React.useEffect(() => {
    if (!hasContext && isMobileExpanded) {
      setIsMobileExpanded(false);
    }
  }, [hasContext, isMobileExpanded]);

  const sections: PanelSection[] = [
    {
      id: 'actions',
      title: 'Quick Actions',
      icon: Zap,
      items: [
        {
          label: 'Run Screener',
          description: 'Find opportunities',
          action: () => setActiveView('screener')
        },
        {
          label: 'Market Overview',
          description: 'Today\'s summary',
          action: () => console.log('Market overview')
        },
        {
          label: 'Set Alert',
          description: 'Price notifications',
          action: () => console.log('Set alert')
        },
        {
          label: 'Export Data',
          description: 'Download results',
          action: () => console.log('Export')
        }
      ]
    },
    {
      id: 'stock',
      title: 'Stock Info',
      icon: TrendingUp,
      items: [
        {
          label: 'Company Profile',
          description: selectedSymbol ? `About ${selectedSymbol}` : 'Select a stock',
          action: () => console.log('Company profile')
        },
        {
          label: 'Financials',
          description: 'Income & balance sheet',
          action: () => console.log('Financials')
        },
        {
          label: 'News & Events',
          description: 'Latest updates',
          action: () => console.log('News')
        },
        {
          label: 'Options Chain',
          description: 'Calls & puts',
          action: () => console.log('Options')
        }
      ]
    },
    {
      id: 'learning',
      title: 'Learning',
      icon: BookOpen,
      items: [
        {
          label: 'Trading Basics',
          description: 'Get started',
          action: () => console.log('Basics')
        },
        {
          label: 'Strategy Guides',
          description: 'Advanced tactics',
          action: () => console.log('Strategies')
        },
        {
          label: 'Indicator Wiki',
          description: 'How they work',
          action: () => console.log('Indicators')
        },
        {
          label: 'Video Tutorials',
          description: 'Watch & learn',
          action: () => console.log('Videos')
        }
      ]
    },
    {
      id: 'charts',
      title: 'Charts',
      icon: LineChart,
      items: [
        {
          label: 'Price Chart',
          description: 'Candlestick view',
          action: () => setActiveView('charts')
        },
        {
          label: 'Technical View',
          description: 'With indicators',
          action: () => console.log('Technical')
        },
        {
          label: 'Compare Stocks',
          description: 'Side by side',
          action: () => console.log('Compare')
        },
        {
          label: 'Heatmap',
          description: 'Market sectors',
          action: () => console.log('Heatmap')
        }
      ]
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  // Mobile floating button and drawer
  const MobileVersion = () => {
    // Don't show FAB if there's no context
    if (!hasContext) {
      return null;
    }

    return (
      <>
        {/* Floating Action Button */}
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="fixed right-4 bottom-24 w-14 h-14 rounded-full shadow-lg z-20 lg:hidden flex items-center justify-center transition-all"
          style={{
            backgroundColor: sigmatiqTheme.colors.primary.teal,
            boxShadow: sigmatiqTheme.shadows.glow
          }}
        >
          {isMobileExpanded ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Sparkles className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Mobile Drawer */}
        {isMobileExpanded && (
        <div 
          className="fixed inset-x-0 bottom-0 z-30 lg:hidden animate-slide-up"
          style={{
            maxHeight: '70vh',
            backgroundColor: sigmatiqTheme.colors.background.secondary,
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Drawer Handle */}
          <div className="flex justify-center py-2">
            <div 
              className="w-12 h-1 rounded-full"
              style={{ backgroundColor: sigmatiqTheme.colors.border.default }}
            />
          </div>

          {/* Section Tabs */}
          <div className="flex px-4 pb-2 gap-2 overflow-x-auto">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all"
                style={{
                  backgroundColor: activeSection === section.id 
                    ? sigmatiqTheme.colors.primary.teal + '20'
                    : 'transparent',
                  color: activeSection === section.id 
                    ? sigmatiqTheme.colors.primary.teal
                    : sigmatiqTheme.colors.text.secondary,
                  border: `1px solid ${
                    activeSection === section.id 
                      ? sigmatiqTheme.colors.primary.teal + '40'
                      : 'transparent'
                  }`
                }}
              >
                <section.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{section.title}</span>
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="px-4 pb-24 overflow-y-auto" style={{ maxHeight: '50vh' }}>
            <div className="space-y-2">
              {currentSection.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    item.action();
                    setIsMobileExpanded(false);
                  }}
                  className="w-full text-left p-3 rounded-lg transition-all"
                  style={{
                    backgroundColor: sigmatiqTheme.colors.background.primary,
                    border: `1px solid ${sigmatiqTheme.colors.border.default}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = sigmatiqTheme.colors.primary.teal;
                    e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.background.tertiary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = sigmatiqTheme.colors.border.default;
                    e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.background.primary;
                  }}
                >
                  <div className="font-medium text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    {item.label}
                  </div>
                  {item.description && (
                    <div className="text-xs mt-1" style={{ color: sigmatiqTheme.colors.text.muted }}>
                      {item.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}
      </>
    );
  };

  // Desktop side panel - context-aware
  const DesktopVersion = () => {
    // Don't show anything if there's no context
    if (!hasContext) {
      return null;
    }

    // Show panel when there's context
    return (
      <div 
        className="hidden lg:block fixed right-0 top-0 h-full z-10"
        style={{
          width: '320px',
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderLeft: `1px solid ${sigmatiqTheme.colors.border.default}`,
          paddingTop: '60px'
        }}
      >

        <div className="p-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: sigmatiqTheme.colors.text.primary }}>
              <Sparkles className="w-5 h-5" style={{ color: sigmatiqTheme.colors.primary.teal }} />
              Assistant Panel
            </h3>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map(section => (
              <div key={section.id}>
                <button
                  onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
                  className="w-full flex items-center justify-between p-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: activeSection === section.id 
                      ? sigmatiqTheme.colors.primary.teal + '10'
                      : 'transparent'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <section.icon 
                      className="w-4 h-4" 
                      style={{ 
                        color: activeSection === section.id 
                          ? sigmatiqTheme.colors.primary.teal
                          : sigmatiqTheme.colors.text.secondary
                      }} 
                    />
                    <span 
                      className="font-medium text-sm"
                      style={{ 
                        color: activeSection === section.id 
                          ? sigmatiqTheme.colors.primary.teal
                          : sigmatiqTheme.colors.text.primary
                      }}
                    >
                      {section.title}
                    </span>
                  </div>
                  {activeSection === section.id ? (
                    <ChevronUp className="w-4 h-4" style={{ color: sigmatiqTheme.colors.text.muted }} />
                  ) : (
                    <ChevronDown className="w-4 h-4" style={{ color: sigmatiqTheme.colors.text.muted }} />
                  )}
                </button>

                {activeSection === section.id && (
                  <div className="mt-2 space-y-1 pl-6">
                    {section.items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={item.action}
                        className="w-full text-left p-2 rounded-lg transition-all hover:translate-x-1"
                        style={{
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.background.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div className="text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
                            {item.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div 
            className="mt-6 p-3 rounded-lg"
            style={{
              backgroundColor: sigmatiqTheme.colors.background.primary,
              border: `1px solid ${sigmatiqTheme.colors.border.default}`
            }}
          >
            <div className="text-xs font-medium mb-2" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              QUICK STATS
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Watchlist</span>
                <span className="text-xs font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>12 stocks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Alerts</span>
                <span className="text-xs font-medium" style={{ color: sigmatiqTheme.colors.status.warning }}>3 active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>Screeners</span>
                <span className="text-xs font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>5 saved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <MobileVersion />
      <DesktopVersion />
    </>
  );
};

export default React.memo(AssistantPanel);