import api from './client';

export const notificationsApi = {
  getMyNotifications: () => api.get('/notifications/'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};
