import React, { useState, useEffect } from 'react';
import { 
  BookOpen,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  ChevronRight,
  Search,
  X,
  CheckCircle,
  Lock,
  HelpCircle,
  Award,
  BarChart3,
  Users,
  Star
} from 'lucide-react';
import { sigmatiqTheme } from '../../styles/sigmatiq-theme';
import LoadingIndicator from '../LoadingIndicator';

interface Props {
  onClose: () => void;
  initialTopic?: string;
  experience?: 'novice' | 'intermediate' | 'power';
  context?: {
    source: 'chat' | 'manual' | 'hover' | 'suggestion';
    searchTerm?: string;
  };
}

type TabType = 'learn' | 'practice' | 'glossary' | 'progress';

interface LearningTopic {
  id: string;
  title: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  completed: boolean;
  locked: boolean;
  description: string;
  lessons: number;
  completedLessons: number;
}

interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  example?: string;
  relatedTerms?: string[];
}

const LearningHelper: React.FC<Props> = ({ 
  onClose, 
  initialTopic, 
  experience = 'novice',
  context 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const [searchQuery, setSearchQuery] = useState(context?.searchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(initialTopic || null);
  const [loading, setLoading] = useState(false);

  // Sample learning topics
  const topics: LearningTopic[] = [
    {
      id: 'basics-1',
      title: 'What is Stock Trading?',
      category: 'basics',
      difficulty: 'beginner',
      duration: '10 min',
      completed: true,
      locked: false,
      description: 'Learn the fundamentals of buying and selling stocks',
      lessons: 5,
      completedLessons: 5
    },
    {
      id: 'basics-2',
      title: 'Reading Stock Charts',
      category: 'basics',
      difficulty: 'beginner',
      duration: '15 min',
      completed: false,
      locked: false,
      description: 'Understand candlestick patterns and chart basics',
      lessons: 7,
      completedLessons: 3
    },
    {
      id: 'indicators-1',
      title: 'RSI Indicator Explained',
      category: 'indicators',
      difficulty: 'intermediate',
      duration: '20 min',
      completed: false,
      locked: false,
      description: 'Master the Relative Strength Index for timing trades',
      lessons: 6,
      completedLessons: 0
    },
    {
      id: 'indicators-2',
      title: 'Moving Averages Strategy',
      category: 'indicators',
      difficulty: 'intermediate',
      duration: '25 min',
      completed: false,
      locked: false,
      description: 'Use SMA and EMA to identify trends',
      lessons: 8,
      completedLessons: 0
    },
    {
      id: 'strategies-1',
      title: 'Day Trading Strategies',
      category: 'strategies',
      difficulty: 'advanced',
      duration: '30 min',
      completed: false,
      locked: experience === 'novice',
      description: 'Advanced techniques for intraday trading',
      lessons: 10,
      completedLessons: 0
    },
    {
      id: 'platform-1',
      title: 'Using the Screener',
      category: 'platform',
      difficulty: 'beginner',
      duration: '8 min',
      completed: false,
      locked: false,
      description: 'Find stocks that match your criteria',
      lessons: 4,
      completedLessons: 1
    }
  ];

  // Sample glossary terms
  const glossaryTerms: GlossaryTerm[] = [
    {
      term: 'RSI',
      definition: 'Relative Strength Index - A momentum indicator that measures overbought or oversold conditions',
      category: 'indicators',
      example: 'RSI above 70 suggests overbought, below 30 suggests oversold',
      relatedTerms: ['MACD', 'Stochastic', 'Momentum']
    },
    {
      term: 'Bull Market',
      definition: 'A market condition where prices are rising or expected to rise',
      category: 'basics',
      example: 'The S&P 500 entered a bull market after rising 20% from its lows',
      relatedTerms: ['Bear Market', 'Market Cycle', 'Trend']
    },
    {
      term: 'Stop Loss',
      definition: 'An order to sell a security when it reaches a certain price to limit losses',
      category: 'risk',
      example: 'Setting a stop loss at $95 for a stock bought at $100 limits loss to 5%',
      relatedTerms: ['Take Profit', 'Risk Management', 'Position Sizing']
    },
    {
      term: 'Candlestick',
      definition: 'A chart pattern that shows open, high, low, and close prices for a period',
      category: 'charts',
      example: 'A green candlestick shows the close was higher than the open',
      relatedTerms: ['Doji', 'Hammer', 'Chart Patterns']
    },
    {
      term: 'Volume',
      definition: 'The number of shares traded during a specific period',
      category: 'basics',
      example: 'High volume on a breakout confirms the move',
      relatedTerms: ['Liquidity', 'Average Volume', 'Volume Profile']
    }
  ];

  // Filter topics based on search and category
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter glossary terms
  const filteredGlossary = glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate progress
  const totalLessons = topics.reduce((acc, t) => acc + t.lessons, 0);
  const completedLessons = topics.reduce((acc, t) => acc + t.completedLessons, 0);
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // Categories
  const categories = [
    { id: 'all', label: 'All Topics', count: topics.length },
    { id: 'basics', label: 'Basics', count: topics.filter(t => t.category === 'basics').length },
    { id: 'indicators', label: 'Indicators', count: topics.filter(t => t.category === 'indicators').length },
    { id: 'strategies', label: 'Strategies', count: topics.filter(t => t.category === 'strategies').length },
    { id: 'platform', label: 'Platform', count: topics.filter(t => t.category === 'platform').length }
  ];

  // Practice questions
  const practiceQuestions = [
    {
      id: 1,
      question: 'What does RSI above 70 typically indicate?',
      options: ['Overbought', 'Oversold', 'Neutral', 'Strong trend'],
      correct: 0,
      explanation: 'RSI above 70 suggests the asset may be overbought and due for a pullback.'
    },
    {
      id: 2,
      question: 'Which moving average reacts faster to price changes?',
      options: ['SMA', 'EMA', 'Both same', 'Neither'],
      correct: 1,
      explanation: 'EMA (Exponential Moving Average) gives more weight to recent prices.'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return sigmatiqTheme.colors.semantic.success;
      case 'intermediate': return sigmatiqTheme.colors.semantic.warning;
      case 'advanced': return sigmatiqTheme.colors.semantic.error;
      default: return sigmatiqTheme.colors.text.secondary;
    }
  };

  const tabs = [
    { id: 'learn' as TabType, label: 'Learn', icon: BookOpen },
    { id: 'practice' as TabType, label: 'Practice', icon: Target },
    { id: 'glossary' as TabType, label: 'Glossary', icon: HelpCircle },
    { id: 'progress' as TabType, label: 'Progress', icon: Trophy }
  ];

  return (
    <div 
      className="rounded-xl border overflow-hidden"
      style={{ 
        backgroundColor: sigmatiqTheme.colors.background.card,
        borderColor: sigmatiqTheme.colors.border.default 
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: sigmatiqTheme.colors.border.default }}
      >
        <div className="flex items-center gap-3">
          <BookOpen size={20} style={{ color: sigmatiqTheme.colors.text.accent }} />
          <div>
            <h3 className="text-lg font-semibold" style={{ color: sigmatiqTheme.colors.text.primary }}>
              Learning Center
            </h3>
            <p className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              Expand your trading knowledge
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-2 rounded hover:bg-opacity-10 transition-colors"
          style={{ color: sigmatiqTheme.colors.text.secondary }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div 
        className="flex border-b"
        style={{ borderColor: sigmatiqTheme.colors.border.default }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors relative"
            style={{
              color: activeTab === tab.id 
                ? sigmatiqTheme.colors.text.accent 
                : sigmatiqTheme.colors.text.secondary,
              backgroundColor: activeTab === tab.id 
                ? sigmatiqTheme.colors.background.secondary 
                : 'transparent'
            }}
          >
            <tab.icon size={16} />
            <span className="text-sm font-medium">{tab.label}</span>
            {activeTab === tab.id && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: sigmatiqTheme.colors.text.accent }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <Search 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            style={{ color: sigmatiqTheme.colors.text.tertiary }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-3 py-2 rounded-lg border text-sm"
            style={{
              backgroundColor: sigmatiqTheme.colors.background.secondary,
              borderColor: sigmatiqTheme.colors.border.default,
              color: sigmatiqTheme.colors.text.primary
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {activeTab === 'learn' && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="px-3 py-1 rounded text-sm transition-colors"
                  style={{
                    backgroundColor: selectedCategory === cat.id 
                      ? sigmatiqTheme.colors.text.accent 
                      : sigmatiqTheme.colors.background.secondary,
                    color: selectedCategory === cat.id 
                      ? sigmatiqTheme.colors.background.primary 
                      : sigmatiqTheme.colors.text.primary,
                    border: `1px solid ${sigmatiqTheme.colors.border.default}`
                  }}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            {/* Topics List */}
            <div className="space-y-2">
              {filteredTopics.map(topic => (
                <div
                  key={topic.id}
                  className="p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md"
                  style={{
                    backgroundColor: sigmatiqTheme.colors.background.secondary,
                    borderColor: topic.completed 
                      ? sigmatiqTheme.colors.semantic.success 
                      : sigmatiqTheme.colors.border.default,
                    opacity: topic.locked ? 0.6 : 1
                  }}
                  onClick={() => !topic.locked && setSelectedTopic(topic.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm" style={{ color: sigmatiqTheme.colors.text.primary }}>
                          {topic.title}
                        </h4>
                        {topic.completed && (
                          <CheckCircle size={14} style={{ color: sigmatiqTheme.colors.semantic.success }} />
                        )}
                        {topic.locked && (
                          <Lock size={14} style={{ color: sigmatiqTheme.colors.text.tertiary }} />
                        )}
                      </div>
                      <p className="text-xs mb-2" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                        {topic.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span style={{ color: getDifficultyColor(topic.difficulty) }}>
                          {topic.difficulty}
                        </span>
                        <span style={{ color: sigmatiqTheme.colors.text.tertiary }}>
                          <Clock size={12} className="inline mr-1" />
                          {topic.duration}
                        </span>
                        <span style={{ color: sigmatiqTheme.colors.text.tertiary }}>
                          {topic.completedLessons}/{topic.lessons} lessons
                        </span>
                      </div>
                      {topic.completedLessons > 0 && topic.completedLessons < topic.lessons && (
                        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all"
                            style={{ 
                              width: `${(topic.completedLessons / topic.lessons) * 100}%`,
                              backgroundColor: sigmatiqTheme.colors.text.accent 
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <ChevronRight 
                      size={16} 
                      style={{ color: sigmatiqTheme.colors.text.tertiary }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
            >
              <h4 className="font-medium mb-3" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Quick Quiz
              </h4>
              {practiceQuestions.map((q, idx) => (
                <div key={q.id} className="mb-4">
                  <p className="text-sm mb-2" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    {idx + 1}. {q.question}
                  </p>
                  <div className="space-y-1">
                    {q.options.map((option, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-3 py-2 rounded text-sm transition-colors hover:bg-opacity-10"
                        style={{
                          backgroundColor: sigmatiqTheme.colors.background.primary,
                          color: sigmatiqTheme.colors.text.primary,
                          border: `1px solid ${sigmatiqTheme.colors.border.default}`
                        }}
                        onClick={() => {
                          alert(i === q.correct ? 'Correct! ' + q.explanation : 'Try again!');
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: sigmatiqTheme.colors.background.secondary,
                borderColor: sigmatiqTheme.colors.border.default
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} style={{ color: sigmatiqTheme.colors.text.accent }} />
                <h4 className="font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                  Practice Trading
                </h4>
              </div>
              <p className="text-xs mb-3" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                Try paper trading with virtual money to practice your skills
              </p>
              <button
                className="px-4 py-2 rounded text-sm font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: sigmatiqTheme.colors.text.accent,
                  color: sigmatiqTheme.colors.background.primary
                }}
              >
                Start Paper Trading
              </button>
            </div>
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className="space-y-3">
            {filteredGlossary.map(term => (
              <div
                key={term.term}
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: sigmatiqTheme.colors.background.secondary,
                  borderColor: sigmatiqTheme.colors.border.default
                }}
              >
                <h4 className="font-medium text-sm mb-1" style={{ color: sigmatiqTheme.colors.text.primary }}>
                  {term.term}
                </h4>
                <p className="text-xs mb-2" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                  {term.definition}
                </p>
                {term.example && (
                  <div 
                    className="p-2 rounded text-xs"
                    style={{ 
                      backgroundColor: sigmatiqTheme.colors.background.primary,
                      color: sigmatiqTheme.colors.text.secondary
                    }}
                  >
                    <strong>Example:</strong> {term.example}
                  </div>
                )}
                {term.relatedTerms && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {term.relatedTerms.map(related => (
                      <span
                        key={related}
                        className="px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: sigmatiqTheme.colors.background.primary,
                          color: sigmatiqTheme.colors.text.accent
                        }}
                        onClick={() => setSearchQuery(related)}
                      >
                        {related}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            {/* Overall Progress */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                  Overall Progress
                </h4>
                <Trophy size={20} style={{ color: sigmatiqTheme.colors.semantic.warning }} />
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: sigmatiqTheme.colors.text.secondary }}>
                    {completedLessons} of {totalLessons} lessons
                  </span>
                  <span style={{ color: sigmatiqTheme.colors.text.accent }}>
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${progressPercent}%`,
                      backgroundColor: sigmatiqTheme.colors.text.accent 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
            >
              <h4 className="font-medium mb-3" style={{ color: sigmatiqTheme.colors.text.primary }}>
                Achievements
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div 
                  className="p-2 rounded text-center"
                  style={{ backgroundColor: sigmatiqTheme.colors.background.primary }}
                >
                  <Award size={24} className="mx-auto mb-1" style={{ color: sigmatiqTheme.colors.semantic.warning }} />
                  <p className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                    First Trade
                  </p>
                </div>
                <div 
                  className="p-2 rounded text-center opacity-50"
                  style={{ backgroundColor: sigmatiqTheme.colors.background.primary }}
                >
                  <Star size={24} className="mx-auto mb-1" style={{ color: sigmatiqTheme.colors.text.tertiary }} />
                  <p className="text-xs" style={{ color: sigmatiqTheme.colors.text.tertiary }}>
                    10 Wins
                  </p>
                </div>
                <div 
                  className="p-2 rounded text-center opacity-50"
                  style={{ backgroundColor: sigmatiqTheme.colors.background.primary }}
                >
                  <TrendingUp size={24} className="mx-auto mb-1" style={{ color: sigmatiqTheme.colors.text.tertiary }} />
                  <p className="text-xs" style={{ color: sigmatiqTheme.colors.text.tertiary }}>
                    Profit Master
                  </p>
                </div>
              </div>
            </div>

            {/* Study Streak */}
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: sigmatiqTheme.colors.background.secondary,
                borderColor: sigmatiqTheme.colors.border.default
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium" style={{ color: sigmatiqTheme.colors.text.primary }}>
                    Study Streak
                  </h4>
                  <p className="text-xs mt-1" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                    Keep learning every day!
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: sigmatiqTheme.colors.text.accent }}>
                    3
                  </div>
                  <div className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                    days
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Beginner Tip */}
      {experience === 'novice' && (
        <div 
          className="p-3 m-4 mt-0 rounded-lg flex items-start gap-2"
          style={{ backgroundColor: sigmatiqTheme.colors.background.secondary }}
        >
          <HelpCircle size={16} style={{ color: sigmatiqTheme.colors.text.accent }} />
          <div className="flex-1">
            <p className="text-xs" style={{ color: sigmatiqTheme.colors.text.secondary }}>
              <strong>Tip:</strong> Start with the Basics category to build a strong foundation before moving to advanced topics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningHelper;