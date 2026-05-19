import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '@/store/slices/authSlice';
import jobsReducer from '@/store/slices/jobsSlice';
import locationReducer from '@/store/slices/locationSlice';
import proReducer from '@/store/slices/proSlice';
import themeReducer from '@/store/slices/themeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  pro: proReducer,
  jobs: jobsReducer,
  theme: themeReducer,
  location: locationReducer,
});

export default rootReducer;
