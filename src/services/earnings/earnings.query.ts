import { useQuery } from '@tanstack/react-query';

import { apiService } from '@/services/api/apiService';
import { queryKeys } from '@/services/react-query/queryKeys';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';
import type { EarningApi, EarningListParams } from '@/types/service-api';

export function useEarnings(params?: EarningListParams) {
  return useQuery({
    queryKey: queryKeys.earnings.list(params as Record<string, unknown>),
    queryFn: () => apiService.get<EarningApi[]>(API_ENDPOINTS.EARNINGS.LIST, { params }),
  });
}
