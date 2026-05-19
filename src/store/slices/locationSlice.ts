import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getCurrentCoordinates, requestLocationPermission } from '@/lib/geolocation';
import { logger } from '@/lib/logger';
import { reverseGeocode } from '@/lib/reverseGeocode';
import { apiService } from '@/services/api/apiService';
import { API_ENDPOINTS } from '@/utils/constants/api.constant';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { LocationAddress, LocationCoords, LocationPermissionStatus } from '@/types/location';

type FetchStatus = 'idle' | 'fetching' | 'ready' | 'error';

interface LocationState {
  permission: LocationPermissionStatus;
  coords: LocationCoords | null;
  address: LocationAddress | null;
  status: FetchStatus;
  lastFetchedAt: number | null;
  error: string | null;
}

const initialState: LocationState = {
  permission: 'unknown',
  coords: null,
  address: null,
  status: 'idle',
  lastFetchedAt: null,
  error: null,
};

export const fetchLocationThunk = createAsyncThunk<
  { coords: LocationCoords; address: LocationAddress | null; permission: LocationPermissionStatus },
  void,
  { rejectValue: { message: string; permission: LocationPermissionStatus } }
>('location/fetch', async (_, { rejectWithValue }) => {
  const permission = await requestLocationPermission();
  if (permission !== 'granted') {
    return rejectWithValue({ message: `Permission ${permission}`, permission });
  }

  const coords = await getCurrentCoordinates();
  const address = await reverseGeocode(coords);

  try {
    await apiService.put(API_ENDPOINTS.PRO.ME_LOCATION, {
      lat: coords.lat,
      lng: coords.lng,
    });
  } catch (err) {
    logger.warn('[Location] failed to sync location to server', err);
  }

  return { coords, address, permission };
});

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setPermission(state, action: PayloadAction<LocationPermissionStatus>) {
      state.permission = action.payload;
    },
    resetLocation() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocationThunk.pending, (state) => {
        state.status = 'fetching';
        state.error = null;
      })
      .addCase(fetchLocationThunk.fulfilled, (state, action) => {
        state.status = 'ready';
        state.coords = action.payload.coords;
        state.address = action.payload.address;
        state.permission = action.payload.permission;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchLocationThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload?.message ?? action.error.message ?? 'Unknown error';
        if (action.payload?.permission) {
          state.permission = action.payload.permission;
        }
      });
  },
});

export const { setPermission, resetLocation } = locationSlice.actions;
export default locationSlice.reducer;
