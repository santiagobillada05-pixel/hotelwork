import api from './client';

export const reportsApi = {
  getSummary: () => api.get('/reports/summary'),
  getRevenueReport: () => api.get('/reports/revenue'),
  getRecaudacion: (period) => api.get(`/reports/recaudacion?period=${period}`),
};
