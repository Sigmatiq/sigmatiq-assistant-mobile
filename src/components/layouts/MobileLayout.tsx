import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useAppStore from '../../stores/useAppStore';
import MobileHeader from '../MobileHeader';
import OptimizedHeader from '../OptimizedHeader';
import MobileNav from '../MobileNav';
import AssistantPanel from '../AssistantPanel';
import Dashboard from '../../pages/Dashboard';
import Chat from '../../pages/Chat';
import Settings from '../../pages/Settings';
import Logo from '../Logo';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import GestureLayer from '../GestureLayer';

const MobileLayout = () => {
  const { activeView, isMobileMenuOpen, toggleMobileMenu } = useAppStore();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return <Chat />;
      case 'screener':
        return <div className="p-4">Screener (Coming Soon)</div>;
      case 'charts':
        return <div className="p-4">Charts (Coming Soon)</div>;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: sigmatiqTheme.colors.background.primary }}>
      {/* Optimized Header - Fixed at top for both mobile and desktop */}
      <OptimizedHeader />
      
      {/* Main layout container with padding for fixed header */}
      <div className="flex flex-col lg:flex-row pt-20">
        {/* Desktop Sidebar - only show on desktop */}
        {isDesktop && (
          <aside 
            className="hidden lg:block w-64 border-r h-[calc(100vh-5rem)] sticky top-20"
            style={{ 
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              borderColor: sigmatiqTheme.colors.border.default 
            }}
          >
            <MobileNav isDesktop={true} />
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col pb-20 lg:pb-0">
          {/* Page Content */}
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 lg:px-6 py-4">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - only show on mobile */}
      {!isDesktop && (
        <nav 
          className="lg:hidden fixed bottom-0 left-0 right-0 border-t safe-bottom"
          style={{ 
            backgroundColor: sigmatiqTheme.colors.background.secondary,
            borderColor: sigmatiqTheme.colors.border.default 
          }}
        >
          <MobileNav />
        </nav>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && !isDesktop && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleMobileMenu}>
          <div 
            className="absolute left-0 top-0 h-full w-64 p-4"
            style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
          >
            <div className="flex justify-between items-center mb-8">
              <Logo size="sm" variant="full" />
              <button 
                onClick={toggleMobileMenu} 
                className="p-2"
                style={{ color: sigmatiqTheme.colors.text.secondary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Add menu items here */}
          </div>
        </div>
      )}

      {/* Assistant Panel - Shows on both mobile and desktop */}
      <AssistantPanel />
      {/* Gesture Layer for quick mode switching (swipe) */}
      <GestureLayer />
    </div>
  );
};

export default MobileLayout;
