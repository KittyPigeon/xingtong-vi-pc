/**
 * 通用类型定义
 */

// API 响应数据结构
export interface ApiResponse<T = unknown> {
  code: string | number;
  data: T;
  message?: string;
  msg?: string;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  size?: number;
  limit?: number;
  offset?: number;
}

// 分页响应
export interface PaginationResponse<T = unknown> {
  data: T[];
  total: number;
  page?: number;
  size?: number;
}

// 通用状态枚举
export enum StatusEnum {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
}

// 路由元数据类型
export interface RouteMeta {
  title?: string;
  icon?: string;
  hideInMenu?: boolean;
  keepAlive?: boolean;
  requiresAuth?: boolean;
  permissions?: string[];
}
