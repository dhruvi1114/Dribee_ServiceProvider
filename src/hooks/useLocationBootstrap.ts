import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { getCurrentCoordinates } from '@/lib/geolocation';
import { logger } from '@/lib/logger';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLocationThunk } from '@/store/slices/locationSlice';

import type { AppStateStatus } from 'react-native';

const FOREGROUND_RECHECK_MS = 15 * 60 * 1000;
const SIGNIFICANT_MOVE_KM = 5;

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export const useLocationBootstrap = (): { refresh: () => void } => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const status = useAppSelector((s) => s.location.status);
  const lastFetchedAt = useAppSelector((s) => s.location.lastFetchedAt);
  const lastCoords = useAppSelector((s) => s.location.coords);
  const lastAppState = useRef<AppStateStatus>(AppState.currentState);

  const refresh = useCallback(() => {
    void dispatch(fetchLocationThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (status === 'fetching' || status === 'ready') return;
    refresh();
  }, [isAuthenticated, status, refresh]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const subscription = AppState.addEventListener('change', (next) => {
      const prev = lastAppState.current;
      lastAppState.current = next;
      if (next !== 'active' || prev === 'active') return;
      if (lastFetchedAt === null) return;
      if (Date.now() - lastFetchedAt < FOREGROUND_RECHECK_MS) return;

      void (async () => {
        try {
          const coords = await getCurrentCoordinates();
          const moved =
            !lastCoords ||
            haversineKm(lastCoords.lat, lastCoords.lng, coords.lat, coords.lng) >=
              SIGNIFICANT_MOVE_KM;
          if (moved) refresh();
        } catch (err) {
          logger.warn('[LocationBootstrap] foreground recheck failed', err);
        }
      })();
    });
    return () => subscription.remove();
  }, [isAuthenticated, lastFetchedAt, lastCoords, refresh]);

  return { refresh };
};
