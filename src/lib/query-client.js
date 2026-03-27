import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep tab content stable when the user switches away and comes back.
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
      staleTime: 30 * 1000,       // 30s — cached data reused for quick navigations
      gcTime: 5 * 60 * 1000,      // 5min — keep in memory after unmount
    },
  },
});
