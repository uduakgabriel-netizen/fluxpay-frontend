const TOKEN_KEY = 'sessionToken'
const MERCHANT_KEY = 'merchant'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem('fluxpay_merchant_token', token)
}

export function removeToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('fluxpay_merchant_token')
  localStorage.removeItem('fluxpay_token')
}

export interface StoredMerchant {
  id: string
  walletAddress: string
  email: string
  businessName: string
  emailVerified?: boolean
  createdAt?: string
  preferredTokenMint?: string
  preferredTokenSymbol?: string
  preferredTokenDecimals?: number
  hasSelectedToken?: boolean
  preferredTokenUpdatedAt?: string
}

export function getMerchant(): StoredMerchant | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(MERCHANT_KEY)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

export function setMerchant(merchant: StoredMerchant): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MERCHANT_KEY, JSON.stringify(merchant))
}

export function removeMerchant(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(MERCHANT_KEY)
}

export function clearAuth(): void {
  removeToken()
  removeMerchant()
}

/**
 * Validates a merchant JWT:
 * 1. Checks 3-part format
 * 2. Checks token expiration
 * 3. Enforces role: "merchant"
 */
export function isValidMerchantToken(token: string | null): boolean {
  if (!token || typeof token !== 'string') return false
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const decoded = JSON.parse(jsonPayload)

    // Check expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return false
    }

    // Role MUST be merchant
    if (decoded.role !== 'merchant') {
      return false
    }

    if (!decoded.id && !decoded.sub) {
      return false
    }

    return true
  } catch {
    return false
  }
}
