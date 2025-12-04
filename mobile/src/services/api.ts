import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use your computer's IP address when testing on physical device
// For emulator, use 10.0.2.2 (Android) or localhost (iOS)
const API_URL = 'http://192.168.1.44:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { token } = response.data;
        await SecureStore.setItemAsync('token', token);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refreshToken');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials).then((res) => res.data),
  register: (data: any) => api.post('/auth/register', data).then((res) => res.data),
  logout: () => api.post('/auth/logout').then((res) => res.data),
};

export const financialAPI = {
  getDashboard: () => api.get('/financial/dashboard').then((res) => res.data),
  getTransactions: (params?: any) => api.get('/financial/transactions', { params }).then((res) => res.data),
  getAnalytics: () => api.get('/financial/analytics').then((res) => res.data),
};

export const hrAPI = {
  getEmployees: () => api.get('/hr/employees').then((res) => res.data),
  getAttendance: () => api.get('/hr/attendance').then((res) => res.data),
  getPayroll: () => api.get('/hr/payroll').then((res) => res.data),
};

export const salesAPI = {
  getPipeline: () => api.get('/sales/pipeline').then((res) => res.data),
  getLeads: () => api.get('/sales/leads').then((res) => res.data),
  getAnalytics: () => api.get('/sales/analytics').then((res) => res.data),
};

export const marketingAPI = {
  getCampaigns: () => api.get('/marketing/campaigns').then((res) => res.data),
  getAnalytics: () => api.get('/marketing/analytics').then((res) => res.data),
};

export const projectAPI = {
  getProjects: () => api.get('/projects').then((res) => res.data),
  getTasks: () => api.get('/projects/tasks').then((res) => res.data),
  getTimeline: () => api.get('/projects/timeline').then((res) => res.data),
};

export const aiAPI = {
  chat: (message: string) => api.post('/ai/chat', { message }).then((res) => res.data),
  analyze: (data: any) => api.post('/ai/analyze', data).then((res) => res.data),
  getInsights: () => api.get('/ai/insights').then((res) => res.data),
};

export default api;
