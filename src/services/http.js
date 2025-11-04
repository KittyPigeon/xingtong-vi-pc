import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 可在此注入 token
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 可在此统一处理错误
    // 如：ElMessage.error(error.response?.data?.message || '请求失败');
    return Promise.reject(error);
  }
);

export default http;
