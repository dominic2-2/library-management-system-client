import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://localhost:7142/api', // hoặc process.env.API_URL
  timeout: 10000, // timeout sau 10s
  headers: {
    'Content-Type': 'application/json',
  },
});


// Optionally: Thêm interceptors để tự động thêm token, xử lý lỗi...
// instance.interceptors.request.use(...)
// instance.interceptors.response.use(...)

export default instance;
