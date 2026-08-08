import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { Shipment } from '../types/api';

export function useShipments(companyId: number = 1, status?: string) {
  return useQuery<Shipment[]>({
    queryKey: ['shipments', companyId, status],
    queryFn: async () => {
      const response = await apiClient.get<Shipment[]>('/shipments', {
        params: { company_id: companyId, status },
      });
      return response.data;
    },
    refetchInterval: 5000, // Real-time telemetry polling every 5s
  });
}

export function useShipment(id?: number) {
  return useQuery<Shipment>({
    queryKey: ['shipment', id],
    queryFn: async () => {
      const response = await apiClient.get<Shipment>(`/shipments/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newShipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await apiClient.post<Shipment>('/shipments', newShipment);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}
