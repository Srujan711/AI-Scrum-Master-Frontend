import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { standupApi } from '../services/api';
import { StandupSummary } from '../types';

export const useStandupSummary = (standupId?: number) => {
  return useQuery<StandupSummary>({
    queryKey: ['standup', standupId],
    queryFn: () => standupApi.getStandup(standupId!),
    enabled: !!standupId,
  });
};

export const useRecentStandups = (teamId?: number) => {
  return useQuery<StandupSummary[]>({
    queryKey: ['standups', 'recent', teamId],
    queryFn: () => standupApi.getRecentStandups(teamId!),
    enabled: !!teamId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useTeamStandups = (teamId?: number, limit = 10, offset = 0) => {
  return useQuery<StandupSummary[]>({
    queryKey: ['standups', 'team', teamId, limit, offset],
    queryFn: () => standupApi.getTeamStandups(teamId!, limit, offset),
    enabled: !!teamId,
  });
};

export const useGenerateStandup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: standupApi.generateSummary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standups'] });
    },
  });
};

export const useApproveStandup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: standupApi.approveStandup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['standups'] });
    },
  });
};

export const usePostToSlack = () => {
  return useMutation({
    mutationFn: standupApi.postToSlack,
  });
};