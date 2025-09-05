import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  experience: 'novice' | 'intermediate' | 'power';
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  experience?: 'novice' | 'intermediate' | 'power';
  setExperience: (experience: 'novice' | 'intermediate' | 'power') => void;
  
  // Navigation
  activeView: 'dashboard' | 'chat' | 'screener' | 'charts' | 'settings';
  setActiveView: (view: AppState['activeView']) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  
  // Helper State
  activeHelper: 'charting' | 'action' | 'learning' | 'stockInfo' | null;
  setActiveHelper: (helper: AppState['activeHelper']) => void;
  helperContext: {
    symbol?: string;
    source?: 'panel' | 'chat' | 'search';
    trigger?: string;
    topic?: string;
  };
  setHelperContext: (context: AppState['helperContext']) => void;
  clearHelper: () => void;
  
  // Market Data
  watchlist: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours';
  setMarketStatus: (status: AppState['marketStatus']) => void;
  
  // UI State
  theme: 'dark' | 'light' | 'auto';
  setTheme: (theme: AppState['theme']) => void;
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;
  
  // Chat Context
  chatContext: {
    symbol?: string;
    screenerResults?: string[];
    chartType?: string;
  };
  setChatContext: (context: AppState['chatContext']) => void;
  clearChatContext: () => void;
}

const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // User
        user: null,
        setUser: (user) => set({ user }),
        experience: 'novice',
        setExperience: (experience) => set({ experience }),
        
        // Navigation
        activeView: 'dashboard',
        setActiveView: (view) => set({ activeView: view }),
        isMobileMenuOpen: false,
        toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
        
        // Helper State
        activeHelper: null,
        setActiveHelper: (helper) => set({ activeHelper: helper }),
        helperContext: {},
        setHelperContext: (context) => set({ helperContext: context }),
        clearHelper: () => set({ activeHelper: null, helperContext: {} }),
        
        // Market Data
        watchlist: ['AAPL', 'MSFT', 'SPY', 'QQQ'],
        addToWatchlist: (symbol) => set((state) => ({
          watchlist: [...new Set([...state.watchlist, symbol])]
        })),
        removeFromWatchlist: (symbol) => set((state) => ({
          watchlist: state.watchlist.filter(s => s !== symbol)
        })),
        marketStatus: 'closed',
        setMarketStatus: (status) => set({ marketStatus: status }),
        
        // UI State
        theme: 'dark',
        setTheme: (theme) => set({ theme }),
        selectedSymbol: null,
        setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
        
        // Chat Context
        chatContext: {},
        setChatContext: (context) => set({ chatContext: context }),
        clearChatContext: () => set({ chatContext: {} }),
      }),
      {
        name: 'sigma-assistant-storage',
        partialize: (state) => ({
          user: state.user,
          experience: state.experience,
          watchlist: state.watchlist,
          theme: state.theme,
        }),
      }
    )
  )
);

export default useAppStore;