import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type AxiosRequestHeaders,
} from 'axios';
import { ElMessage } from 'element-plus';

interface AppResponse<T = unknown> {
  code: string | number;
  data: T;
  message?: string;
  msg?: string;
}

interface HttpError extends Error {
  name: string;
  code?: string | number;
  status?: number;
  data?: unknown;
  response?: unknown;
}

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || ({} as AxiosRequestHeaders);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function normalizeAppResponse(response: AxiosResponse): AppResponse {
  const data = response.data as unknown as Record<string, unknown>;
  if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'code')) {
    const successCodes = [0, 200, '0', '200', 'SUCCESS', 'OK'];
    const code = data.code as unknown as string | number;
    if (!successCodes.includes(code)) {
      const msg = (data.message as string) || (data.msg as string) || '请求失败';
      ElMessage.error(msg);
      const err: HttpError = new Error(msg) as HttpError;
      err.name = 'AppError';
      err.code = code;
      err.status = response.status;
      err.data = data;
      throw err;
    }
  }
  return {
    code: data.code,
    data: data.data,
    message: data.message,
    msg: data.msg,
  } as AppResponse<unknown>;
}

http.interceptors.response.use(
  (response) => {
    const data = normalizeAppResponse(response);
    (response as AxiosResponse<unknown>).data = data;
    return response;
  },
  (error: AxiosError | unknown) => {
    const anyErr = error as AxiosError | HttpError;
    if (anyErr && (anyErr.response as AxiosResponse<unknown>)) {
      const status = (anyErr.response as AxiosResponse<unknown>).status;
      const map: Record<number, string> = {
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
        (anyErr.response as AxiosResponse<unknown>).data?.['message'] ||
        (anyErr.response as AxiosResponse<unknown>).data?.['msg'] ||
        (status ? map[status] : '') ||
        '请求失败';
      if (status === 401) {
        localStorage.removeItem('token');
      }
      ElMessage.error(msg);
      const err: HttpError = new Error(msg) as HttpError;
      err.name = 'HttpError';
      err.status = status;
      err.code = anyErr.code;
      err.response = anyErr.response;
      return Promise.reject(err);
    }
    if (anyErr && (anyErr.code === 'ECONNABORTED' || /timeout/i.test(anyErr.message))) {
      ElMessage.error('请求超时');
      const err: HttpError = new Error('请求超时') as HttpError;
      err.name = 'TimeoutError';
      err.code = anyErr.code;
      return Promise.reject(err);
    }
    if (anyErr && /Network Error/i.test(anyErr.message)) {
      ElMessage.error('网络错误');
      const err: HttpError = new Error('网络错误') as HttpError;
      err.name = 'NetworkError';
      err.code = anyErr.code;
      return Promise.reject(err);
    }
    ElMessage.error('请求失败');
    return Promise.reject(anyErr);
  }
);

export default http;
