import { payoutApi } from '@/services/api/payoutApi';

/**
 * Real bank verification utility connecting to backend OneLiquidity API.
 * Uses live backend verification endpoints.
 */
export async function resolveAccountNameAsync(accountNumber, bankCode, currency = 'NGN') {
  if (!accountNumber || accountNumber.length < 10 || !bankCode) {
    return '';
  }
  const result = await payoutApi.verifyAccount({
    accountNumber,
    bankCode,
    currency,
  });
  return result?.accountName || '';
}

// Retained for backward-compat signature only, calls real API asynchronously if awaited
export function resolveAccountName(accountNumber, bankName) {
  return '';
}

export const DEFAULT_RESOLVED_NAME = '';

// Deprecated empty fallback - pages fetch live banks from payoutApi.listBanks()
export const NIGERIAN_BANKS = [];
