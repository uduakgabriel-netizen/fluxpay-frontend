import apiClient from './client';

export interface SettlementDetail {
  id: string;
  merchantId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  currency: string;
  grossAmount: string;
  fiatAmount: string;
  fxRate: string;
  fee: string;
  netAmount: string;
  provider: string;
  providerRefId?: string;
  bankAccountId?: string;
  paymentCount: number;
  payments?: any[];
  bankAccount?: {
    id: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    currency: string;
    isVerified: boolean;
  };
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  settledAt?: string;
}

export interface ListSettlementsResponse {
  settlements: SettlementDetail[];
  total: number;
  limit: number;
  offset: number;
}

export interface TriggerSettlementResponse {
  settlementId: string;
  status: string;
  currency: string;
  grossAmount: string;
  netAmount: string;
  fee: string;
  paymentCount: number;
  provider: string;
  providerRefId?: string;
  settledAt?: string;
}

export const merchantSettlementsApi = {
  /**
   * List settlements for current merchant
   */
  async list(params?: { status?: string; limit?: number; offset?: number }): Promise<ListSettlementsResponse> {
    const { data } = await apiClient.get<ListSettlementsResponse>('/merchant/settlements', { params });
    return data;
  },

  /**
   * Get single settlement details with included payments and bank account
   */
  async getById(id: string): Promise<SettlementDetail> {
    const { data } = await apiClient.get<SettlementDetail>(`/merchant/settlements/${id}`);
    return data;
  },

  /**
   * Manually trigger on-demand fiat settlement batch
   */
  async trigger(currency?: string, payoutAccountId?: string): Promise<TriggerSettlementResponse> {
    const { data } = await apiClient.post<TriggerSettlementResponse>('/merchant/settlements/trigger', {
      currency,
      payoutAccountId,
    });
    return data;
  },
};

export default merchantSettlementsApi;
