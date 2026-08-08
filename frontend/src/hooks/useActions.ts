import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { AgentAction } from '../types/api';

export function usePendingActions() {
  return useQuery<AgentAction[]>({
    queryKey: ['pending-actions'],
    queryFn: async () => {
      const response = await apiClient.get<AgentAction[]>('/actions/pending');
      return response.data;
    },
    refetchInterval: 5000,
  });
}

export function useActionHistory() {
  return useQuery<AgentAction[]>({
    queryKey: ['action-history'],
    queryFn: async () => {
      const response = await apiClient.get<AgentAction[]>('/actions/history');
      return response.data;
    },
    refetchInterval: 5000,
  });
}

export function useApproveAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ actionId, notes }: { actionId: number; notes?: string }) => {
      const response = await apiClient.post<AgentAction>(`/actions/${actionId}/approve`, { notes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-actions'] });
      queryClient.invalidateQueries({ queryKey: ['action-history'] });
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

export function useRejectAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (actionId: number) => {
      const response = await apiClient.post<AgentAction>(`/actions/${actionId}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-actions'] });
      queryClient.invalidateQueries({ queryKey: ['action-history'] });
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}
