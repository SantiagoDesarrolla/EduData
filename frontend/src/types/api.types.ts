// src/types/api.types.ts - COMPLETO
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}