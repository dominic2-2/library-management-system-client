import axios from 'axios';
import { ENV } from './env';

const api = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add interceptors here if needed

export default api;