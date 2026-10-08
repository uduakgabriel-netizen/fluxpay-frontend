import apiClient from './client';

export interface GenerateQuoteParams {
  sourceToken: string;
  sourceMint: string;
  sourceAmount: string | number;
  fiatCurrency: string;
}

export interface QuoteData {
  quoteId: string;
  sourceToken: string;
  sourceMint: string;
  sourceAmount: string;
  intermediateToken: string;
  intermediateAmount: string;
  fiatCurrency: string;
  fiatAmount: string;
  rate: string;
  fee: string;
  networkFee: string;
  netAmount: string;
  expiresAt: string;
  expiresInSeconds?: number;
  route?: any;
}

export const quoteApi = {
  /**
   * Request conversion quote for swapping crypto to fiat
   */
  async generateQuote(params: GenerateQuoteParams): Promise<QuoteData> {
    const { data } = await apiClient.post<QuoteData>('/offramp/quote', {
      ...params,
      sourceAmount: String(params.sourceAmount),
    });
    return data;
  },

  /**
   * Fetch quote status and details by quoteId
   */
  async getQuote(quoteId: string): Promise<QuoteData> {
    const { data } = await apiClient.get<QuoteData>(`/offramp/quote/${quoteId}`);
    return data;
  },
};

export default quoteApi;
