/**
 * React Query provider configuration for the Spotify Wrapped app
 */

'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Performance monitoring
const logQueryPerformance = (queryKey: string, duration: number) => {
  console.log(`🚀 Query Performance - ${queryKey}: ${duration.toFixed(2)}ms`);
};

// Create a client with optimized settings for the Spotify API
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global retry configuration
      retry: (failureCount, error: unknown) => {
        // Don't retry on client errors (4xx)
        const errorObj = error as { status?: number };
        if (errorObj?.status && errorObj.status >= 400 && errorObj.status < 500) {
          return false;
        }
        // Retry server errors and network errors up to 3 times
        return failureCount < 3;
      },

      // Global retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Cache configuration - optimized for performance
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,   // 30 minutes (formerly cacheTime)

      // Refetch configuration - minimize unnecessary requests
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false,      // Use cache if available on mount

      // Network mode - handle offline scenarios
      networkMode: 'online',

      // Performance optimizations
      notifyOnChangeProps: ['data', 'error', 'isLoading'], // Only re-render on specific prop changes

      // Structural sharing for better performance
      structuralSharing: true,
    },
    mutations: {
      // Global retry for mutations (if any)
      retry: 1,
      networkMode: 'online',
    },
  },
});

// Add global query performance monitoring
queryClient.getQueryCache().subscribe((event) => {
  if (event?.type === 'observerResultsUpdated' && event.query.state.dataUpdatedAt > 0) {
    const queryKey = event.query.queryKey.join('-');
    const duration = Date.now() - event.query.state.dataUpdatedAt;

    // Only log if duration is meaningful
    if (duration > 0 && duration < 60000) { // Less than 60 seconds
      logQueryPerformance(queryKey, duration);
    }
  }
});

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that provides React Query context to the entire app
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}

export { queryClient };
