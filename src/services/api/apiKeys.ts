import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface ApiKeyPermissions {
  read: boolean
  write: boolean
  refund: boolean
}

export interface ApiKeyItem {
  id: string
  name: string
  keyPrefix: string
  maskedKey: string
  mode: 'LIVE' | 'TEST'
  permissions: ApiKeyPermissions
  lastUsed: string | null
  lastIp: string | null
  requestCount: number
  revoked: boolean
  revokedAt: string | null
  createdAt: string
}

export interface CreateApiKeyPayload {
  name: string
  mode: 'LIVE' | 'TEST'
  permissions?: ApiKeyPermissions
}

export interface CreatedApiKeyResult {
  id: string
  key: string // Full plaintext key, only returned ONCE
  keyPrefix: string
  name: string
  mode: 'LIVE' | 'TEST'
  permissions: ApiKeyPermissions
  createdAt: string
  message: string
}

export interface ApiKeyStats {
  id: string
  name: string
  keyPrefix: string
  maskedKey: string
  mode: 'LIVE' | 'TEST'
  permissions: ApiKeyPermissions
  lastUsed: string | null
  lastIp: string | null
  requestCount: number
  revoked: boolean
  revokedAt: string | null
  createdAt: string
  ageDays: number
  averageRequestsPerDay: number
}

// Legacy types preserved for backward compatibility
export interface ApiKeyInfo {
  prefix: string
  lastChars: string
  rotatedAt: string
}

export interface GeneratedCredentials {
  apiKey: {
    fullKey: string
    prefix: string
    lastChars: string
  }
  webhookSecret: {
    fullSecret: string
    prefix: string
    lastChars: string
  }
  rotatedAt: string
  warning: string
}

// ─── Multi-Key API Functions ────────────────────────────────

/**
 * Fetch all API keys for the current merchant
 */
export async function getApiKeys(): Promise<{ data: ApiKeyItem[]; total: number }> {
  const { data } = await apiClient.get<{ data: ApiKeyItem[]; total: number }>('/api-keys')
  return data
}

/**
 * Create a new named API key
 * Returns the plain API key string ONCE — never retrievable again
 */
export async function createApiKey(payload: CreateApiKeyPayload): Promise<CreatedApiKeyResult> {
  const { data } = await apiClient.post<CreatedApiKeyResult>('/api-keys', payload)
  return data
}

/**
 * Permanently revoke an API key by ID
 */
export async function revokeApiKeyById(id: string): Promise<{ id: string; revoked: boolean; revokedAt: string; message: string }> {
  const { data } = await apiClient.delete(`/api-keys/${id}`)
  return data
}

/**
 * Fetch usage stats for a specific API key
 */
export async function getApiKeyStats(id: string): Promise<ApiKeyStats> {
  const { data } = await apiClient.get<ApiKeyStats>(`/api-keys/${id}/stats`)
  return data
}

// ─── Legacy Functions (backward compatibility) ──────────────

export async function getApiKeyInfo(): Promise<ApiKeyInfo | null> {
  const { data } = await apiClient.get<{ apiKey: ApiKeyInfo | null }>('/merchants/api-key')
  return data.apiKey
}

export async function rollApiKey(mode: 'live' | 'test' = 'live'): Promise<GeneratedCredentials> {
  const { data } = await apiClient.post<GeneratedCredentials>('/merchants/api-key/roll', { mode })
  return data
}

export async function revokeApiKey(): Promise<void> {
  await apiClient.post('/merchants/api-key/revoke')
}
