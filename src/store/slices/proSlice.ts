import { createSlice } from '@reduxjs/toolkit';

import { mockPro } from '@/constants/mockData';

import type { ProUser } from '@/types/dribee';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ProState {
  pro: ProUser;
  unavailabilityReason: string | null;
}

const initialState: ProState = {
  pro: mockPro,
  unavailabilityReason: null,
};

const proSlice = createSlice({
  name: 'pro',
  initialState,
  reducers: {
    setAvailable(state, action: PayloadAction<boolean>) {
      state.pro.isAvailable = action.payload;
      if (action.payload) {
        state.unavailabilityReason = null;
      }
    },
    setUnavailabilityReason(state, action: PayloadAction<string | null>) {
      state.unavailabilityReason = action.payload;
    },
    updatePro(state, action: PayloadAction<Partial<ProUser>>) {
      state.pro = { ...state.pro, ...action.payload };
    },
    updateBankDetails(state, action: PayloadAction<ProUser['bankDetails']>) {
      state.pro.bankDetails = action.payload;
    },
    setApprovalStatus(state, action: PayloadAction<ProUser['status']>) {
      state.pro.status = action.payload;
    },
  },
});

export const {
  setAvailable,
  setUnavailabilityReason,
  updatePro,
  updateBankDetails,
  setApprovalStatus,
} = proSlice.actions;
export default proSlice.reducer;
