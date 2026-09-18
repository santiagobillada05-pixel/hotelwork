import api from './client';

export const roomsApi = {
  getAvailableRooms: (params) => api.get('/rooms/available', { params }),
  getAllRooms: (params) => api.get('/rooms/', { params }),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  createRoom: (roomData) => api.post('/rooms/', roomData),
  updateRoom: (id, roomData) => api.put(`/rooms/${id}`, roomData),
  updateRoomStatus: (id, status) => api.patch(`/rooms/${id}/status`, { status }),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};
