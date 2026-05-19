import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { apiService } from '@/services/api/apiService';
import { queryKeys } from '@/services/react-query/queryKeys';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';
import { getApiErrorMessage } from '@/utils/common-functions';
import type {
  BookingApi,
  BookingListParams,
  JobApi,
  JobListParams,
  RejectBookingRequest,
  VerifyOtpRequest,
  AddDiagnosisRequest,
  AddJobPartRequest,
  CompleteJobRequest,
  ServiceCatalogueItemApi,
} from '@/types/service-api';

// ─── Bookings ────────────────────────────────────────────────────────────────

export function useBookings(params?: BookingListParams) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params as Record<string, unknown>),
    queryFn: () => apiService.get<BookingApi[]>(API_ENDPOINTS.BOOKINGS.LIST, { params }),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => apiService.get<BookingApi>(API_ENDPOINTS.BOOKINGS.DETAIL(id)),
    enabled: !!id,
  });
}

export function useAcceptBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      apiService.put<BookingApi>(API_ENDPOINTS.BOOKINGS.ACCEPT(bookingId)),
    onSuccess: (_, bookingId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      Toast.show({ type: 'success', text1: 'Job accepted' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to accept job') });
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: RejectBookingRequest }) =>
      apiService.put<BookingApi>(API_ENDPOINTS.BOOKINGS.REJECT(bookingId), data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      Toast.show({ type: 'success', text1: 'Job declined' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to decline job') });
    },
  });
}

export function useVerifyBookingOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: VerifyOtpRequest }) =>
      apiService.post<JobApi>(API_ENDPOINTS.BOOKINGS.VERIFY_OTP(bookingId), data),
    onSuccess: (_, { bookingId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(bookingId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'OTP verification failed') });
    },
  });
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export function useJobs(params?: JobListParams) {
  return useQuery({
    queryKey: queryKeys.jobs.list(params as Record<string, unknown>),
    queryFn: () => apiService.get<JobApi[]>(API_ENDPOINTS.JOBS.LIST, { params }),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => apiService.get<JobApi>(API_ENDPOINTS.JOBS.DETAIL(id)),
    enabled: !!id,
  });
}

export function useMarkJobEnroute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) =>
      apiService.put<JobApi>(API_ENDPOINTS.JOBS.ENROUTE(jobId)),
    onSuccess: (_, jobId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      Toast.show({ type: 'success', text1: 'Marked en-route' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to mark en-route') });
    },
  });
}

export function useStartJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) =>
      apiService.put<JobApi>(API_ENDPOINTS.JOBS.START(jobId)),
    onSuccess: (_, jobId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to start job') });
    },
  });
}

// Pro confirms cash received from a COD booking final-bill payment.
// Flips payments.status pending → confirmed and cascades to the parts order.
export function useConfirmCodPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) =>
      apiService.put(API_ENDPOINTS.PAYMENTS.CONFIRM_COD(paymentId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      Toast.show({ type: 'success', text1: 'Cash receipt confirmed' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to confirm cash') });
    },
  });
}

export function useCompleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data?: CompleteJobRequest }) =>
      apiService.put<JobApi>(API_ENDPOINTS.JOBS.COMPLETE(jobId), data),
    onSuccess: (_, { jobId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      Toast.show({ type: 'success', text1: 'Job marked complete' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to complete job') });
    },
  });
}

export function useAddDiagnosis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: AddDiagnosisRequest }) =>
      apiService.post(API_ENDPOINTS.JOBS.DIAGNOSES(jobId), data),
    onSuccess: (_, { jobId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
      Toast.show({ type: 'success', text1: 'Diagnosis saved' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to save diagnosis') });
    },
  });
}

export function useAddJobPart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, data }: { jobId: string; data: AddJobPartRequest }) =>
      apiService.post(API_ENDPOINTS.JOBS.PARTS(jobId), data),
    onSuccess: (_, { jobId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
      Toast.show({ type: 'success', text1: 'Part added' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to add part') });
    },
  });
}

export function useSendPartsList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) =>
      apiService.put(API_ENDPOINTS.JOBS.PARTS_SEND(jobId)),
    onSuccess: (_, jobId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
      Toast.show({ type: 'success', text1: 'Parts list sent to customer' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to send parts list') });
    },
  });
}

export function useRemoveJobPart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, partId }: { jobId: string; partId: string }) =>
      apiService.put(API_ENDPOINTS.JOBS.PART_REMOVE(jobId, partId)),
    onSuccess: (_, { jobId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId) });
      Toast.show({ type: 'success', text1: 'Part removed' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to remove part') });
    },
  });
}

// ─── Catalogue (read-only, used by parts builder) ────────────────────────────

export function useServiceCatalogue() {
  return useQuery({
    queryKey: queryKeys.catalogue.list(),
    queryFn: () => apiService.get<ServiceCatalogueItemApi[]>(API_ENDPOINTS.CATALOGUE.LIST),
  });
}
