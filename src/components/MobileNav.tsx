import { Home, MessageCircle, TrendingUp, LineChart, Settings } from 'lucide-react';
import useAppStore from '../stores/useAppStore';
import { clsx } from 'clsx';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';

interface NavItem {
  id: 'dashboard' | 'chat' | 'screener' | 'charts' | 'settings';
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'chat', icon: MessageCircle, label: 'Chat' },
  { id: 'screener', icon: TrendingUp, label: 'Screen' },
  { id: 'charts', icon: LineChart, label: 'Charts' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

interface MobileNavProps {
  isDesktop?: boolean;
}

const MobileNav = ({ isDesktop = false }: MobileNavProps) => {
  const { activeView, setActiveView } = useAppStore();

  if (isDesktop) {
    // Desktop sidebar navigation
    return (
      <nav className="px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1',
                'transition-all duration-200'
              )}
              style={{
                backgroundColor: isActive ? 'rgba(26, 188, 156, 0.15)' : 'transparent',
                color: isActive ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.secondary,
                ':hover': {
                  backgroundColor: sigmatiqTheme.colors.background.hover,
                  color: sigmatiqTheme.colors.text.primary
                }
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.background.hover;
                  e.currentTarget.style.color = sigmatiqTheme.colors.text.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = sigmatiqTheme.colors.text.secondary;
                }
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Mobile bottom navigation
  return (
    <div className="flex justify-around items-center py-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={clsx(
              'flex flex-col items-center gap-1 p-2 min-w-[64px]',
              'transition-colors duration-200'
            )}
            style={{
              color: isActive ? sigmatiqTheme.colors.primary.teal : sigmatiqTheme.colors.text.secondary
            }}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileNav;