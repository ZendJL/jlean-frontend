import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api/dashboard.api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'today'],
    queryFn:  dashboardApi.today,
    staleTime: 1000 * 60 * 2, // 2 min
  })
}
