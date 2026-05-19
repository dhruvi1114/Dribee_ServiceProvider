export const LightColors = {
  bgApp: '#F4F6F9',
  bgCard: '#FFFFFF',
  bgCard2: '#F8FAFC',
  bgInput: '#F0F2F5',
  bgSection: '#EEF2F7',
  bgHeader: '#FFFFFF',
  bgTabBar: '#FFFFFF',
  bgSheet: '#FFFFFF',
  bgOverlay: 'rgba(0,0,0,0.40)',

  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  brandNavy: '#1A3353',
  brandAmber: '#E8820C',
  brandBlue: '#2563EB',
  brandTeal: '#0D9488',

  statusNew: '#F59E0B',
  statusAccepted: '#2563EB',
  statusInProgress: '#7C3AED',
  statusReadyResume: '#EA580C',
  statusCompleted: '#16A34A',
  statusRejected: '#E11D48',

  statusAvailable: '#16A34A',
  statusOutOfStock: '#E11D48',
  statusLocked: '#6B7280',

  statusPending: '#F59E0B',
  statusApproved: '#2563EB',
  statusPaid: '#16A34A',
  statusFailed: '#E11D48',

  borderCard: '#E5E7EB',
  borderInput: '#D1D5DB',
  borderFocus: '#2563EB',
  borderDivider: '#F3F4F6',

  shimmerBase: '#E5E7EB',
  shimmerShine: '#F3F4F6',
} as const;

export const DarkColors: typeof LightColors = {
  bgApp: '#0D1117',
  bgCard: '#161B22',
  bgCard2: '#1C2431',
  bgInput: '#0D1117',
  bgSection: '#1C2431',
  bgHeader: '#161B22',
  bgTabBar: '#161B22',
  bgSheet: '#161B22',
  bgOverlay: 'rgba(0,0,0,0.70)',

  textPrimary: '#E6EDF3',
  textSecondary: '#8B949E',
  textTertiary: '#6E7681',
  textInverse: '#FFFFFF',

  brandNavy: '#60A5FA',
  brandAmber: '#E8820C',
  brandBlue: '#2563EB',
  brandTeal: '#0D9488',

  statusNew: '#F59E0B',
  statusAccepted: '#2563EB',
  statusInProgress: '#7C3AED',
  statusReadyResume: '#EA580C',
  statusCompleted: '#16A34A',
  statusRejected: '#E11D48',

  statusAvailable: '#16A34A',
  statusOutOfStock: '#E11D48',
  statusLocked: '#8B949E',

  statusPending: '#F59E0B',
  statusApproved: '#2563EB',
  statusPaid: '#16A34A',
  statusFailed: '#E11D48',

  borderCard: '#21262D',
  borderInput: '#30363D',
  borderFocus: '#2563EB',
  borderDivider: '#21262D',

  shimmerBase: '#21262D',
  shimmerShine: '#30363D',
};

export type DribeeColors = typeof LightColors;

export const Typography = {
  fontFamily: 'Inter',
  fsHero: 26,
  fsSection: 18,
  fsScreen: 16,
  fsProduct: 14,
  fsPrice: 20,
  fsPriceSm: 13,
  fsBody: 13,
  fsButton: 15,
  fsLabel: 11,
  fsTab: 10,
  fsCaption: 11,
  fsInput: 14,
} as const;

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const Radius = { sm: 6, md: 10, lg: 12, xl: 16, pill: 20, full: 999 } as const;
