import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sprintApi } from '../services/api';
import { Sprint } from '../types';

export const useSprint = (sprintId?: number) => {
  return useQuery<Sprint>({
    queryKey: ['sprint', sprintId],
    queryFn: () => sprintApi.getSprint(sprintId!),
    enabled: !!sprintId,
  });
};

export const useTeamSprints = (
  teamId?: number,
  params?: { status?: string; limit?: number; offset?: number }
) => {
  return useQuery<Sprint[]>({
    queryKey: ['sprints', 'team', teamId, params],
    queryFn: () => sprintApi.getTeamSprints(teamId!, params),
    enabled: !!teamId,
  });
};

export const useBurndownData = (sprintId?: number) => {
  return useQuery({
    queryKey: ['burndown', sprintId],
    queryFn: () => sprintApi.getBurndownData(sprintId!),
    enabled: !!sprintId,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useSprintPlanning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sprintApi.planSprint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
  });
};

export const useCreateSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sprintApi.createSprint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
  });
};

export const useStartSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sprintApi.startSprint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
  });
};

export const useAddItemsToSprint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sprintId, itemIds }: { sprintId: number; itemIds: number[] }) =>
      sprintApi.addItemsToSprint(sprintId, itemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
    },
  });
};