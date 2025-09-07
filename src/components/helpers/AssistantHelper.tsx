import React, { useState } from 'react';
import { 
  Zap, 
  BookOpen, 
  LineChart, 
  TrendingUp, 
  Filter,
  BarChart3,
  Search,
  Bell,
  Target,
  Briefcase,
  DollarSign,
  PieChart,
  X
} from 'lucide-react';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';

interface AssistantHelperProps {
  context?: any;
  onClose: () => void;
  onAction?: (action: string, data?: any) => void;
}

interface Section {
  id: string;
  title: string;
  icon: any;
  items: {
    label: string;
    description?: string;
    action: () => void;
  }[];
}

const AssistantHelper: React.FC<AssistantHelperProps> = ({ context, onClose, onAction }) => {
  const [activeSection, setActiveSection] = useState('actions');
  
  const handleAction = (action: string, data?: any) => {
    onAction?.(action, data);
    onClose();
  };

  const sections: Section[] = [
    {
      id: 'actions',
      title: 'Quick Actions',
      icon: Zap,
      items: [
        {
          label: 'Run Screener',
          description: 'Find trading opportunities',
          action: () => handleAction('setHelper', { helper: 'action', trigger: 'screener' })
        },
        {
          label: 'Market Overview',
          description: 'Today\'s market summary',
          action: () => handleAction('setHelper', { helper: 'charting', trigger: 'overview' })
        },
        {
          label: 'Set Alert',
          description: 'Price & indicator alerts',
          action: () => handleAction('alert')
        },
        {
          label: 'Portfolio Check',
          description: 'Review your holdings',
          action: () => handleAction('portfolio')
        }
      ]
    },
    {
      id: 'analysis',
      title: 'Analysis Tools',
      icon: BarChart3,
      items: [
        {
          label: 'Stock Info',
          description: 'Company details & metrics',
          action: () => handleAction('setHelper', { helper: 'stockInfo' })
        },
        {
          label: 'Technical Analysis',
          description: 'Chart patterns & indicators',
          action: () => handleAction('setHelper', { helper: 'charting', trigger: 'technical' })
        },
        {
          label: 'Compare Stocks',
          description: 'Side by side comparison',
          action: () => handleAction('setHelper', { helper: 'charting', trigger: 'compare' })
        },
        {
          label: 'Sector Heatmap',
          description: 'Market sector performance',
          action: () => handleAction('heatmap')
        }
      ]
    },
    {
      id: 'learning',
      title: 'Learn & Improve',
      icon: BookOpen,
      items: [
        {
          label: 'Trading Basics',
          description: 'Essential concepts',
          action: () => handleAction('setHelper', { helper: 'learning', topic: 'basics' })
        },
        {
          label: 'Strategy Guides',
          description: 'Trading strategies explained',
          action: () => handleAction('setHelper', { helper: 'learning', topic: 'strategies' })
        },
        {
          label: 'Risk Management',
          description: 'Protect your capital',
          action: () => handleAction('setHelper', { helper: 'learning', topic: 'risk' })
        },
        {
          label: 'Market Psychology',
          description: 'Understanding emotions',
          action: () => handleAction('setHelper', { helper: 'learning', topic: 'psychology' })
        }
      ]
    },
    {
      id: 'tools',
      title: 'Trading Tools',
      icon: Target,
      items: [
        {
          label: 'Position Sizing',
          description: 'Calculate optimal size',
          action: () => handleAction('positionSize')
        },
        {
          label: 'Risk/Reward',
          description: 'Analyze trade setup',
          action: () => handleAction('riskReward')
        },
        {
          label: 'P&L Calculator',
          description: 'Estimate profit/loss',
          action: () => handleAction('pnl')
        },
        {
          label: 'Trade Journal',
          description: 'Track your trades',
          action: () => handleAction('journal')
        }
      ]
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${sigmatiqTheme.colors.border.default}` }}>
        <h2 className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
          Sigmatiq Assistant
        </h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100/10 transition-colors"
          style={{ color: sigmatiqTheme.colors.text.secondary }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex px-4 py-2 gap-2 overflow-x-auto" style={{ borderBottom: `1px solid ${sigmatiqTheme.colors.border.default}` }}>
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
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-2">
          {currentSection.items.map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="w-full text-left p-3 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: sigmatiqTheme.colors.background.tertiary,
                border: `1px solid ${sigmatiqTheme.colors.border.default}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = sigmatiqTheme.colors.primary.teal;
                e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.background.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = sigmatiqTheme.colors.border.default;
                e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.background.tertiary;
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

      {/* Footer Tip */}
      <div className="p-3" style={{ borderTop: `1px solid ${sigmatiqTheme.colors.border.default}` }}>
        <p className="text-xs" style={{ color: sigmatiqTheme.colors.text.muted }}>
          💡 Tip: Use voice commands or type "/" to quickly access any feature
        </p>
      </div>
    </div>
  );
};

export default AssistantHelper;