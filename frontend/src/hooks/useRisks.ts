import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { RiskAssessment } from '../types/api';

export function useRisks(companyId: number = 1, minScore?: number) {
  return useQuery<RiskAssessment[]>({
    queryKey: ['risks', companyId, minScore],
    queryFn: async () => {
      const response = await apiClient.get<RiskAssessment[]>('/risks', {
        params: { company_id: companyId, min_score: minScore },
      });
      return response.data;
    },
    refetchInterval: 5000,
  });
}
