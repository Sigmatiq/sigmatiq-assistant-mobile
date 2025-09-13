import React, { useState, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
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
  Target,
  Loader2,
  XCircle
} from 'lucide-react';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';
import CalendarDetailHelper from './helpers/CalendarDetailHelper';
import useAppStore from '../stores/useAppStore';

// Lazy load helpers for better performance
const ChartingHelper = lazy(() => import('./helpers/ChartingHelper'));
const ActionHelper = lazy(() => import('./helpers/ActionHelper'));
const LearningHelper = lazy(() => import('./helpers/LearningHelper'));
const StockInfoHelper = lazy(() => import('./helpers/StockInfoHelper'));
const AssistantHelper = lazy(() => import('./helpers/AssistantHelper'));
const ListHelper = lazy(() => import('./helpers/ListHelper'));
const CompanyCalendarHelper = lazy(() => import('./helpers/CompanyCalendarHelper'));

// Import StockInfoPanel for embedding in tablet/desktop views
import StockInfoPanel from './StockInfoPanel';

/**
 * 4-Persona Review:
 * 
 * Professional Trader:
 * - Quick access to all trading tools via panel
 * - Context-aware helpers launch with relevant data
 * - Seamless integration between panel and helpers
 * 
 * Senior Architect:
 * - Lazy loading for performance optimization
 * - State management via Zustand store
 * - Proper separation of concerns
 * 
 * Senior Developer:
 * - Clean integration with helper components
 * - Proper error boundaries with Suspense
 * - Consistent prop passing patterns
 * 
 * Beginner Trader:
 * - Easy to understand panel sections
 * - Clear descriptions for each action
 * - Mobile-friendly FAB for quick access
 */

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
  const [activeSection, setActiveSection] = useState<string>('actions');
  // Treat mobile+tablet as drawer mode: width < 1024 (Tailwind lg breakpoint)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { 
    setActiveView, 
    selectedSymbol, 
    activeView,
    activeHelper,
    setActiveHelper,
    helperContext,
    setHelperContext,
    clearHelper,
    clearContext
  } = useAppStore();

  // Show stock info helper when floating button is clicked
  const showAssistantHelper = () => {
    console.log('Showing stock info for AAPL');
    setActiveHelper('stockInfo');
    setHelperContext({ symbol: 'AAPL', source: 'floating-button' });
  };

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear any active helper on tablets/desktop to prevent duplicate panels
  React.useEffect(() => {
    if (window.innerWidth >= 768 && activeHelper === 'stockInfo') {
      clearHelper();
    }
  }, [activeHelper, clearHelper]);

  // Only show panel when there's a selected symbol
  const hasContext = !!selectedSymbol;
  
  // Helper is rendering in the main helper modal/drawer

  // Helper action handler
  const handleHelperAction = (action: string, data?: any) => {
    console.log('Helper action:', action, data);
    
    // Handle specific actions
    switch(action) {
      case 'runScreener':
        setActiveView('screener');
        clearHelper();
        break;
      case 'viewChart':
        if (data?.symbol) {
          setActiveHelper('charting');
          setHelperContext({ symbol: data.symbol, source: 'panel' });
        }
        break;
      case 'viewStock':
        if (data?.symbol) {
          setActiveHelper('stockInfo');
          setHelperContext({ symbol: data.symbol, source: 'panel' });
        }
        break;
      case 'learn':
        if (data?.topic) {
          setActiveHelper('learning');
          setHelperContext({ topic: data.topic, source: 'panel' });
        }
        break;
      default:
        // Handle other actions
        break;
    }
  };

  const sections: PanelSection[] = [
    {
      id: 'actions',
      title: 'Quick Actions',
      icon: Zap,
      items: [
        {
          label: 'Run Screener',
          description: 'Find opportunities',
          action: () => {
            setActiveHelper('action');
            setHelperContext({ source: 'panel', trigger: 'screener' });
          }
        },
        {
          label: 'Market Overview',
          description: 'Today\'s summary',
          action: () => {
            setActiveHelper('charting');
            setHelperContext({ symbol: 'SPY', source: 'panel', trigger: 'market' });
          }
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
          action: () => {
            if (selectedSymbol) {
              setActiveHelper('stockInfo');
              setHelperContext({ symbol: selectedSymbol, source: 'panel' });
            }
          }
        },
        {
          label: 'Financials',
          description: 'Income & balance sheet',
          action: () => {
            if (selectedSymbol) {
              setActiveHelper('stockInfo');
              setHelperContext({ symbol: selectedSymbol, source: 'panel', trigger: 'financials' });
            }
          }
        },
        {
          label: 'News & Events',
          description: 'Latest updates',
          action: () => {
            if (selectedSymbol) {
              setActiveHelper('stockInfo');
              setHelperContext({ symbol: selectedSymbol, source: 'panel', trigger: 'news' });
            }
          }
        },
        {
          label: 'Company Calendar',
          description: 'Earnings, dividends, splits',
          action: () => {
            if (selectedSymbol) {
              setActiveHelper('companyCalendar');
              setHelperContext({ symbol: selectedSymbol, source: 'panel' });
            }
          }
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
          action: () => {
            setActiveHelper('learning');
            setHelperContext({ source: 'panel', topic: 'basics' });
          }
        },
        {
          label: 'Strategy Guides',
          description: 'Advanced tactics',
          action: () => {
            setActiveHelper('learning');
            setHelperContext({ source: 'panel', topic: 'strategies' });
          }
        },
        {
          label: 'Indicator Wiki',
          description: 'How they work',
          action: () => {
            setActiveHelper('learning');
            setHelperContext({ source: 'panel', topic: 'indicators' });
          }
        },
        {
          label: 'Video Tutorials',
          description: 'Watch & learn',
          action: () => {
            setActiveHelper('learning');
            setHelperContext({ source: 'panel', topic: 'videos' });
          }
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
          action: () => {
            setActiveHelper('charting');
            setHelperContext({ symbol: selectedSymbol || 'SPY', source: 'panel' });
          }
        },
        {
          label: 'Technical View',
          description: 'With indicators',
          action: () => {
            setActiveHelper('charting');
            setHelperContext({ 
              symbol: selectedSymbol || 'SPY', 
              source: 'panel',
              trigger: 'technical'
            });
          }
        },
        {
          label: 'Compare Stocks',
          description: 'Side by side',
          action: () => {
            setActiveHelper('charting');
            setHelperContext({ 
              symbol: selectedSymbol || 'SPY',
              source: 'panel',
              trigger: 'compare'
            });
          }
        },
        {
          label: 'Heatmap',
          description: 'Market sectors',
          action: () => console.log('Heatmap')
        }
      ]
    }
  ];

  // Loading fallback
  const LoadingFallback = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: sigmatiqTheme.colors.text.secondary
    }}>
      <Loader2 className="animate-spin" size={24} />
      <span style={{ marginLeft: 8 }}>Loading helper...</span>
    </div>
  );

  // Helper Modal (existing drawer on mobile, modal on desktop)
  const HelperModal = () => {
    if (!activeHelper) return null;

    const getHelperTitle = () => {
      switch (activeHelper) {
        case 'charting':
          return `Chart: ${helperContext.symbol || selectedSymbol || 'SPY'}`;
        case 'action':
          return 'Action Center';
        case 'learning':
          return 'Learning Center';
        case 'stockInfo':
          return `Stock: ${helperContext.symbol || 'Info'}`;
        default:
          return 'Helper';
      }
    };

    const HelperContent = React.useMemo(() => (
      <div className={isMobile ? 'helper-mobile-view' : ''}>
        <Suspense fallback={<LoadingFallback />}>
          {activeHelper === 'charting' && (
            <ChartingHelper
              symbol={helperContext.symbol || selectedSymbol || 'SPY'}
              onClose={clearHelper}
              onAction={handleHelperAction}
              context={helperContext}
            />
          )}
          {activeHelper === 'action' && (
            <ActionHelper
              onClose={clearHelper}
              onAction={handleHelperAction}
              context={helperContext}
            />
          )}
          {activeHelper === 'learning' && (
            <LearningHelper
              initialTopic={helperContext.topic}
              onClose={clearHelper}
              onAction={handleHelperAction}
              context={{
                source: (helperContext.source || 'manual') as 'chat' | 'manual' | 'hover' | 'suggestion' | 'palette',
                searchTerm: helperContext.topic
              }}
            />
          )}
          {activeHelper === 'stockInfo' && helperContext.symbol && (
            <StockInfoHelper
              symbol={helperContext.symbol}
              onClose={clearHelper}
              onAction={handleHelperAction}
              context={{
                source: helperContext.source as 'panel' | 'chat' | 'search' || 'panel',
                trigger: helperContext.trigger
              }}
            />
          )}
          {activeHelper === 'assistant' && (
            <AssistantHelper
              context={helperContext}
              onClose={clearHelper}
              onAction={(action, data) => {
                if (action === 'setHelper' && data?.helper) {
                  setActiveHelper(data.helper);
                  setHelperContext({ ...helperContext, ...data });
                } else {
                  handleHelperAction(action, data);
                }
              }}
            />
          )}
          {activeHelper === 'list' && (
            <ListHelper
              context={helperContext as any}
              onClose={clearHelper}
              onAction={(action, data) => {
                if (action === 'setHelper' && data?.helper) {
                  setActiveHelper(data.helper);
                  setHelperContext({ ...helperContext, ...data });
                } else {
                  handleHelperAction(action, data);
                }
              }}
            />
          )}
          {activeHelper === 'companyCalendar' && (
            <CompanyCalendarHelper
              context={helperContext as any}
              onClose={clearHelper}
            />
          )}
          {activeHelper === 'calendar' && (
            <CalendarDetailHelper
              context={helperContext as any}
              onClose={clearHelper}
            />
          )}
        </Suspense>
      </div>
    ), [activeHelper, helperContext, selectedSymbol, clearHelper, handleHelperAction, isMobile, setActiveHelper, setHelperContext]);

    // Prevent background scroll when helper is open
    React.useEffect(() => {
      const prevOverflow = document.body.style.overflow;
      const prevPosition = document.body.style.position;
      const prevWidth = document.body.style.width;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'relative';
      document.body.style.width = '100%';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.position = prevPosition;
        document.body.style.width = prevWidth;
      };
    }, []);

    // Use drawer pattern for mobile and tablets (< 1280px)
    if (isMobile) {
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const drawerRef = React.useRef<HTMLDivElement | null>(null);
      // Focus management and ESC-to-close
      React.useEffect(() => {
        const prev = document.activeElement as HTMLElement | null;
        // Focus the drawer container
        setTimeout(() => drawerRef.current?.focus(), 0);
        const onKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            clearHelper();
          }
          if (e.key === 'Tab') {
            // Basic focus trap
            const root = drawerRef.current;
            if (!root) return;
            const focusable = root.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => {
          document.removeEventListener('keydown', onKeyDown);
          // Restore focus
          try { prev?.focus(); } catch {}
        };
      }, [clearHelper]);
      
      return (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={clearHelper}
            style={{
              animation: 'fadeIn 0.2s ease-out',
              zIndex: 9998
            }}
          />
          
          {/* Mobile/Tablet Helper Drawer */}
          <div 
            className={isTablet ? "fixed right-0 top-0 h-screen" : "fixed inset-x-0 bottom-0 animate-slide-up"}
            role="dialog" aria-modal="true" aria-label="Assistant Helper"
            ref={drawerRef} tabIndex={-1}
            style={isTablet ? {
              width: '450px',
              height: '100vh',
              backgroundColor: sigmatiqTheme.colors.background.card,
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
              zIndex: 9999
            } : {
              maxHeight: '85vh',
              backgroundColor: sigmatiqTheme.colors.background.card,
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
              overscrollBehavior: 'contain',
              zIndex: 9999
            }}
          >
            {/* Drawer Handle - only on mobile */}
            {!isTablet && (
              <div className="flex justify-center py-2">
                <div 
                  className="w-12 h-1 rounded-full"
                  style={{ backgroundColor: sigmatiqTheme.colors.background.primary }}
                />
              </div>
            )}
            
            {/* Content - No header, helper provides its own */}
            <div className="overflow-y-auto safe-bottom" style={{ 
              maxHeight: isTablet ? '100vh' : 'calc(85vh - 20px)',
              overscrollBehavior: 'contain'
            }}>
              {HelperContent}
            </div>
          </div>
        </>
      );
    }

    // Desktop modal
    const desktopModal = (
      <div 
        className="fixed inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9998 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            clearHelper();
          }
        }}
      >
        <div 
          className="fixed inset-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
          style={{
            width: '90vw',
            maxWidth: '1400px',
            height: '95vh',
            backgroundColor: sigmatiqTheme.colors.background.card,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            zIndex: 9999
          }}
        >
          {HelperContent}
        </div>
      </div>
    );
    return createPortal(desktopModal, document.body);
  };

  // Mobile floating button and drawer
  const MobileVersion = () => {
    // Show FAB only when there's context
    if (!hasContext) {
      return null;
    }
    
    return (
      <>
        {/* Floating Action Button - Shows only on mobile (below md breakpoint) */}
        <button
          onClick={showAssistantHelper}
          className="fixed right-4 w-14 h-14 rounded-full shadow-lg z-50 md:hidden flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            bottom: activeView === 'chat' ? '160px' : '96px',
            backgroundColor: sigmatiqTheme.colors.primary.teal,
            boxShadow: sigmatiqTheme.shadows.glow
          }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </button>

        {/* Old drawer completely removed - using helper system */}
      </>
    );
  };

  // Tablet side panel (768-1280px) - context-aware
  const TabletVersion = () => {
    // Don't show anything if there's no context
    if (!hasContext) {
      return null;
    }

    // Show panel for tablets (md to xl)
    return (
      <div 
        className="hidden md:block xl:hidden fixed right-0 top-0 h-screen z-10"
        style={{
          width: '380px',
          height: '100vh',
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderLeft: `1px solid ${sigmatiqTheme.colors.border.default}`,
          paddingTop: '0px'
        }}
      >
        <div className="h-full flex flex-col">
          {/* Header only when no symbol selected */}
          {!selectedSymbol && (
            <div className="p-4 border-b" style={{ borderColor: sigmatiqTheme.colors.border.default }}>
              <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: sigmatiqTheme.colors.text.primary }}>
                <Sparkles className="w-5 h-5" style={{ color: sigmatiqTheme.colors.primary.teal }} />
                Assistant Panel
              </h3>
              <p className="text-sm mt-1" style={{ color: sigmatiqTheme.colors.text.muted }}>
                Select a stock to view details
              </p>
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            {/* Embed StockInfoPanel directly for tablets */}
            {selectedSymbol ? (
              <StockInfoPanel 
                symbol={selectedSymbol}
                onClear={() => clearContext()}
                onAction={(action, data) => {
                  if (action === 'viewChart') {
                    setActiveHelper('charting');
                    setHelperContext({ symbol: selectedSymbol, source: 'panel' });
                  } else if (action === 'setAlert') {
                    console.log('Set alert for:', selectedSymbol);
                  } else if (action === 'companyCalendar') {
                    setActiveHelper('companyCalendar');
                    setHelperContext({ symbol: selectedSymbol, source: 'panel' });
                  } else if (action === 'addWatchlist') {
                    console.log('Add to watchlist:', selectedSymbol);
                  }
                }}
              />
            ) : (
              <div className="p-4 overflow-y-auto h-full">
                {/* Sections */}
                <div className="space-y-4">
              {sections.map(section => (
                <div key={section.id}>
                  <button
                    onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg transition-all"
                    style={{
                      backgroundColor: activeSection === section.id 
                        ? sigmatiqTheme.colors.primary.teal + '10'
                        : 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <section.icon 
                        className="w-5 h-5"
                      />
                      <span 
                        className="font-medium"
                        style={{ 
                          color: activeSection === section.id 
                            ? sigmatiqTheme.colors.primary.teal
                            : sigmatiqTheme.colors.text.primary
                        }}
                      >
                        {section.title === 'Stock Info' && selectedSymbol ? `${selectedSymbol} Info` : section.title}
                      </span>
                    </div>
                    {activeSection === section.id ? (
                      <ChevronUp className="w-5 h-5" style={{ color: sigmatiqTheme.colors.text.muted }} />
                    ) : (
                      <ChevronDown className="w-5 h-5" style={{ color: sigmatiqTheme.colors.text.muted }} />
                    )}
                  </button>

                  {activeSection === section.id && (
                    <div className="mt-2 space-y-1">
                      {section.items.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={item.action}
                          className="w-full text-left p-3 rounded-lg hover:bg-opacity-50 transition-all"
                          style={{
                            backgroundColor: sigmatiqTheme.colors.background.primary + '50'
                          }}
                        >
                          <div 
                            className="font-medium text-sm mb-1"
                            style={{ color: sigmatiqTheme.colors.text.primary }}
                          >
                            {item.label}
                          </div>
                          {item.description && (
                            <div 
                              className="text-xs"
                              style={{ color: sigmatiqTheme.colors.text.muted }}
                            >
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
              className="mt-6 p-4 rounded-lg"
              style={{
                backgroundColor: sigmatiqTheme.colors.background.primary,
                border: `1px solid ${sigmatiqTheme.colors.border.default}`
              }}
            >
              <div className="text-sm font-medium mb-3" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                QUICK STATS
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>Watchlist</span>
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>12 stocks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>Alerts</span>
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.status.warning }}>3 active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>Saved Screens</span>
                  <span className="text-sm font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>5</span>
                </div>
              </div>
            </div>

            {/* Market Status */}
            <div 
              className="mt-4 p-4 rounded-lg"
              style={{
                backgroundColor: sigmatiqTheme.colors.background.primary,
                border: `1px solid ${sigmatiqTheme.colors.border.default}`
              }}
            >
              <div className="text-sm font-medium mb-3" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                MARKET STATUS
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>NYSE</span>
                  <span className="text-sm font-medium px-2 py-1 rounded" style={{ 
                    backgroundColor: sigmatiqTheme.colors.status.success + '20',
                    color: sigmatiqTheme.colors.status.success
                  }}>Open</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.muted }}>NASDAQ</span>
                  <span className="text-sm font-medium px-2 py-1 rounded" style={{ 
                    backgroundColor: sigmatiqTheme.colors.status.success + '20',
                    color: sigmatiqTheme.colors.status.success
                  }}>Open</span>
                </div>
              </div>
            </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Desktop side panel - context-aware
  const DesktopVersion = () => {
    // Don't show anything if there's no context
    if (!hasContext) {
      return null;
    }

    // Show panel when there's context - only on large desktops
    return (
      <div 
        className="hidden xl:block fixed right-0 top-0 h-screen z-10"
        style={{
          width: '320px',
          height: '100vh',
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderLeft: `1px solid ${sigmatiqTheme.colors.border.default}`,
          paddingTop: '0px'
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
      <TabletVersion />
      <DesktopVersion />
      <HelperModal />
    </>
  );
};

export default React.memo(AssistantPanel);
