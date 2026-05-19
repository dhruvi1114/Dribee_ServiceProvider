import { PermissionsAndroid, Platform } from 'react-native';

import { logger } from '@/lib/logger';

interface MessagingModule {
  default: () => MessagingInstance;
  AuthorizationStatus: {
    AUTHORIZED: number;
    PROVISIONAL: number;
  };
}

interface RemoteMessage {
  data?: Record<string, string | object>;
  notification?: { title?: string; body?: string };
  messageId?: string;
}

interface MessagingInstance {
  requestPermission: () => Promise<number>;
  getToken: () => Promise<string>;
  onTokenRefresh: (cb: (token: string) => void) => () => void;
  onMessage: (cb: (msg: RemoteMessage) => void) => () => void;
  onNotificationOpenedApp: (cb: (msg: RemoteMessage) => void) => () => void;
  getInitialNotification: () => Promise<RemoteMessage | null>;
}

const loadMessaging = (): MessagingModule | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-firebase/messaging') as MessagingModule;
  } catch {
    return null;
  }
};

export const requestPushPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const perms = PermissionsAndroid.PERMISSIONS as unknown as Record<string, string>;
      const perm = perms.POST_NOTIFICATIONS;
      if (perm) {
        const granted = await PermissionsAndroid.request(
          perm as Parameters<typeof PermissionsAndroid.request>[0],
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
      }
    } catch (err) {
      logger.warn('[Push] android permission request failed', err);
      return false;
    }
  }

  const mod = loadMessaging();
  if (!mod) {
    logger.warn('[Push] @react-native-firebase/messaging not loadable');
    return false;
  }

  try {
    const messaging = mod.default();
    const status = await messaging.requestPermission();
    return (
      status === mod.AuthorizationStatus.AUTHORIZED ||
      status === mod.AuthorizationStatus.PROVISIONAL
    );
  } catch (err) {
    logger.warn('[Push] iOS permission request failed', err);
    return false;
  }
};

export const getFcmToken = async (): Promise<string | null> => {
  const mod = loadMessaging();
  if (!mod) return null;
  try {
    const token = await mod.default().getToken();
    return token || null;
  } catch (err) {
    logger.warn('[Push] getToken failed', err);
    return null;
  }
};

export const onFcmTokenRefresh = (cb: (token: string) => void): (() => void) => {
  const mod = loadMessaging();
  if (!mod) return () => undefined;
  return mod.default().onTokenRefresh(cb);
};

export interface BookingOfferPushPayload {
  type: 'booking_offer';
  bookingId: string;
  offerId: string;
}

const isBookingOffer = (data: Record<string, unknown> | undefined): boolean =>
  !!data &&
  data.type === 'booking_offer' &&
  typeof data.bookingId === 'string' &&
  typeof data.offerId === 'string';

// Forward all booking_offer pushes to a single handler. Returns a cleanup
// function that detaches every listener.
export const subscribeToBookingOfferPushes = (
  onOffer: (payload: BookingOfferPushPayload) => void,
): (() => void) => {
  const mod = loadMessaging();
  if (!mod) return () => undefined;
  const messaging = mod.default();

  const offForeground = messaging.onMessage((msg) => {
    if (isBookingOffer(msg.data as Record<string, unknown> | undefined)) {
      onOffer(msg.data as unknown as BookingOfferPushPayload);
    }
  });

  const offOpened = messaging.onNotificationOpenedApp((msg) => {
    if (isBookingOffer(msg.data as Record<string, unknown> | undefined)) {
      onOffer(msg.data as unknown as BookingOfferPushPayload);
    }
  });

  // Quit-state: app cold-started by tapping a notification.
  void messaging.getInitialNotification().then((msg) => {
    if (msg && isBookingOffer(msg.data as Record<string, unknown> | undefined)) {
      onOffer(msg.data as unknown as BookingOfferPushPayload);
    }
  });

  return () => {
    offForeground();
    offOpened();
  };
};
