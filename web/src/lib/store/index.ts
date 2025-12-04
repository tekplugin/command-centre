import { configureStore, createSlice } from '@reduxjs/toolkit';

// Dummy slice to prevent Redux error
const appSlice = createSlice({
  name: 'app',
  initialState: { initialized: true },
  reducers: {},
});

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
