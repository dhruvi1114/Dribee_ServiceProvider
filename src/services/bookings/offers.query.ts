import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { apiService } from '@/services/api/apiService';
import { queryKeys } from '@/services/react-query/queryKeys';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';
import { getApiErrorMessage } from '@/utils/common-functions';
import { logger } from '@/lib/logger';

export interface ActiveOffer {
  offer_id: string;
  booking_id: string;
  expires_at: string;
  distance_km: number | null;
  catalogue_id: string;
  service_type_id: string;
  service_type_name: string | null;
  priority: 'normal' | 'urgent' | null;
  customer_address: string | null;
  slot_date: string | null;
  slot_start_time: string | null;
  service_lat: number | null;
  service_lng: number | null;
}

export function useActiveOffer(enabled = true) {
  return useQuery({
    queryKey: queryKeys.pro.activeOffer(),
    queryFn: async () => {
      const data = await apiService.get<ActiveOffer | null>(API_ENDPOINTS.PRO.ME_ACTIVE_OFFER);
      logger.info('[ACTIVE_OFFER] response', JSON.stringify(data));
      return data;
    },
    enabled,
    refetchOnWindowFocus: true,
    staleTime: 0,
    // Safety net for when FCM push isn't delivered (dev / mocked).
    // 10s matches the cascade worker tick.
    refetchInterval: enabled ? 10_000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useAcceptBookingOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      logger.info('[ACCEPT] sending bookingId', bookingId);
      const data = await apiService.put(API_ENDPOINTS.BOOKINGS.ACCEPT(bookingId), {});
      logger.info('[ACCEPT] response', JSON.stringify(data));
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pro.activeOffer() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      Toast.show({ type: 'success', text1: 'Booking accepted' });
    },
    onError: (err) => {
      logger.error('[ACCEPT] failed', err);
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to accept booking') });
    },
  });
}

export function useRejectBookingOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      apiService.put(API_ENDPOINTS.BOOKINGS.REJECT(bookingId), {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pro.activeOffer() });
      Toast.show({ type: 'info', text1: 'Booking rejected' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to reject booking') });
    },
  });
}

export function useUpdateFcmToken() {
  return useMutation({
    mutationFn: (fcmToken: string) =>
      apiService.put(API_ENDPOINTS.PRO.ME_FCM_TOKEN, { fcmToken }),
  });
}
