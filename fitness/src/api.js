import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fitness-saas.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitpro_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
