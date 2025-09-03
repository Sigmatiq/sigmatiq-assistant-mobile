import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MobileLayout from './components/layouts/MobileLayout';
import ErrorBoundary from './components/ErrorBoundary';
import useAppStore from './stores/useAppStore';

// Create a client with better error handling and caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  const { theme } = useAppStore();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className={theme === 'light' ? 'light' : ''}>
          <MobileLayout />
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;