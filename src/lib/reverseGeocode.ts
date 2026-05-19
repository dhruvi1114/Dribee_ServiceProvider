import { logger } from '@/lib/logger';

import type { LocationAddress, LocationCoords } from '@/types/location';

interface NominatimResponse {
  display_name?: string;
  address?: {
    state?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    postcode?: string;
  };
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

export const reverseGeocode = async (coords: LocationCoords): Promise<LocationAddress | null> => {
  try {
    const url = `${NOMINATIM_URL}?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'DribeePro/1.0 (support@dribee.com)',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      logger.warn('[ReverseGeocode] non-OK response', { status: res.status });
      return null;
    }

    const data = (await res.json()) as NominatimResponse;
    const addr = data.address ?? {};
    const city = addr.city ?? addr.town ?? addr.village ?? addr.suburb ?? addr.county ?? null;

    return {
      formatted: data.display_name ?? '',
      state: addr.state ?? null,
      city,
      pincode: addr.postcode ?? null,
    };
  } catch (err) {
    logger.warn('[ReverseGeocode] failed', err);
    return null;
  }
};
