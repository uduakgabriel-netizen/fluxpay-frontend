import apiClient from './client';

export interface ConsumerNonceResponse {
  nonce: string;
  expiresAt: string;
}

export interface ConsumerUser {
  id: string;
  walletAddress: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsumerAuthResponse {
  token: string;
  user: ConsumerUser;
}

export const authApi = {
  /**
   * Request nonce for consumer wallet authentication
   */
  async requestNonce(walletAddress: string): Promise<ConsumerNonceResponse> {
    const { data } = await apiClient.post<ConsumerNonceResponse>('/auth/consumer/nonce', {
      walletAddress,
    });
    return data;
  },

  /**
   * Verify signature and obtain JWT token for consumer
   */
  async verify(walletAddress: string, message: string, signature: string): Promise<ConsumerAuthResponse> {
    const { data } = await apiClient.post<ConsumerAuthResponse>('/auth/consumer/verify', {
      walletAddress,
      message,
      signature,
    });
    if (data?.token && typeof window !== 'undefined') {
      localStorage.setItem('fluxpay_consumer_token', data.token);
    }
    return data;
  },

  /**
   * Validate token and fetch current consumer profile
   */
  async getMe(): Promise<{ user: ConsumerUser }> {
    const { data } = await apiClient.get<{ user: ConsumerUser }>('/auth/consumer/me');
    return data;
  },

  /**
   * Consumer logout
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fluxpay_consumer_token');
    }
  },
};

export default authApi;
