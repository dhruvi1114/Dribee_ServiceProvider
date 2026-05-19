import { baseService } from '@/services/api/baseService';

import type { AxiosRequestConfig } from 'axios';

/**
 * Wrapper around baseService that auto-unwraps response.data.data.
 * Use for standard JSON requests. Use baseService directly for FormData.
 */
export const apiService = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await baseService.get(url, config);
    return response.data?.data;
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await baseService.post(url, data, config);
    return response.data?.data;
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await baseService.put(url, data, config);
    return response.data?.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await baseService.delete(url, config);
    return response.data?.data;
  },
};
