import http from './http';

// 示例：用户登录接口（加密请求数据）
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userInfo: {
    id: number;
    username: string;
    email: string;
  };
}

/**
 * 用户登录（加密传输敏感信息）
 * @param data 登录信息
 * @returns 登录结果
 */
export function login(data: LoginRequest) {
  // 为这个请求设置加密配置
  const config = {
    encryptionConfig: {
      enableEncryption: true,
      encryptRequest: true,
      decryptResponse: true,
    },
  };

  return http.post<LoginResponse>('/auth/login', data, config as any);
}

// 示例：获取用户信息接口（加密响应数据）
export interface UserInfoResponse {
  id: number;
  username: string;
  email: string;
  phone: string;
  createdAt: string;
}

/**
 * 获取用户信息（加密响应数据）
 * @returns 用户信息
 */
export function getUserInfo() {
  // 为这个请求设置加密配置
  const config = {
    encryptionConfig: {
      enableEncryption: true,
      encryptRequest: false,
      decryptResponse: true,
    },
  };

  return http.get<UserInfoResponse>('/user/info', config as any);
}

// 示例：更新用户信息接口（请求和响应都加密）
export interface UpdateUserInfoRequest {
  email?: string;
  phone?: string;
}

export interface UpdateUserInfoResponse {
  success: boolean;
  message: string;
}

/**
 * 更新用户信息（请求和响应都加密）
 * @param data 更新的用户信息
 * @returns 更新结果
 */
export function updateUserInfo(data: UpdateUserInfoRequest) {
  // 为这个请求设置加密配置
  const config = {
    encryptionConfig: {
      enableEncryption: true,
      encryptRequest: true,
      decryptResponse: true,
    },
  };

  return http.put<UpdateUserInfoResponse>('/user/info', data, config as any);
}

// 示例：获取用户列表接口（不加密）
export interface UserListItem {
  id: number;
  username: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface GetUserListResponse {
  list: UserListItem[];
  total: number;
}

/**
 * 获取用户列表（不加密传输）
 * @returns 用户列表
 */
export function getUserList() {
  // 为这个请求设置不加密的配置
  const config = {
    encryptionConfig: {
      enableEncryption: false,
    },
  };

  return http.get<GetUserListResponse>('/users', config as any);
}
