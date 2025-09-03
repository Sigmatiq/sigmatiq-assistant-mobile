import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, TrendingUp, BarChart3, BrainCircuit, Zap, MessageSquare } from 'lucide-react';
import { useAssistantMutation } from '../api/queries';
import useAppStore from '../stores/useAppStore';
import { sigmatiqTheme } from '../styles/sigmatiq-theme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface Suggestion {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  query: string;
  color: string;
}

const suggestions: Suggestion[] = [
  {
    icon: TrendingUp,
    title: "Market Movers",
    description: "Top gainers and losers today",
    query: "What stocks are moving the most today?",
    color: sigmatiqTheme.colors.status.success
  },
  {
    icon: BarChart3,
    title: "RSI Screener",
    description: "Find oversold opportunities",
    query: "Show me stocks with RSI below 30",
    color: sigmatiqTheme.colors.primary.teal
  },
  {
    icon: BrainCircuit,
    title: "Stock Analysis",
    description: "Deep dive into any ticker",
    query: "Give me a comprehensive analysis of AAPL",
    color: sigmatiqTheme.colors.primary.golden
  },
  {
    icon: Zap,
    title: "Quick Signals",
    description: "Actionable trading signals",
    query: "What are today's best trading opportunities?",
    color: sigmatiqTheme.colors.status.warning
  }
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatContext } = useAppStore();
  const assistantMutation = useAssistantMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    // Hide welcome screen after first message
    setShowWelcome(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Call assistant API
    try {
      const response = await assistantMutation.mutateAsync({
        question: messageText,
        mode: 'normal',
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.answer,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (query: string) => {
    setInput(query);
    handleSend(query);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 lg:pb-24">
        {showWelcome && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{
                  background: sigmatiqTheme.colors.primary.gradient,
                  boxShadow: sigmatiqTheme.shadows.glow
                }}
              >
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: sigmatiqTheme.colors.text.primary }}
              >
                Welcome to SIGMATIQ Assistant
              </h1>
              <p 
                className="text-lg"
                style={{ color: sigmatiqTheme.colors.text.secondary }}
              >
                Your AI-powered trading companion. Ask me anything about markets, analysis, or strategies.
              </p>
            </div>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.query)}
                  className="group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:scale-105 text-left"
                  style={{
                    backgroundColor: sigmatiqTheme.colors.background.secondary,
                    border: `1px solid ${sigmatiqTheme.colors.border.default}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = suggestion.color;
                    e.currentTarget.style.boxShadow = `0 0 20px ${suggestion.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = sigmatiqTheme.colors.border.default;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Gradient overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${suggestion.color} 0%, transparent 100%)`
                    }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{
                          backgroundColor: suggestion.color + '20',
                          color: suggestion.color
                        }}
                      >
                        <suggestion.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 
                          className="font-semibold mb-1"
                          style={{ color: sigmatiqTheme.colors.text.primary }}
                        >
                          {suggestion.title}
                        </h3>
                        <p 
                          className="text-sm"
                          style={{ color: sigmatiqTheme.colors.text.muted }}
                        >
                          {suggestion.description}
                        </p>
                      </div>
                      <Sparkles 
                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: suggestion.color }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick Tips */}
            <div 
              className="mt-8 p-4 rounded-lg text-center"
              style={{
                backgroundColor: sigmatiqTheme.colors.primary.teal + '10',
                border: `1px solid ${sigmatiqTheme.colors.primary.teal}30`
              }}
            >
              <p className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                💡 <span className="font-medium">Pro tip:</span> You can ask follow-up questions, request charts, or run custom screeners
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {assistantMutation.isPending && (
              <div 
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  backgroundColor: sigmatiqTheme.colors.background.secondary,
                  border: `1px solid ${sigmatiqTheme.colors.border.default}`
                }}
              >
                <div 
                  className="p-2 rounded-lg animate-pulse"
                  style={{
                    backgroundColor: sigmatiqTheme.colors.primary.teal + '20'
                  }}
                >
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: sigmatiqTheme.colors.primary.teal }} />
                </div>
                <span className="text-sm" style={{ color: sigmatiqTheme.colors.text.secondary }}>
                  SIGMATIQ is thinking...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div 
        className="fixed left-0 right-0 bottom-20 lg:bottom-0 lg:left-64 border-t p-4 z-10"
        style={{ 
          backgroundColor: sigmatiqTheme.colors.background.secondary,
          borderColor: sigmatiqTheme.colors.border.default,
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about trading..."
              className="flex-1 rounded-lg px-4 py-3 text-sm transition-all"
              style={{ 
                backgroundColor: sigmatiqTheme.colors.background.primary,
                color: sigmatiqTheme.colors.text.primary,
                border: `1px solid ${sigmatiqTheme.colors.border.default}`
              }}
              onFocus={(e) => {
                e.target.style.borderColor = sigmatiqTheme.colors.primary.teal;
                e.target.style.boxShadow = `0 0 0 3px ${sigmatiqTheme.colors.primary.teal}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = sigmatiqTheme.colors.border.default;
                e.target.style.boxShadow = 'none';
              }}
              disabled={assistantMutation.isPending}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || assistantMutation.isPending}
              className="rounded-lg px-4 py-3 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: sigmatiqTheme.colors.primary.teal,
                color: 'white'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.primary.tealDark;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.primary.teal;
              }}
            >
              {assistantMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Quick Actions - Only show when chat is active */}
          {!showWelcome && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <QuickAction text="What's moving today?" onClick={() => handleSend("What's moving today?")} />
              <QuickAction text="Market analysis" onClick={() => handleSend("Give me a market analysis")} />
              <QuickAction text="Find opportunities" onClick={() => handleSend("Find trading opportunities")} />
              <QuickAction text="Technical signals" onClick={() => handleSend("Show technical signals")} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
        style={{
          backgroundColor: isUser 
            ? sigmatiqTheme.colors.primary.teal 
            : sigmatiqTheme.colors.background.secondary,
          color: isUser 
            ? 'white' 
            : sigmatiqTheme.colors.text.primary,
          border: !isUser ? `1px solid ${sigmatiqTheme.colors.border.default}` : 'none'
        }}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p 
          className="text-xs mt-1"
          style={{ 
            color: isUser 
              ? 'rgba(255, 255, 255, 0.8)' 
              : sigmatiqTheme.colors.text.muted 
          }}
        >
          {message.timestamp.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
};

const QuickAction = ({ text, onClick }: { text: string; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="whitespace-nowrap text-xs rounded-full px-3 py-1.5 transition-all"
      style={{
        backgroundColor: sigmatiqTheme.colors.primary.teal + '20',
        color: sigmatiqTheme.colors.primary.teal,
        border: `1px solid ${sigmatiqTheme.colors.primary.teal}40`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.primary.teal + '30';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = sigmatiqTheme.colors.primary.teal + '20';
      }}
    >
      {text}
    </button>
  );
};

export default Chat;