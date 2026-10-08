import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearAuth } from '@/utils/token';

const rawBase = process.env.NEXT_PUBLIC_API_URL || 'https://fluxpay-backend-0ez8.onrender.com';
const API_URL = rawBase.replace(/\/$/, '');

export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function getActiveToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('fluxpay_consumer_token') ||
    localStorage.getItem('fluxpay_merchant_token') ||
    localStorage.getItem('sessionToken') ||
    localStorage.getItem('fluxpay_token') ||
    getToken() ||
    null
  );
}

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor — attach JWT token and normalize url
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // If the path accidentally starts with /api/, strip it to avoid /api/api/...
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    const token = getActiveToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — retry on network errors, handle 401/403/500, normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const config = error.config as any;

    // Retry max 2 times on network errors (no response from server)
    if (!error.response && config && (config.__retryCount || 0) < 2) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      await new Promise((resolve) => setTimeout(resolve, 1000 * config.__retryCount));
      return apiClient(config);
    }

    const status = error.response?.status || 500;
    const errorData = error.response?.data;

    let message =
      errorData?.error ||
      errorData?.message ||
      (error.code === 'ECONNABORTED'
        ? 'Request timed out. Please try again.'
        : !error.response
        ? 'Network error. Please check your internet connection.'
        : 'An unexpected error occurred');

    let code = errorData?.code || 'INTERNAL_ERROR';
    if (!errorData?.code) {
      switch (status) {
        case 400:
          code = 'VALIDATION_ERROR';
          break;
        case 401:
          code = 'AUTH_ERROR';
          break;
        case 403:
          code = 'FORBIDDEN';
          break;
        case 404:
          code = 'NOT_FOUND';
          break;
        case 409:
          code = 'CONFLICT';
          break;
        case 410:
          code = 'QUOTE_EXPIRED';
          break;
        case 422:
          code = 'INSUFFICIENT_FUNDS';
          break;
        case 502:
          code = 'PROVIDER_ERROR';
          break;
        default:
          code = 'INTERNAL_ERROR';
      }
    }

    // 401 handling — clear stale tokens and redirect if on protected page
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fluxpay_consumer_token');
      localStorage.removeItem('fluxpay_merchant_token');
      localStorage.removeItem('sessionToken');
      clearAuth();

      const path = window.location.pathname;
      const isPublic = ['/', '/login', '/sell', '/features', '/pricing', '/docs', '/contact'].includes(path);
      if (!isPublic && (path.startsWith('/dashboard') || path.startsWith('/Merchant'))) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new ApiError(message, code, status, errorData?.details));
  }
);

export default apiClient;
