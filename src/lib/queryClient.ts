import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const qk = {
  athletes: ['athletes'] as const,
  activities: ['activities'] as const,
  needs: ['needs'] as const,
  assignments: ['assignments'] as const,
  guides: ['guides'] as const,
  settings: ['settings'] as const,
  tc: (userId: string) => ['tc', userId] as const,
}
