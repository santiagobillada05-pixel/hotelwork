import api from './client';

export const checkoutsApi = {
  getCheckouts: (params) => api.get('/checkouts/', { params }),
  updateStatus: (id, status) => api.patch(`/checkouts/${id}/status`, { status }),
  deleteCheckout: (id) => api.delete(`/checkouts/${id}`),
};
