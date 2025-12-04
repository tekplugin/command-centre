import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
  financialData: any;
  notifications: any[];
  insights: any[];
  isLoading: boolean;
}

const initialState: DashboardState = {
  financialData: null,
  notifications: [],
  insights: [],
  isLoading: false,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setFinancialData: (state, action: PayloadAction<any>) => {
      state.financialData = action.payload;
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.unshift(action.payload);
    },
    setInsights: (state, action: PayloadAction<any[]>) => {
      state.insights = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setFinancialData, addNotification, setInsights, setLoading } = dashboardSlice.actions;
export default dashboardSlice.reducer;
