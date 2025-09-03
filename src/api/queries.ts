import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import assistantApi from './client';
import type { AssistantResponse, ScreenerRequest, ScreenerResponse } from './types';

// Query keys
export const queryKeys = {
  assistant: (question: string) => ['assistant', question] as const,
  marketData: (symbols: string[]) => ['marketData', symbols] as const,
  indicators: ['indicators'] as const,
  presets: ['presets'] as const,
  watchlists: ['watchlists'] as const,
  screener: (request: ScreenerRequest) => ['screener', request] as const,
};

// Assistant Query
export const useAssistantQuery = (question: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.assistant(question),
    queryFn: () => assistantApi.ask(question),
    enabled: enabled && !!question,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Assistant Mutation (for chat)
export const useAssistantMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ question, mode }: { question: string; mode?: string }) => 
      assistantApi.ask(question, mode),
    onSuccess: (data, variables) => {
      // Cache the response
      queryClient.setQueryData(queryKeys.assistant(variables.question), data);
    },
  });
};

// Market Data Query (polls every 5 seconds when market is open)
export const useMarketDataQuery = (symbols: string[], marketIsOpen: boolean = false) => {
  return useQuery({
    queryKey: queryKeys.marketData(symbols),
    queryFn: () => assistantApi.getMarketData(symbols),
    refetchInterval: marketIsOpen ? 5000 : false,
    staleTime: marketIsOpen ? 4000 : 1000 * 60 * 5,
  });
};

// Indicators Query
export const useIndicatorsQuery = () => {
  return useQuery({
    queryKey: queryKeys.indicators,
    queryFn: assistantApi.getIndicators,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// Presets Query
export const usePresetsQuery = () => {
  return useQuery({
    queryKey: queryKeys.presets,
    queryFn: assistantApi.getPresets,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Watchlists Query
export const useWatchlistsQuery = () => {
  return useQuery({
    queryKey: queryKeys.watchlists,
    queryFn: assistantApi.getWatchlists,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Screener Mutation
export const useScreenerMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: ScreenerRequest) => assistantApi.runScreener(request),
    onSuccess: (data, variables) => {
      // Cache the screener results
      queryClient.setQueryData(queryKeys.screener(variables), data);
    },
  });
};

// Prefetch helpers
export const prefetchMarketData = async (queryClient: any, symbols: string[]) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.marketData(symbols),
    queryFn: () => assistantApi.getMarketData(symbols),
  });
};

export const prefetchIndicators = async (queryClient: any) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.indicators,
    queryFn: assistantApi.getIndicators,
  });
};