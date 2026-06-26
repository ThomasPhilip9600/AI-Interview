import axios from 'axios';

// Create a configured axios instance
// Assumes backend is running on port 5000 during development
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach a default user_id for testing
// Since there's no auth/JWT, we just pass the user_id directly
api.interceptors.request.use((config) => {
  // Use a fixed testing UUID or get from localStorage if implemented
  const userId = '11111111-1111-1111-1111-111111111111';
  
  if (config.method === 'get') {
    config.params = { ...config.params, user_id: userId };
  } else if (config.data && !(config.data instanceof FormData)) {
    config.data.user_id = userId;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
