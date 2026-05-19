import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { logger } from '@/lib/logger';
import {
  getFcmToken,
  onFcmTokenRefresh,
  requestPushPermission,
  subscribeToBookingOfferPushes,
} from '@/lib/pushNotifications';
import {
  useActiveOffer,
  useUpdateFcmToken,
} from '@/services/bookings/offers.query';
import { useAppSelector } from '@/store/hooks';

import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Lives at App level: registers FCM token after login, subscribes to
// booking_offer pushes, and recovers via GET /me/active-offer on app foreground
// or auth flip. When push delivery is unreliable (or mocked), the recovery
// query is what surfaces the offer.
export function useBookingOfferListener(): void {
  const navigation = useNavigation<Nav>();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const updateFcm = useUpdateFcmToken();
  // Only poll when authenticated; the query also auto-refetches on focus.
  const activeOffer = useActiveOffer(isAuthenticated);

  const lastRoutedOfferId = useRef<string | null>(null);
  const lastAppState = useRef<AppStateStatus>(AppState.currentState);

  // ── 1. FCM token registration ─────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    void (async () => {
      const granted = await requestPushPermission();
      if (cancelled) return;
      if (!granted) {
        logger.info('[Push] permission not granted');
        return;
      }
      const token = await getFcmToken();
      if (cancelled || !token) return;
      try {
        await updateFcm.mutateAsync(token);
      } catch (err) {
        logger.warn('[Push] failed to register fcm token', err);
      }
    })();

    const off = onFcmTokenRefresh((token) => {
      void updateFcm.mutateAsync(token).catch((err) => {
        logger.warn('[Push] token refresh sync failed', err);
      });
    });

    return () => {
      cancelled = true;
      off();
    };
    // updateFcm reference changes per render — depending on it would re-run
    // the effect every render. Auth flip is the only trigger we care about.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── 2. Push handler — when an offer push arrives, refetch and route ──────
  useEffect(() => {
    if (!isAuthenticated) return;
    const off = subscribeToBookingOfferPushes(() => {
      void activeOffer.refetch();
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── 3. AppState foreground → refetch active offer ────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    const sub = AppState.addEventListener('change', (next) => {
      const prev = lastAppState.current;
      lastAppState.current = next;
      if (next === 'active' && prev !== 'active') {
        void activeOffer.refetch();
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── 4. Navigate to the offer screen when one shows up ────────────────────
  useEffect(() => {
    const offer = activeOffer.data;
    if (!offer) {
      lastRoutedOfferId.current = null;
      return;
    }
    if (lastRoutedOfferId.current === offer.offer_id) return;
    lastRoutedOfferId.current = offer.offer_id;
    navigation.navigate('BookingOffer', {
      offerId: offer.offer_id,
      bookingId: offer.booking_id,
      expiresAt: offer.expires_at,
    });
  }, [activeOffer.data, navigation]);
}
