import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('documind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'An unexpected network error occurred.';
    
    // Auto-clear invalid session on 401 Unauthorized
    if (status === 401) {
      localStorage.removeItem('documind_token');
      window.dispatchEvent(new CustomEvent('documind_auth_expired'));
    }

    const customError = new Error(message);
    customError.status = status;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

export default api;
