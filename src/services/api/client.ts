import axios from 'axios'
import { getToken, clearAuth } from '@/utils/token'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fluxpay-solana-payment-gateway01.onrender.com'

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — pass through errors to caller
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error)
  }
)

export default apiClient
