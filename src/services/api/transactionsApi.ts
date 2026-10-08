import apiClient from './client';
import { OfframpTransactionDetail, ListTransactionsResponse } from './offrampApi';

export const transactionsApi = {
  /**
   * List consumer offramp transactions
   */
  async list(params?: { status?: string; limit?: number; offset?: number }): Promise<ListTransactionsResponse> {
    const { data } = await apiClient.get<ListTransactionsResponse>('/offramp/transactions', { params });
    return data;
  },

  /**
   * Get consumer transaction by ID
   */
  async getById(id: string): Promise<OfframpTransactionDetail> {
    const { data } = await apiClient.get<OfframpTransactionDetail>(`/offramp/transactions/${id}`);
    return data;
  },
};

export default transactionsApi;
