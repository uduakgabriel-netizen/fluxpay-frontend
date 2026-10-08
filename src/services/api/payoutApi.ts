import apiClient from './client';

export interface BankAccountItem {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
  currency: string;
  isVerified: boolean;
  isDefault: boolean;
  provider?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddBankAccountParams {
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  setDefault?: boolean;
}

export interface VerifyBankAccountParams {
  accountNumber: string;
  bankCode: string;
  currency?: string;
}

export interface VerifiedAccountResult {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  verified: boolean;
}

export interface BankInfo {
  code: string;
  name: string;
}

export const payoutApi = {
  /**
   * List all payout bank accounts for authenticated user/merchant
   */
  async listAccounts(): Promise<{ accounts: BankAccountItem[]; total: number }> {
    const { data } = await apiClient.get<{ accounts: BankAccountItem[]; total: number }>('/payout-accounts');
    return data;
  },

  /**
   * Add a new payout bank account
   */
  async addAccount(account: AddBankAccountParams): Promise<BankAccountItem> {
    const { data } = await apiClient.post<BankAccountItem>('/payout-accounts', account);
    return data;
  },

  /**
   * Verify bank account name and number before saving
   */
  async verifyAccount(params: VerifyBankAccountParams): Promise<VerifiedAccountResult> {
    const { data } = await apiClient.post<VerifiedAccountResult>('/payout-accounts/verify', params);
    return data;
  },

  /**
   * Set account as default
   */
  async setDefault(id: string): Promise<BankAccountItem> {
    const { data } = await apiClient.patch<BankAccountItem>(`/payout-accounts/${id}/default`);
    return data;
  },

  /**
   * Delete payout account
   */
  async deleteAccount(id: string): Promise<{ success: boolean }> {
    const { data } = await apiClient.delete<{ success: boolean }>(`/payout-accounts/${id}`);
    return data;
  },

  /**
   * List supported banks for currency/country
   */
  async listBanks(currency = 'NGN'): Promise<{ banks: BankInfo[]; total: number }> {
    const { data } = await apiClient.get<{ banks: BankInfo[]; total: number }>('/payout-accounts/banks', {
      params: { currency },
    });
    return data;
  },
};

export default payoutApi;
