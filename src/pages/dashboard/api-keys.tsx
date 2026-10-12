import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/layout'
import {
  Key,
  Plus,
  Copy,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Check,
  Webhook,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Info,
  Calendar,
  Activity,
  CheckCircle2,
  XCircle,
  X,
  Sliders,
  ChevronDown
} from 'lucide-react'
import {
  getApiKeys,
  createApiKey,
  revokeApiKeyById,
  getApiKeyStats,
  type ApiKeyItem,
  type CreatedApiKeyResult,
  type ApiKeyStats
} from '@/services/api/apiKeys'

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState<'all' | 'LIVE' | 'TEST'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all')

  // Create Key Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyMode, setNewKeyMode] = useState<'LIVE' | 'TEST'>('LIVE')
  const [newKeyPermissions, setNewKeyPermissions] = useState({
    read: true,
    write: true,
    refund: false,
  })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Credentials Reveal Modal state (One-time plaintext display)
  const [createdResult, setCreatedResult] = useState<CreatedApiKeyResult | null>(null)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [confirmedSaved, setConfirmedSaved] = useState(false)

  // Copy feedback for list items
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  // Stats Modal state
  const [statsModalKey, setStatsModalKey] = useState<ApiKeyItem | null>(null)
  const [keyStats, setKeyStats] = useState<ApiKeyStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // ─── Fetch API Keys ─────────────────────────────────────────

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getApiKeys()
      setKeys(res.data || [])
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  // ─── Filtered Keys ──────────────────────────────────────────

  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        const matchesName = k.name?.toLowerCase().includes(q)
        const matchesPrefix = k.keyPrefix?.toLowerCase().includes(q)
        const matchesMasked = k.maskedKey?.toLowerCase().includes(q)
        if (!matchesName && !matchesPrefix && !matchesMasked) return false
      }
      if (modeFilter !== 'all' && k.mode !== modeFilter) return false
      if (statusFilter === 'active' && k.revoked) return false
      if (statusFilter === 'revoked' && !k.revoked) return false
      return true
    })
  }, [keys, search, modeFilter, statusFilter])

  // ─── Handlers ───────────────────────────────────────────────

  const handleCreateKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmedName = newKeyName.trim()
    if (!trimmedName) {
      setCreateError('Please give your API key a name (e.g. Shopify Store, Mobile App) to avoid confusion.')
      return
    }

    setCreating(true)
    setCreateError(null)

    try {
      const result = await createApiKey({
        name: trimmedName,
        mode: newKeyMode,
        permissions: newKeyPermissions,
      })

      setCreatedResult(result)
      setShowCreateModal(false)
      setShowCredentialsModal(true)
      setCopiedKey(false)
      setConfirmedSaved(false)

      // Reset form
      setNewKeyName('')
      setNewKeyMode('LIVE')
      setNewKeyPermissions({ read: true, write: true, refund: false })

      // Refresh list
      await fetchKeys()
    } catch (err: any) {
      setCreateError(err?.response?.data?.error || err?.message || 'Failed to create API key')
    } finally {
      setCreating(false)
    }
  }

  const handleCloseCredentialsModal = () => {
    if (!confirmedSaved) {
      if (!window.confirm('Are you sure? You will NOT be able to view this API key again. Make sure you have copied and saved it.')) {
        return
      }
    }
    setShowCredentialsModal(false)
    setCreatedResult(null)
  }

  const handleRevoke = async (key: ApiKeyItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to revoke "${key.name}"? Any website, application, or software using this key will immediately lose access.`
    )
    if (!confirmed) return

    setRevokingId(key.id)
    try {
      await revokeApiKeyById(key.id)
      setKeys((prev) =>
        prev.map((k) =>
          k.id === key.id
            ? { ...k, revoked: true, revokedAt: new Date().toISOString() }
            : k
        )
      )
    } catch (err: any) {
      alert(err?.response?.data?.error || err?.message || 'Failed to revoke API key')
    } finally {
      setRevokingId(null)
    }
  }

  const handleViewStats = async (key: ApiKeyItem) => {
    setStatsModalKey(key)
    setLoadingStats(true)
    setKeyStats(null)
    try {
      const stats = await getApiKeyStats(key.id)
      setKeyStats(stats)
    } catch {
      setKeyStats({
        ...key,
        ageDays: 0,
        averageRequestsPerDay: key.requestCount,
      })
    } finally {
      setLoadingStats(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    if (id === 'newKey') {
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    } else {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Never'
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
    <DashboardLayout pageTitle="API Keys">
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Keys</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create and manage named API keys for different websites, apps, and integrations.
            </p>
          </div>
          <button
            onClick={() => {
              setShowCreateModal(true)
              setCreateError(null)
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <Plus size={16} />
            Create API Key
          </button>
        </div>

        {/* ── Security Info & Webhooks Banner ── */}
        <div className="bg-amber-50 dark:bg-amber-500/[0.06] border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Key size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Keep your API keys secure</p>
              <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5">
                Never commit API keys to public repositories or expose them in client-side code. Use environment variables on your backend server.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/webhooks"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6] hover:text-[#7C3AED] dark:text-[#A78BFA] whitespace-nowrap self-start md:self-auto ml-7 md:ml-0 hover:underline"
          >
            <Webhook size={14} />
            Manage Webhook Secrets
          </Link>
        </div>

        {/* ── Filters & Search ── */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] flex-1 max-w-md">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by key name or prefix..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Filter */}
            <div className="flex items-center rounded-xl bg-gray-100 dark:bg-white/[0.04] p-1 border border-gray-200 dark:border-white/[0.06]">
              {(['all', 'LIVE', 'TEST'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModeFilter(m)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    modeFilter === m
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {m === 'all' ? 'All Modes' : m === 'LIVE' ? 'Live' : 'Test'}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center rounded-xl bg-gray-100 dark:bg-white/[0.04] p-1 border border-gray-200 dark:border-white/[0.06]">
              {(['all', 'active', 'revoked'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                    statusFilter === s
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={fetchKeys}
              title="Refresh keys"
              className="p-2.5 rounded-xl border border-gray-200 dark:border-white/[0.06] text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ── Keys Content ── */}
        {loading ? (
          <div className="p-16 text-center bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl">
            <Key size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3 animate-pulse" />
            <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Loading API keys...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-white dark:bg-gray-900/50 border border-red-200 dark:border-red-500/20 rounded-xl">
            <AlertTriangle size={32} className="mx-auto text-red-500 mb-3" />
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button
              onClick={fetchKeys}
              className="text-sm font-semibold text-[#8B5CF6] hover:underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : keys.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/10">
              <Key size={30} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              No API Keys Created Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              Create named API keys to connect your website, e-commerce store, mobile app, or backend services to FluxPay.
            </p>
            <button
              onClick={() => {
                setShowCreateModal(true)
                setCreateError(null)
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 cursor-pointer"
            >
              <Plus size={16} />
              Create Your First API Key
            </button>
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-xl p-12 text-center">
            <Search size={28} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No API keys match your search or filter</p>
            <button
              onClick={() => {
                setSearch('')
                setModeFilter('all')
                setStatusFilter('all')
              }}
              className="mt-3 text-xs text-[#8B5CF6] hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <th className="py-3.5 px-5">Name & Mode</th>
                    <th className="py-3.5 px-5">Key Identifier</th>
                    <th className="py-3.5 px-5">Permissions</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Created</th>
                    <th className="py-3.5 px-5">Last Used</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                  {filteredKeys.map((key) => {
                    const isRevoked = key.revoked
                    return (
                      <tr
                        key={key.id}
                        className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors ${
                          isRevoked ? 'opacity-60 bg-gray-50/30 dark:bg-white/[0.01]' : ''
                        }`}
                      >
                        {/* Name & Mode */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-xl flex-shrink-0 ${
                                isRevoked
                                  ? 'bg-gray-100 dark:bg-white/5 text-gray-400'
                                  : key.mode === 'LIVE'
                                  ? 'bg-purple-100 dark:bg-purple-500/10 text-[#8B5CF6]'
                                  : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              <Key size={16} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {key.name}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                    key.mode === 'LIVE'
                                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                                  }`}
                                >
                                  {key.mode}
                                </span>
                              </div>
                              <span className="text-[11px] text-gray-400 font-mono">
                                ID: {key.id.slice(0, 16)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Masked Key */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-md border border-gray-200 dark:border-white/10">
                              {key.maskedKey || `${key.keyPrefix}••••••••••••••••`}
                            </code>
                            <button
                              onClick={() => copyToClipboard(key.maskedKey || key.keyPrefix, key.id)}
                              title="Copy key prefix"
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                              {copiedId === key.id ? (
                                <Check size={14} className="text-emerald-500" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Permissions */}
                        <td className="py-4 px-5">
                          <div className="flex flex-wrap gap-1">
                            {key.permissions?.read && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                                read
                              </span>
                            )}
                            {key.permissions?.write && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium">
                                write
                              </span>
                            )}
                            {key.permissions?.refund && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
                                refund
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          {isRevoked ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                              <XCircle size={12} />
                              Revoked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Created */}
                        <td className="py-4 px-5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(key.createdAt)}
                        </td>

                        {/* Last Used */}
                        <td className="py-4 px-5">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {key.lastUsed ? formatDate(key.lastUsed) : 'Never used'}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {key.requestCount || 0} requests
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewStats(key)}
                              title="View API key details and stats"
                              className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                              <Activity size={14} />
                            </button>
                            {!isRevoked && (
                              <button
                                onClick={() => handleRevoke(key)}
                                disabled={revokingId === key.id}
                                title="Revoke this API key"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                <Trash2 size={13} />
                                Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Card View */}
            <div className="lg:hidden divide-y divide-gray-100 dark:divide-white/[0.04]">
              {filteredKeys.map((key) => {
                const isRevoked = key.revoked
                return (
                  <div key={key.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-xl ${
                            isRevoked
                              ? 'bg-gray-100 dark:bg-white/5 text-gray-400'
                              : key.mode === 'LIVE'
                              ? 'bg-purple-100 dark:bg-purple-500/10 text-[#8B5CF6]'
                              : 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          <Key size={16} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                            {key.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {formatDate(key.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            key.mode === 'LIVE'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {key.mode}
                        </span>
                        {isRevoked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                            REVOKED
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-white/[0.02] p-2.5 rounded-xl border border-gray-100 dark:border-white/[0.04]">
                      <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
                        {key.maskedKey || `${key.keyPrefix}••••••••••••••••`}
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.maskedKey || key.keyPrefix, key.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        {copiedId === key.id ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                      <span>Last used: {key.lastUsed ? formatDate(key.lastUsed) : 'Never'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewStats(key)}
                          className="text-[#8B5CF6] hover:underline text-xs"
                        >
                          Stats
                        </button>
                        {!isRevoked && (
                          <button
                            onClick={() => handleRevoke(key)}
                            disabled={revokingId === key.id}
                            className="text-red-500 hover:underline text-xs font-semibold"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Modal: Create API Key (with Name & Mode) ── */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-500/10 text-[#8B5CF6]">
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Create API Key
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Name this key to easily identify its usage across apps and websites.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateKey} className="p-6 space-y-5">
                {createError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/[0.08] border border-red-200 dark:border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                    <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                {/* API Key Name Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    API Key Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Shopify Store, Mobile App, Production Backend, WooCommerce"
                    value={newKeyName}
                    onChange={(e) => {
                      setNewKeyName(e.target.value)
                      if (createError) setCreateError(null)
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Give this API key a descriptive name so you always know which service or website it connects.
                  </p>
                </div>

                {/* Environment / Mode */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Environment Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewKeyMode('LIVE')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        newKeyMode === 'LIVE'
                          ? 'border-[#8B5CF6] bg-purple-50/50 dark:bg-purple-500/10 ring-2 ring-[#8B5CF6]/20'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">Live Mode</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold">
                          sk_live_
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Processes real Solana payments
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewKeyMode('TEST')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        newKeyMode === 'TEST'
                          ? 'border-[#8B5CF6] bg-purple-50/50 dark:bg-purple-500/10 ring-2 ring-[#8B5CF6]/20'
                          : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">Test Mode</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-semibold">
                          sk_test_
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        For sandbox testing and dev
                      </p>
                    </button>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2 bg-gray-50 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-200 dark:border-white/[0.06]">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.read}
                        onChange={(e) =>
                          setNewKeyPermissions({ ...newKeyPermissions, read: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                      />
                      <div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          Read Access
                        </span>
                        <p className="text-[11px] text-gray-400">
                          View payments, invoices, balances, and transaction history
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.write}
                        onChange={(e) =>
                          setNewKeyPermissions({ ...newKeyPermissions, write: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                      />
                      <div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          Write Access
                        </span>
                        <p className="text-[11px] text-gray-400">
                          Create charges, invoices, and payment checkout links
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.refund}
                        onChange={(e) =>
                          setNewKeyPermissions({ ...newKeyPermissions, refund: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                      />
                      <div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          Refund Access
                        </span>
                        <p className="text-[11px] text-gray-400">
                          Issue programmatic refunds directly to customer wallets
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newKeyName.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-purple-500/20 cursor-pointer"
                  >
                    {creating ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Creating Key...
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        Create API Key
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Modal: Credentials Reveal (Shown ONCE right after generation) ── */}
        {showCredentialsModal && createdResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {createdResult.name}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      {createdResult.mode}
                    </span>
                  </h3>
                  <p className="text-xs text-red-500 font-semibold mt-0.5">
                    ⚠️ Copy and save this API key now. It will NEVER be shown again!
                  </p>
                </div>
              </div>

              {/* Full Key */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Key size={12} /> Secret API Key
                  </span>
                  <span className="text-[10px] text-gray-400">Keep this confidential</span>
                </label>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-white/5 px-3.5 py-2.5 rounded-xl flex-1 break-all border border-gray-200 dark:border-white/10 select-all">
                    {createdResult.key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(createdResult.key, 'newKey')}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      copiedKey
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {copiedKey ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                {copiedKey && (
                  <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Copied to clipboard!
                  </p>
                )}
              </div>

              {/* .env Snippet */}
              <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl p-3.5">
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Environment Variable Example (.env):
                </p>
                <code className="text-xs font-mono text-gray-800 dark:text-gray-200 block break-all">
                  FLUXPAY_API_KEY=&quot;{createdResult.key}&quot;
                </code>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer select-none bg-amber-50/50 dark:bg-amber-500/[0.04] p-3 rounded-xl border border-amber-200/60 dark:border-amber-500/10">
                <input
                  type="checkbox"
                  checked={confirmedSaved}
                  onChange={(e) => setConfirmedSaved(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#8B5CF6] focus:ring-[#8B5CF6]"
                />
                <span className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  I have copied and saved this API key in a secure location. I understand that I cannot view it again after closing this window.
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
                {confirmedSaved ? 'Done — Key Saved' : 'Confirm checkbox to continue'}
              </button>
            </div>
          </div>
        )}

        {/* ── Modal: API Key Stats / Details ── */}
        {statsModalKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/[0.06]">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {statsModalKey.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {statsModalKey.maskedKey || `${statsModalKey.keyPrefix}••••••••••••••••`}
                  </p>
                </div>
                <button
                  onClick={() => setStatsModalKey(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <X size={16} />
                </button>
              </div>

              {loadingStats ? (
                <div className="py-8 text-center text-xs text-gray-400 animate-pulse">
                  Loading statistics...
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Requests</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                        {keyStats?.requestCount || statsModalKey.requestCount || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Environment</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                        {statsModalKey.mode}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-gray-800 dark:text-gray-200">{formatDate(statsModalKey.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Used:</span>
                      <span className="text-gray-800 dark:text-gray-200">{formatDate(statsModalKey.lastUsed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last IP Address:</span>
                      <span className="font-mono text-gray-800 dark:text-gray-200">
                        {keyStats?.lastIp || statsModalKey.lastIp || 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-semibold ${statsModalKey.revoked ? 'text-red-500' : 'text-emerald-500'}`}>
                        {statsModalKey.revoked ? 'Revoked' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStatsModalKey(null)}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
