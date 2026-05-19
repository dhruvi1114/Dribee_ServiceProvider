import axios from 'axios';

import { env } from '@/config/env';
import { getToken, removeToken } from '@/lib/keychain';
import { logger } from '@/lib/logger';
import { API_BASE_URL } from '@/utils/constants/api.constant';

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-host': `${env.ORG_SLUG}.dribee.com`,
  },
});

// Request interceptor — attach auth token
baseService.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logger.info(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor — handle 401
baseService.interceptors.response.use(
  (response) => {
    logger.info(`[API] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    logger.error(`[API] ${status ?? 'Network'} on ${url}`, error.response?.data ?? error.message);
    if (status === 401) {
      logger.warn('Unauthorized — clearing token');
      await removeToken();
    }
    return Promise.reject(error);
  },
);

export { baseService };
