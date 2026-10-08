import apiClient from './client';

export interface ExecuteOfframpResponse {
  transactionId: string;
  status: string;
  serializedTransaction: string;
  quote: {
    sourceToken: string;
    sourceAmount: string;
    fiatCurrency: string;
    fiatAmount: string;
    rate: string;
    fee: string;
    netAmount: string;
  };
  bankAccount: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    currency: string;
  };
}

export interface SubmitOfframpResponse {
  transactionId: string;
  status: string;
  swapTxHash?: string;
  payoutRefId?: string;
  completedAt?: string;
}

export interface TransactionStatusResponse {
  transactionId: string;
  status: string;
  step: number;
  totalSteps: number;
  stepLabel: string;
  isTerminal: boolean;
}

export interface OfframpTransactionDetail {
  id: string;
  quoteId: string;
  userId?: string;
  merchantId?: string;
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
  status: string;
  swapTxHash?: string;
  payoutRefId?: string;
  bankAccountId: string;
  provider: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  bankAccount?: {
    id: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    currency: string;
    isVerified: boolean;
  };
}

export interface ListTransactionsResponse {
  transactions: OfframpTransactionDetail[];
  total: number;
  limit: number;
  offset: number;
}

export const offrampApi = {
  /**
   * Execute off-ramp: reserves quote and builds swap transaction for user signature
   */
  async execute(quoteId: string, bankAccountId: string): Promise<ExecuteOfframpResponse> {
    const { data } = await apiClient.post<ExecuteOfframpResponse>('/offramp/execute', {
      quoteId,
      bankAccountId,
    });
    return data;
  },

  /**
   * Submit signed transaction to complete DEX swap and trigger fiat payout
   */
  async submit(transactionId: string, signedTransaction: string): Promise<SubmitOfframpResponse> {
    const { data } = await apiClient.post<SubmitOfframpResponse>('/offramp/submit', {
      transactionId,
      signedTransaction,
    });
    return data;
  },

  /**
   * Poll transaction progress and current step
   */
  async getStatus(transactionId: string): Promise<TransactionStatusResponse> {
    const { data } = await apiClient.get<TransactionStatusResponse>(`/offramp/transactions/${transactionId}/status`);
    return data;
  },

  /**
   * Get single transaction details
   */
  async getById(transactionId: string): Promise<OfframpTransactionDetail> {
    const { data } = await apiClient.get<OfframpTransactionDetail>(`/offramp/transactions/${transactionId}`);
    return data;
  },

  /**
   * List transactions for current actor
   */
  async list(params?: { status?: string; limit?: number; offset?: number }): Promise<ListTransactionsResponse> {
    const { data } = await apiClient.get<ListTransactionsResponse>('/offramp/transactions', { params });
    return data;
  },
};

export default offrampApi;
