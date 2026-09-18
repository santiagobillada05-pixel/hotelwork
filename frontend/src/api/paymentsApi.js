import api from './client';

export const paymentsApi = {
  confirmPayment: (paymentId, data) => api.patch(`/payments/${paymentId}/confirm`, data),
  getPaymentsForReservation: (reservationId) => api.get(`/payments/reservation/${reservationId}`),
};
