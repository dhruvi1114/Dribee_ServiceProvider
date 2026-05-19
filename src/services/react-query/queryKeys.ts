/**
 * Hierarchical query key factory.
 * Usage: queryKeys.jobs.list(filters), queryKeys.jobs.detail(id)
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.bookings.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.bookings.all, 'detail', id] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.jobs.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.jobs.all, 'detail', id] as const,
  },
  catalogue: {
    all: ['catalogue'] as const,
    list: () => [...queryKeys.catalogue.all, 'list'] as const,
  },
  pro: {
    all: ['pro'] as const,
    me: () => [...queryKeys.pro.all, 'me'] as const,
    activeOffer: () => [...queryKeys.pro.all, 'active-offer'] as const,
  },
  master: {
    all: ['master'] as const,
    zones: () => [...queryKeys.master.all, 'zones'] as const,
    serviceTypes: () => [...queryKeys.master.all, 'service-types'] as const,
    states: () => [...queryKeys.master.all, 'states'] as const,
    cities: (state: string) => [...queryKeys.master.all, 'cities', state] as const,
    machineTypes: () => [...queryKeys.master.all, 'machine-types'] as const,
    issueTags: () => [...queryKeys.master.all, 'issue-tags'] as const,
  },
  earnings: {
    all: ['earnings'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.earnings.all, 'list', filters] as const,
  },
  storefront: {
    all: ['storefront'] as const,
    list: (geo: string, filters?: Record<string, unknown>) =>
      [...queryKeys.storefront.all, 'list', geo, filters] as const,
    detail: (geo: string, id: string | number) =>
      [...queryKeys.storefront.all, 'detail', geo, id] as const,
  },
};
