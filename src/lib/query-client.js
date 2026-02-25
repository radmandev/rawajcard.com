import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000,       // 30s — cached data reused for quick navigations
      gcTime: 5 * 60 * 1000,      // 5min — keep in memory after unmount
    },
  },
});