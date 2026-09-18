import api from './client';

export const usersApi = {
  getUsers: (params) => api.get('/users/', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  createStaff: (data) => api.post('/users/staff', data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};
