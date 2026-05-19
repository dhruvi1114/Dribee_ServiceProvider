import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { apiService } from '@/services/api/apiService';
import { queryKeys } from '@/services/react-query/queryKeys';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';
import { getApiErrorMessage } from '@/utils/common-functions';
import type { RegisterProFormValues, CompleteProProfileFormValues } from '@/utils/validations';

export interface ProMeResponse {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  registration_type: string;
  status: string;
  is_available: boolean;
  commission_pct: number;
  max_jobs_per_day: number;
  bank_account: {
    accountHolder?: string;
    holderName?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
  } | null;
  state: string | null;
  city_id: string | null;
  zone_ids: string[];
  service_type_ids: string[];
  machine_types: string[];
  created_at: string;
  // Lifetime stats — populated by backend subqueries on /service/pros/me
  jobs_completed: number;
  in_progress_count: number;
  avg_rating: number;
  rating_count: number;
  lifetime_earnings: number;
  pending_payout: number;
}

export interface UpdateOwnProRequest {
  name?: string;
  phone?: string;
  email?: string;
}

export interface UpdateBankAccountRequest {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

export function useRegisterPro() {
  return useMutation({
    mutationFn: (values: RegisterProFormValues) =>
      apiService.post<{ id: string }>(API_ENDPOINTS.PRO.REGISTER, {
        fullName:          values.fullName,
        phone:             values.phone,
        email:             values.email || undefined,
        addressLine1:      values.addressLine1,
        addressLine2:      values.addressLine2 || undefined,
        pincode:           values.pincode,
        aadhaarLast4:      values.aadhaarLast4,
        panNumber:         values.panNumber,
        idProofUrl:        values.idProofUrl,
        bankAccountNumber: values.bankAccountNumber,
        ifscCode:          values.ifscCode,
      }),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Registration submitted',
        text2: 'Awaiting admin approval',
      });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Registration failed') });
    },
  });
}

export function useProMe() {
  return useQuery({
    queryKey: queryKeys.pro.me(),
    queryFn: () => apiService.get<ProMeResponse>(API_ENDPOINTS.PRO.ME),
  });
}

export function useUpdateOwnPro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOwnProRequest) =>
      apiService.put(API_ENDPOINTS.PRO.ME, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pro.me() });
      Toast.show({ type: 'success', text1: 'Profile updated' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to update profile') });
    },
  });
}

export function useSetOwnAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isAvailable: boolean) =>
      apiService.put(API_ENDPOINTS.PRO.ME_AVAILABILITY, { isAvailable }),
    onSuccess: (_, isAvailable) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pro.me() });
      Toast.show({
        type: 'success',
        text1: isAvailable ? "You're online" : "You're offline",
      });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to update availability') });
    },
  });
}

export function useUpdateOwnBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBankAccountRequest) =>
      apiService.put(API_ENDPOINTS.PRO.ME_BANK_ACCOUNT, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pro.me() });
      Toast.show({ type: 'success', text1: 'Bank details updated' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to update bank details') });
    },
  });
}

export function useUpdateOwnSkills() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceTypeIds: string[]) =>
      apiService.put(API_ENDPOINTS.PRO.ME_SKILLS, { serviceTypeIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pro.me() });
      Toast.show({ type: 'success', text1: 'Skills updated' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to update skills') });
    },
  });
}

export function useCompleteProProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CompleteProProfileFormValues) =>
      apiService.put(API_ENDPOINTS.PRO.PROFILE_COMPLETION, {
        state: data.state,
        cityId: Number(data.cityId),
        serviceTypeIds: data.serviceTypeIds,
        zoneIds: data.zoneIds,
        machineTypes: data.machineTypes,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pro.me() });
      Toast.show({ type: 'success', text1: 'Profile completed' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to save profile') });
    },
  });
}

export function useUpdateOwnZones() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (zoneIds: string[]) =>
      apiService.put(API_ENDPOINTS.PRO.ME_ZONES, { zoneIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pro.me() });
      Toast.show({ type: 'success', text1: 'Zones updated' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to update zones') });
    },
  });
}
