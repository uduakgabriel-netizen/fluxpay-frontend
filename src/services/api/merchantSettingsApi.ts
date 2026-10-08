import apiClient from './client';

export interface MerchantSettlementSettings {
  merchantId: string;
  settlementType: 'CRYPTO' | 'FIAT';
  settlementCurrency: string | null;
  defaultPayoutAccountId: string | null;
  defaultPayoutAccount?: {
    id: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    currency: string;
  } | null;
  preferredCryptoToken?: {
    symbol: string;
    mint: string;
    decimals: number;
  };
}

export interface UpdateSettlementSettingsParams {
  settlementType?: 'CRYPTO' | 'FIAT';
  settlementCurrency?: string;
  defaultPayoutAccountId?: string;
}

export const merchantSettingsApi = {
  /**
   * Fetch current merchant settlement configuration
   */
  async getSettings(): Promise<MerchantSettlementSettings> {
    const { data } = await apiClient.get<MerchantSettlementSettings>('/merchant/settings/settlement');
    return data;
  },

  /**
   * Update merchant settlement configuration
   */
  async updateSettings(settings: UpdateSettlementSettingsParams): Promise<MerchantSettlementSettings> {
    const { data } = await apiClient.patch<MerchantSettlementSettings>('/merchant/settings/settlement', settings);
    return data;
  },
};

export default merchantSettingsApi;
