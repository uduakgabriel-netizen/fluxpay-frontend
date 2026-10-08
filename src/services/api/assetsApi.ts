import apiClient from './client';

export interface SellableToken {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  logoUrl?: string;
  logoURI?: string;
  rateNgn?: number;
  balance?: number;
  badge?: string;
  iconBg?: string;
}

export interface SellableTokensResponse {
  tokens: SellableToken[];
  total: number;
}

export const assetsApi = {
  /**
   * Fetch list of supported sellable tokens
   */
  async getSellableTokens(params?: { search?: string; limit?: number; offset?: number }): Promise<SellableTokensResponse> {
    const { data } = await apiClient.get<SellableTokensResponse>('/assets/sellable', { params });
    return data;
  },

  /**
   * Fetch a single sellable token by its mint address
   */
  async getSellableTokenByMint(mint: string): Promise<SellableToken> {
    const { data } = await apiClient.get<SellableToken>(`/assets/sellable/${mint}`);
    return data;
  },
};

export default assetsApi;
