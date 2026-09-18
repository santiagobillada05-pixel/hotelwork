import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract response data or format errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || 'Error de conexión con el servidor',
      detail: error.response?.data?.detail || null,
      statusCode: error.response?.status || 500,
    };
    if (error.response?.status === 401) {
      // Clear token if expired/invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    return Promise.reject(customError);
  }
);

export default api;
