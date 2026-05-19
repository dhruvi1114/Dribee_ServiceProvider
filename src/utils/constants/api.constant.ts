import { env } from '@/config/env';

export const API_BASE_URL = env.API_BASE_URL;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    OTP_SEND: '/auth/otp/send',
    OTP_VERIFY: '/auth/otp/verify',
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
  PRO: {
    REGISTER: '/service/pros/register',
    UPLOAD_ID_PROOF: '/service/pros/upload-id-proof',
    ME: '/service/pros/me',
    ME_AVAILABILITY: '/service/pros/me/availability',
    ME_LOCATION: '/service/pros/me/location',
    ME_FCM_TOKEN: '/service/pros/me/fcm-token',
    ME_ACTIVE_OFFER: '/service/pros/me/active-offer',
    ME_BANK_ACCOUNT: '/service/pros/me/bank-account',
    ME_SKILLS: '/service/pros/me/skills',
    ME_ZONES: '/service/pros/me/zones',
    PROFILE_COMPLETION: '/service/pros/me/profile-completion',
  },
  BOOKINGS: {
    LIST: '/service/bookings',
    DETAIL: (id: string) => `/service/bookings/${id}`,
    ACCEPT: (id: string) => `/service/bookings/${id}/accept`,
    REJECT: (id: string) => `/service/bookings/${id}/reject`,
    VERIFY_OTP: (id: string) => `/service/bookings/${id}/verify-otp`,
  },
  JOBS: {
    LIST: '/service/jobs',
    DETAIL: (id: string) => `/service/jobs/${id}`,
    ENROUTE: (id: string) => `/service/jobs/${id}/enroute`,
    START: (id: string) => `/service/jobs/${id}/start`,
    COMPLETE: (id: string) => `/service/jobs/${id}/complete`,
    DIAGNOSES: (id: string) => `/service/jobs/${id}/diagnoses`,
    PARTS: (id: string) => `/service/jobs/${id}/parts`,
    PARTS_SEND: (id: string) => `/service/jobs/${id}/parts/send`,
    PART_REMOVE: (id: string, partId: string) => `/service/jobs/${id}/parts/${partId}/remove`,
  },
  CATALOGUE: {
    LIST: '/service/catalogue',
  },
  MASTER: {
    ZONES: '/master/zones',
    SERVICE_TYPES: '/master/service-types',
    STATES: '/master/states',
    CITIES: '/master/cities',
    MACHINE_TYPES: '/master/machine-types',
    ISSUE_TAGS: '/master/issue-tags',
  },
  PAYMENTS: {
    CONFIRM_COD: (paymentId: string) => `/service/payments/${paymentId}/confirm-cod`,
  },
  STOREFRONT: {
    PRODUCTS: '/storefront/products',
    PRODUCT_DETAIL: (id: string | number) => `/storefront/products/${id}`,
  },
  EARNINGS: {
    LIST: '/service/earnings',
  },
} as const;
