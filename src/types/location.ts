export type LocationPermissionStatus = 'granted' | 'denied' | 'blocked' | 'unknown';

export interface LocationCoords {
  lat: number;
  lng: number;
}

export interface LocationAddress {
  formatted: string;
  state: string | null;
  city: string | null;
  pincode: string | null;
}
