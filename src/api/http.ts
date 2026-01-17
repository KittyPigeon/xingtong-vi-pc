import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';
import { message } from 'ant-design-vue';
import { encryptData, decryptData, type CryptoConfig } from '@/utils/crypto';

declare const console: {
  warn(...data: any[]): void;
};

interface AppResponse<T = unknown> {
  code: string | number;
  data: T;
  message?: string;
  msg?: string;
}

// 加密配置
interface EncryptionConfig extends CryptoConfig {
  encryptRequest?: boolean;
  decryptResponse?: boolean;
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

// 默认加密配置
const defaultEncryptionConfig: EncryptionConfig = {
  enableEncryption: import.meta.env.VITE_ENABLE_ENCRYPTION === 'true',
  algorithm: (import.meta.env.VITE_CRYPTO_ALGORITHM as 'AES' | 'DES' | 'Rabbit' | 'RC4') || 'AES',
  secretKey: import.meta.env.VITE_CRYPTO_SECRET_KEY || 'default-secret-key',
  encryptRequest: true,
  decryptResponse: true,
};

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || ({} as AxiosRequestHeaders);
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 检查是否需要加密请求数据
    const encryptionConfig: EncryptionConfig = {
      ...defaultEncryptionConfig,
      ...((config as any).encryptionConfig || {}),
    };

    // 如果启用了请求加密并且有数据需要加密
    if (
      encryptionConfig.enableEncryption &&
      encryptionConfig.encryptRequest &&
      config.data &&
      Object.keys(config.data).length > 0
    ) {
      try {
        config.data = {
          encrypted: encryptData(config.data, encryptionConfig),
        };
      } catch (error) {
        console.warn('Failed to encrypt request data:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

function normalizeAppResponse(response: AxiosResponse): AppResponse {
  let data = response.data as unknown as Record<string, unknown>;

  // 检查是否需要解密响应数据
  const config = response.config;
  const encryptionConfig: EncryptionConfig = {
    ...defaultEncryptionConfig,
    ...((config as any).encryptionConfig || {}),
  };

  // 如果响应数据是加密的，则进行解密
  if (
    encryptionConfig.enableEncryption &&
    encryptionConfig.decryptResponse &&
    data &&
    typeof data === 'object' &&
    data.encrypted
  ) {
    try {
      const decryptedData = decryptData(data.encrypted as string, encryptionConfig);
      data = decryptedData as Record<string, unknown>;
    } catch (error) {
      console.warn('Failed to decrypt response data:', error);
    }
  }

  if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'code')) {
    const successCodes = [0, 200, '0', '200', 'SUCCESS', 'OK'];
    const code = data.code as unknown as string | number;
    if (!successCodes.includes(code)) {
      const msg = (data.message as string) || (data.msg as string) || '请求失败';
      message.error(msg);
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
      message.error(msg);
      const err: HttpError = new Error(msg) as HttpError;
      err.name = 'HttpError';
      err.status = status;
      err.code = anyErr.code;
      err.response = anyErr.response;
      return Promise.reject(err);
    }
    if (anyErr && (anyErr.code === 'ECONNABORTED' || /timeout/i.test(anyErr.message))) {
      message.error('请求超时');
      const err: HttpError = new Error('请求超时') as HttpError;
      err.name = 'TimeoutError';
      err.code = anyErr.code;
      return Promise.reject(err);
    }
    if (anyErr && /Network Error/i.test(anyErr.message)) {
      message.error('网络错误');
      const err: HttpError = new Error('网络错误') as HttpError;
      err.name = 'NetworkError';
      err.code = anyErr.code;
      return Promise.reject(err);
    }
    message.error('请求失败');
    return Promise.reject(anyErr);
  }
);

export default http;
