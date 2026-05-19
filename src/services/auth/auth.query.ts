import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import { apiService } from '@/services/api/apiService';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';
import { getApiErrorMessage } from '@/utils/common-functions';

export interface SendOtpRequest {
  phone?: string;
  email?: string;
}

export interface VerifyOtpRequest {
  phone?: string;
  email?: string;
  otp: string;
}

export interface VerifyOtpResponse {
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string;
  };
  token: string;
  refreshToken?: string;
}

export function useSendAuthOtp() {
  return useMutation({
    mutationFn: (data: SendOtpRequest) =>
      apiService.post<{ sent: boolean }>(API_ENDPOINTS.AUTH.OTP_SEND, data),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'OTP sent' });
    },
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'Failed to send OTP') });
    },
  });
}

export function useVerifyAuthOtp() {
  return useMutation({
    mutationFn: (data: VerifyOtpRequest) =>
      apiService.post<VerifyOtpResponse>(API_ENDPOINTS.AUTH.OTP_VERIFY, data),
    onError: (err) => {
      Toast.show({ type: 'error', text1: getApiErrorMessage(err, 'OTP verification failed') });
    },
  });
}
