import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import { removeToken } from '@/lib/keychain';
import { logger } from '@/lib/logger';
import { apiService } from '@/services/api/apiService';
import { useAppDispatch } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';

export function useLogout(): () => Promise<void> {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  return async () => {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch (err) {
      logger.warn('Logout API failed, continuing local logout', err);
    }

    await removeToken();
    queryClient.clear();
    dispatch(logoutAction());

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth', params: { screen: 'Login' } }],
      }),
    );
  };
}
