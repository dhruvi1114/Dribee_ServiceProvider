import { Platform } from 'react-native';

import { logger } from '@/lib/logger';

import type { LocationCoords, LocationPermissionStatus } from '@/types/location';

interface GeolocationModule {
  getCurrentPosition: (
    onSuccess: (pos: { coords: { latitude: number; longitude: number } }) => void,
    onError: (err: { code?: number; message?: string }) => void,
    options?: { enableHighAccuracy?: boolean; timeout?: number; maximumAge?: number },
  ) => void;
}

interface PermissionsModule {
  request: (perm: string) => Promise<string>;
  check: (perm: string) => Promise<string>;
  PERMISSIONS: { IOS: Record<string, string>; ANDROID: Record<string, string> };
  RESULTS: {
    GRANTED: string;
    DENIED: string;
    BLOCKED: string;
    UNAVAILABLE: string;
    LIMITED: string;
  };
}

const loadGeolocation = (): GeolocationModule | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-community/geolocation') as { default: GeolocationModule };
    return mod.default;
  } catch {
    return null;
  }
};

const loadPermissions = (): PermissionsModule | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-permissions') as PermissionsModule;
  } catch {
    return null;
  }
};

export const requestLocationPermission = async (): Promise<LocationPermissionStatus> => {
  const mod = loadPermissions();
  if (!mod) {
    logger.warn('[Geo] react-native-permissions not installed; skipping.');
    return 'unknown';
  }

  const { request, check, PERMISSIONS, RESULTS } = mod;
  const perm =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

  try {
    const current = await check(perm);
    let result = current;
    if (current !== RESULTS.GRANTED && current !== RESULTS.BLOCKED) {
      result = await request(perm);
    }

    if (result === RESULTS.GRANTED) return 'granted';
    if (result === RESULTS.BLOCKED) return 'blocked';
    return 'denied';
  } catch (err) {
    logger.error('[Geo] Permission check failed', err);
    return 'unknown';
  }
};

export const getCurrentCoordinates = (): Promise<LocationCoords> =>
  new Promise((resolve, reject) => {
    const geo = loadGeolocation();
    if (!geo) {
      reject(new Error('Geolocation library not installed'));
      return;
    }
    geo.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message ?? 'Failed to get location')),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  });
