import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backlogApi } from '../services/api';
import { BacklogItem } from '../types';

export const useBacklogItems = (teamId?: number) => {
  return useQuery<BacklogItem[]>({
    queryKey: ['backlog', teamId],
    queryFn: () => backlogApi.getBacklogItems(teamId!),
    enabled: !!teamId,
  });
};

export const useUnassignedItems = (teamId?: number) => {
  return useQuery<BacklogItem[]>({
    queryKey: ['backlog', 'unassigned', teamId],
    queryFn: () => backlogApi.getUnassignedItems(teamId!),
    enabled: !!teamId,
  });
};

export const useBacklogAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: backlogApi.analyzeItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
    },
  });
};

export const useCreateBacklogItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: backlogApi.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
    },
  });
};

export const useUpdateBacklogItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<BacklogItem> }) =>
      backlogApi.updateItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
    },
  });
};