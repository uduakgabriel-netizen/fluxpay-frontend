import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import {
  Webhook as WebhookIcon,
  Settings,
  Copy,
  RefreshCw,
  Key,
  ShieldCheck,
  AlertTriangle,
  Check,
  CheckCircle2,
  XCircle,
  X,
  Send,
  Lock,
  ExternalLink
} from 'lucide-react'
import {
  getWebhookInfo,
  updateWebhookUrl,
  rollWebhookSecret,
  sendTestWebhook,
  type WebhookInfo,
  type WebhookRollResponse,
  type TestWebhookResult
} from '@/services/api/webhooks'

export default function WebhooksPage() {
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // URL Editing state
  const [editingUrl, setEditingUrl] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [savingUrl, setSavingUrl] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  // Secret Generation / Rolling state
  const [rollingSecret, setRollingSecret] = useState(false)
  const [showRollConfirmModal, setShowRollConfirmModal] = useState(false)
  const [secretError, setSecretError] = useState<string | null>(null)

  // Credentials Reveal Modal state (Shown ONCE right after generation/rolling)
  const [generatedSecret, setGeneratedSecret] = useState<WebhookRollResponse | null>(null)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [confirmedSaved, setConfirmedSaved] = useState(false)

  // Test Webhook state
  const [testingWebhook, setTestingWebhook] = useState(false)
  const [testResult, setTestResult] = useState<TestWebhookResult | null>(null)

  // ─── Fetch Webhook Config ───────────────────────────────────

  const fetchWebhookInfo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getWebhookInfo()
      setWebhookInfo(result)
      setUrlInput(result.webhookUrl || '')
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load webhook configuration')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWebhookInfo()
  }, [fetchWebhookInfo])

  // ─── Save Webhook URL ───────────────────────────────────────

  const handleSaveUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setUrlError(null)

    const trimmed = urlInput.trim()
    if (trimmed) {
      try {
        new URL(trimmed)
      } catch {
        setUrlError('Please enter a valid URL including https:// or http://')
        return
      }
    }

    setSavingUrl(true)
    try {
      await updateWebhookUrl(trimmed || null)
      setWebhookInfo((prev) => (prev ? { ...prev, webhookUrl: trimmed || null } : null))
      setEditingUrl(false)
      setTestResult(null)
    } catch (err: any) {
      setUrlError(err?.response?.data?.error || err?.message || 'Failed to update webhook URL')
    } finally {
      setSavingUrl(false)
    }
  }

  // ─── Generate / Roll Secret ─────────────────────────────────

  const handleGenerateSecretClick = () => {
    setSecretError(null)
    if (webhookInfo?.secretInfo) {
      // If a secret already exists, ask for confirmation before rolling
      setShowRollConfirmModal(true)
    } else {
      // If no secret exists yet, generate immediately!
      executeRollSecret()
    }
  }

  const executeRollSecret = async () => {
    setRollingSecret(true)
    setSecretError(null)
    setShowRollConfirmModal(false)

    try {
      const result = await rollWebhookSecret()
      setGeneratedSecret(result)
      setShowCredentialsModal(true)
      setCopiedSecret(false)
      setConfirmedSaved(false)

      // Update active secret state
      setWebhookInfo((prev) =>
        prev
          ? {
              ...prev,
              secretInfo: {
                prefix: result.prefix,
                lastChars: result.lastChars,
                rotatedAt: result.rotatedAt,
              },
            }
          : {
              webhookUrl: null,
              secretInfo: {
                prefix: result.prefix,
                lastChars: result.lastChars,
                rotatedAt: result.rotatedAt,
              },
            }
      )
    } catch (err: any) {
      setSecretError(err?.response?.data?.error || err?.message || 'Failed to generate webhook secret')
    } finally {
      setRollingSecret(false)
    }
  }

  const handleCloseCredentialsModal = () => {
    if (!confirmedSaved) {
      if (
        !window.confirm(
          'Are you sure? You will NOT be able to view this webhook secret again. Make sure you have copied and saved it.'
        )
      ) {
        return
      }
    }
    setShowCredentialsModal(false)
    setGeneratedSecret(null)
  }

  // ─── Test Webhook ───────────────────────────────────────────

  const handleTestWebhook = async () => {
    if (!webhookInfo?.webhookUrl) {
      alert('Please configure and save a webhook endpoint URL first.')
      return
    }
    if (!webhookInfo?.secretInfo) {
      alert('Please generate a webhook signing secret first.')
      return
    }

    setTestingWebhook(true)
    setTestResult(null)
    try {
      const res = await sendTestWebhook()
      setTestResult(res)
    } catch (err: any) {
      setTestResult({
        url: webhookInfo.webhookUrl,
        success: false,
        duration: 0,
        message: err?.response?.data?.error || err?.message || 'Failed to dispatch test webhook',
        error: err?.response?.data?.error || err?.message,
      })
    } finally {
      setTestingWebhook(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSecret(true)
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return date
    }
  }

  return (
    <DashboardLayout pageTitle="Webhooks">
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Webhooks</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Receive real-time signed notifications when events happen on your account.
            </p>
          </div>
        </div>

        {/* ── Events Subscriptions Banner ── */}
        <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl p-4 flex items-start gap-3">
          <WebhookIcon size={18} className="text-[#8B5CF6] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#8B5CF6]">Event Subscriptions</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              When configured, FluxPay automatically pushes signed HTTP POST payloads to your endpoint for:{' '}
              <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded mx-1 text-gray-900 dark:text-gray-200">payment.completed</code>,{' '}
              <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded mx-1 text-gray-900 dark:text-gray-200">payment.failed</code>, and{' '}
              <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded mx-1 text-gray-900 dark:text-gray-200">payment.expired</code>.
            </p>
          </div>
        </div>

        {/* Global Loading / Error */}
        {loading ? (
          <div className="p-16 text-center bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl">
            <RefreshCw size={28} className="mx-auto text-gray-400 animate-spin mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Loading webhook configuration...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-white dark:bg-gray-900/50 border border-red-200 dark:border-red-500/20 rounded-xl">
            <AlertTriangle size={32} className="mx-auto text-red-500 mb-3" />
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button
              onClick={fetchWebhookInfo}
              className="text-sm font-semibold text-[#8B5CF6] hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Left Card: Webhook URL Endpoint ── */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Settings size={18} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Webhook URL Endpoint</h3>
                  </div>
                  {webhookInfo?.webhookUrl && !editingUrl && (
                    <button
                      onClick={handleTestWebhook}
                      disabled={testingWebhook}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-semibold text-gray-800 dark:text-gray-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send size={12} className={testingWebhook ? 'animate-pulse' : ''} />
                      {testingWebhook ? 'Testing...' : 'Send Test Webhook'}
                    </button>
                  )}
                </div>

                {!editingUrl ? (
                  <div className="space-y-4">
                    {webhookInfo?.webhookUrl ? (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Configured URL</p>
                        <code className="block w-full px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm text-gray-800 dark:text-gray-200 break-all select-all font-mono">
                          {webhookInfo.webhookUrl}
                        </code>
                      </div>
                    ) : (
                      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl">
                        <p className="text-sm text-amber-800 dark:text-amber-400">
                          No webhook URL is currently configured.
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1">
                          Add your server endpoint URL to receive payment updates in real time.
                        </p>
                      </div>
                    )}

                    {/* Test Webhook Feedback */}
                    {testResult && (
                      <div
                        className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                          testResult.success
                            ? 'bg-emerald-50 dark:bg-emerald-500/[0.08] border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            : 'bg-red-50 dark:bg-red-500/[0.08] border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {testResult.success ? (
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{testResult.message}</p>
                          {testResult.statusCode && (
                            <p className="text-[11px] opacity-80 mt-0.5">HTTP Status: {testResult.statusCode}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSaveUrl} className="space-y-4">
                    {urlError && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/[0.08] border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                        <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
                        <span>{urlError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Endpoint URL
                      </label>
                      <input
                        type="url"
                        autoFocus
                        value={urlInput}
                        onChange={(e) => {
                          setUrlInput(e.target.value)
                          if (urlError) setUrlError(null)
                        }}
                        placeholder="https://api.yourdomain.com/webhooks/fluxpay"
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all font-mono"
                      />
                      <p className="text-[11px] text-gray-500 mt-1.5">
                        Must accept POST requests and handle the <code className="font-mono">X-FluxPay-Signature</code> header.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={savingUrl}
                        className="px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                      >
                        {savingUrl ? 'Saving...' : 'Save Endpoint URL'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUrl(false)
                          setUrlInput(webhookInfo?.webhookUrl || '')
                          setUrlError(null)
                        }}
                        className="px-4 py-2 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {!editingUrl && (
                <div className="pt-5 mt-4 border-t border-gray-100 dark:border-white/[0.04]">
                  <button
                    onClick={() => setEditingUrl(true)}
                    className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-semibold text-gray-900 dark:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    {webhookInfo?.webhookUrl ? 'Edit Endpoint URL' : 'Add Webhook URL'}
                  </button>
                </div>
              )}
            </div>

            {/* ── Right Card: Webhook Signing Secret ── */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Key size={18} className="text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Signing Secret</h3>
                  </div>

                  {/* Top action button: Roll Secret if active */}
                  {webhookInfo?.secretInfo && (
                    <button
                      onClick={handleGenerateSecretClick}
                      disabled={rollingSecret}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-semibold text-gray-900 dark:text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={rollingSecret ? 'animate-spin' : ''} />
                      {rollingSecret ? 'Rolling...' : 'Roll Secret'}
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                  FluxPay cryptographically signs all webhook payloads using HMAC-SHA256. Use this secret in your backend to verify that incoming payloads came from FluxPay using the <code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200 font-mono">X-FluxPay-Signature</code> header.
                </p>

                {/* Inline Secret Error */}
                {secretError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/[0.08] border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                    <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
                    <span>{secretError}</span>
                  </div>
                )}

                {/* Active Secret vs Empty State */}
                {webhookInfo?.secretInfo ? (
                  <div className="space-y-3 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Current Active Secret
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        ACTIVE
                      </span>
                    </div>
                    <div className="px-3.5 py-2.5 bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg">
                      <code className="text-xs font-mono text-gray-800 dark:text-gray-200">
                        {webhookInfo.secretInfo.prefix}••••••••••••••••••••••••••••••••{webhookInfo.secretInfo.lastChars}
                      </code>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      Last rotated on {formatDate(webhookInfo.secretInfo.rotatedAt)}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#8B5CF6] flex items-center justify-center mb-3">
                      <Key size={22} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      No Signing Secret Active
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1 mb-4">
                      Generate your cryptographic webhook secret to verify signatures in your integration.
                    </p>
                    <button
                      onClick={handleGenerateSecretClick}
                      disabled={rollingSecret}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
                    >
                      {rollingSecret ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Generating Secret...
                        </>
                      ) : (
                        <>
                          <Key size={14} />
                          Generate Secret
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Modal: Roll Secret Confirmation ── */}
        {showRollConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Roll Webhook Secret?
                  </h3>
                  <p className="text-xs text-red-500 font-semibold mt-0.5">
                    This will invalidate your current secret immediately.
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Rolling your webhook secret creates a new secret key. Any webhooks currently being processed by your server will fail signature verification until you update your backend environment variable with the new secret.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowRollConfirmModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeRollSecret}
                  disabled={rollingSecret}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  {rollingSecret ? <RefreshCw size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  Yes, Roll Secret
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal: Secret Revealed (Shown ONCE right after generation) ── */}
        {showCredentialsModal && generatedSecret && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Webhook Secret Generated
                  </h3>
                  <p className="text-xs text-red-500 font-semibold mt-0.5">
                    ⚠️ Copy this secret now. For security reasons, it will NEVER be shown again!
                  </p>
                </div>
              </div>

              {/* Secret display box */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Lock size={12} /> Webhook Signing Secret
                  </span>
                  <span className="text-[10px] text-gray-400">Store on your backend server</span>
                </label>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-white/5 px-3.5 py-2.5 rounded-xl flex-1 break-all border border-gray-200 dark:border-white/10 select-all">
                    {generatedSecret.fullSecret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedSecret.fullSecret)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      copiedSecret
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {copiedSecret ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                {copiedSecret && (
                  <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Copied to clipboard!
                  </p>
                )}
              </div>

              {/* Integration snippet */}
              <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl p-3.5">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Add to your backend .env file:
                </p>
                <code className="text-xs font-mono text-gray-800 dark:text-gray-200 block break-all">
                  FLUXPAY_WEBHOOK_SECRET=&quot;{generatedSecret.fullSecret}&quot;
                </code>
              </div>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none bg-amber-50/50 dark:bg-amber-500/[0.04] p-3 rounded-xl border border-amber-200/60 dark:border-amber-500/10">
                <input
                  type="checkbox"
                  checked={confirmedSaved}
                  onChange={(e) => setConfirmedSaved(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                />
                <span className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  I have copied and saved this webhook secret in my backend environment variables. I understand I will not be able to view it again.
                </span>
              </label>

              {/* Close Button */}
              <button
                onClick={handleCloseCredentialsModal}
                disabled={!confirmedSaved}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  confirmedSaved
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white hover:opacity-90 shadow-lg shadow-purple-500/20'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                }`}
              >
                {confirmedSaved ? 'Done — Secret Saved' : 'Confirm checkbox above to continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
