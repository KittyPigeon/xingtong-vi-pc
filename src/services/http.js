import axios from 'axios';
import { ElMessage } from 'element-plus';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function normalizeAppResponse(response) {
  const data = response.data;
  if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'code')) {
    const successCodes = [0, 200, '0', '200', 'SUCCESS', 'OK'];
    const code = data.code;
    if (!successCodes.includes(code)) {
      const msg = data.message || data.msg || '请求失败';
      ElMessage.error(msg);
      const err = new Error(msg);
      err.name = 'AppError';
      err.code = code;
      err.status = response.status;
      err.data = data;
      throw err;
    }
  }
  return data;
}

http.interceptors.response.use(
  (response) => normalizeAppResponse(response),
  (error) => {
    if (error && error.response) {
      const status = error.response.status;
      const map = {
        400: '请求参数错误',
        401: '未认证或令牌过期',
        403: '无访问权限',
        404: '资源不存在',
        408: '请求超时',
        413: '请求实体过大',
        429: '请求过于频繁',
        500: '服务器错误',
        502: '网关错误',
        503: '服务不可用',
        504: '网关超时',
      };
      const msg =
        error.response.data?.message || error.response.data?.msg || map[status] || '请求失败';
      if (status === 401) {
        localStorage.removeItem('token');
      }
      ElMessage.error(msg);
      const err = new Error(msg);
      err.name = 'HttpError';
      err.status = status;
      err.code = error.code;
      err.response = error.response;
      return Promise.reject(err);
    }
    if (error && (error.code === 'ECONNABORTED' || /timeout/i.test(error.message))) {
      ElMessage.error('请求超时');
      const err = new Error('请求超时');
      err.name = 'TimeoutError';
      err.code = error.code;
      return Promise.reject(err);
    }
    if (error && /Network Error/i.test(error.message)) {
      ElMessage.error('网络错误');
      const err = new Error('网络错误');
      err.name = 'NetworkError';
      err.code = error.code;
      return Promise.reject(err);
    }
    ElMessage.error('请求失败');
    return Promise.reject(error);
  }
);

export default http;
