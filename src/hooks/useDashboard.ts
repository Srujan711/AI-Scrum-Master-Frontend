import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/api';

export const useAIInsights = (teamId?: number) => {
  return useQuery({
    queryKey: ['insights', teamId],
    queryFn: () => dashboardApi.getAIInsights(teamId!),
    enabled: !!teamId,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useTeamMetrics = (teamId?: number) => {
  return useQuery({
    queryKey: ['metrics', teamId],
    queryFn: () => dashboardApi.getTeamMetrics(teamId!),
    enabled: !!teamId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};