import { useColorScheme } from 'react-native';

import { DarkColors, LightColors } from '@/constants/dribee';
import { useAppSelector } from '@/store/hooks';
import type { DribeeColors } from '@/constants/dribee';
import type { EarningStatus, JobStatus, PartAvailability } from '@/types/dribee';

export function useDribeeTheme(): {
  colors: DribeeColors;
  isDark: boolean;
} {
  const scheme = useColorScheme();
  const mode = useAppSelector((s) => s.theme.mode);
  const isDark = mode === 'system' ? scheme === 'dark' : mode === 'dark';
  return { colors: isDark ? DarkColors : LightColors, isDark };
}

export function jobStatusColor(status: JobStatus, c: DribeeColors): string {
  switch (status) {
    case 'new':
      return c.statusNew;
    case 'accepted':
      return c.statusAccepted;
    case 'inProgress':
      return c.statusInProgress;
    case 'partsPending':
      // Reuse existing readyResume token — no new color in the palette so the
      // chip still renders cleanly without UI changes.
      return c.statusReadyResume;
    case 'readyResume':
      return c.statusReadyResume;
    case 'completed':
      return c.statusCompleted;
    case 'rejected':
      return c.statusRejected;
  }
}

export function jobStatusLabel(status: JobStatus): string {
  switch (status) {
    case 'new':
      return 'New';
    case 'accepted':
      return 'Accepted';
    case 'inProgress':
      return 'In Progress';
    case 'partsPending':
      return 'Awaiting Parts';
    case 'readyResume':
      return 'Ready to Resume';
    case 'completed':
      return 'Completed';
    case 'rejected':
      return 'Rejected';
  }
}

export function earningStatusColor(status: EarningStatus, c: DribeeColors): string {
  switch (status) {
    case 'pending':
      return c.statusPending;
    case 'approved':
      return c.statusApproved;
    case 'paid':
      return c.statusPaid;
    case 'failed':
      return c.statusFailed;
  }
}

export function earningStatusLabel(status: EarningStatus): string {
  return status[0].toUpperCase() + status.slice(1);
}

export function partAvailabilityColor(status: PartAvailability, c: DribeeColors): string {
  switch (status) {
    case 'available':
      return c.statusAvailable;
    case 'outOfStock':
      return c.statusOutOfStock;
    case 'locked':
      return c.statusLocked;
  }
}

export function partAvailabilityLabel(status: PartAvailability): string {
  switch (status) {
    case 'available':
      return 'Available';
    case 'outOfStock':
      return 'Out of Stock';
    case 'locked':
      return 'Locked';
  }
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
