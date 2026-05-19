import { useQuery } from '@tanstack/react-query';

import { apiService } from '@/services/api/apiService';
import { queryKeys } from '@/services/react-query/queryKeys';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';

export interface ZoneApi {
  id: string;
  city_id: string;
  name: string;
  is_active: boolean;
  city_name: string;
}

export interface ServiceTypeApi {
  id: string;
  name: string;
  is_active: boolean;
}

export function useZones() {
  return useQuery({
    queryKey: queryKeys.master.zones(),
    queryFn: () =>
      apiService.get<ZoneApi[]>(API_ENDPOINTS.MASTER.ZONES, { params: { is_active: true } }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useServiceTypes() {
  return useQuery({
    queryKey: queryKeys.master.serviceTypes(),
    queryFn: () => apiService.get<ServiceTypeApi[]>(API_ENDPOINTS.MASTER.SERVICE_TYPES),
    staleTime: 5 * 60 * 1000,
  });
}

export interface StateApi {
  name: string;
}

export interface CityApi {
  id: string;
  name: string;
  state: string;
}

export interface MachineTypeApi {
  id: number;
  name: string;
  is_active: boolean;
}

export function useStates() {
  return useQuery({
    queryKey: queryKeys.master.states(),
    queryFn: () => apiService.get<StateApi[]>(API_ENDPOINTS.MASTER.STATES),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCities(state: string | undefined) {
  return useQuery({
    queryKey: queryKeys.master.cities(state ?? ''),
    queryFn: () =>
      apiService.get<CityApi[]>(
        `${API_ENDPOINTS.MASTER.CITIES}?state=${encodeURIComponent(state!)}`,
      ),
    enabled: !!state,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMachineTypes() {
  return useQuery({
    queryKey: queryKeys.master.machineTypes(),
    queryFn: () => apiService.get<MachineTypeApi[]>(API_ENDPOINTS.MASTER.MACHINE_TYPES),
    staleTime: 5 * 60 * 1000,
  });
}

export interface IssueTagApi {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
}

export function useIssueTags() {
  return useQuery({
    queryKey: queryKeys.master.issueTags(),
    queryFn: () => apiService.get<IssueTagApi[]>(API_ENDPOINTS.MASTER.ISSUE_TAGS),
    staleTime: 5 * 60 * 1000,
  });
}
