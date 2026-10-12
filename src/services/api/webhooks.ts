import apiClient from './client'

// ─── Types ──────────────────────────────────────────────────

export interface WebhookSecretInfo {
  prefix: string
  lastChars: string
  rotatedAt: string
}

export interface WebhookInfo {
  webhookUrl: string | null
  secretInfo: WebhookSecretInfo | null
}

export interface WebhookRollResponse {
  fullSecret: string
  prefix: string
  lastChars: string
  rotatedAt: string
}

export interface TestWebhookResult {
  url: string
  success: boolean
  statusCode?: number
  responseBody?: string
  duration: number
  message: string
  error?: string
}

// ─── API Functions ──────────────────────────────────────────

export async function getWebhookInfo(): Promise<WebhookInfo> {
  const { data } = await apiClient.get<WebhookInfo>('/merchants/webhook')
  return data
}

export async function updateWebhookUrl(webhookUrl: string | null): Promise<void> {
  await apiClient.put('/merchants/webhook/url', { webhookUrl })
}

export async function rollWebhookSecret(): Promise<WebhookRollResponse> {
  const { data } = await apiClient.post<WebhookRollResponse>('/merchants/webhook/roll')
  return data
}

export async function generateWebhookSecret(): Promise<WebhookRollResponse> {
  const { data } = await apiClient.post<WebhookRollResponse>('/merchants/webhook/roll')
  return data
}

export async function sendTestWebhook(): Promise<TestWebhookResult> {
  const { data } = await apiClient.post<TestWebhookResult>('/webhooks/test')
  return data
}
