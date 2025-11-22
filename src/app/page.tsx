'use client'

import { useCallback, useMemo, useState } from 'react'
import { STORAGE_KEYS } from '@/types'
import { useLocalStorageString, useTransactionFetcher } from '@/hooks'
import { parseAddresses, generateBeancountOutput } from '@/lib'
import {
  AddressInput,
  ApiKeyInput,
  BeancountOutput,
  FailedRequests,
  Progress,
  Statistics,
  Button,
  StatusMessage,
} from '@/components'

export default function Home() {
  const [addresses, setAddresses, clearAddresses] = useLocalStorageString(
    STORAGE_KEYS.ADDRESSES,
    ''
  )
  const [apiKey, setApiKey, clearApiKey] = useLocalStorageString(STORAGE_KEYS.API_KEY, '')
  const [status, setStatus] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)

  const {
    isLoading,
    progress,
    addressData,
    failedAddresses,
    stats,
    fetchAddresses,
    retryAddress,
    reset,
  } = useTransactionFetcher()

  const parsedAddresses = useMemo(() => parseAddresses(addresses), [addresses])

  const output = useMemo(() => {
    if (addressData.size === 0) return ''
    return generateBeancountOutput(addressData)
  }, [addressData])

  const handleFetch = useCallback(async () => {
    setStatus(null)

    if (parsedAddresses.length === 0) {
      setStatus({ message: 'Please enter at least one valid Ethereum address', type: 'error' })
      return
    }

    setStatus({
      message: `Fetching transactions for ${parsedAddresses.length} address(es)...`,
      type: 'info',
    })

    try {
      await fetchAddresses(parsedAddresses, apiKey)
      setStatus({ message: 'Successfully fetched transactions!', type: 'success' })
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        type: 'error',
      })
    }
  }, [parsedAddresses, apiKey, fetchAddresses])

  const handleRetry = useCallback(
    async (address: string) => {
      setStatus({ message: `Retrying ${address}...`, type: 'info' })
      try {
        await retryAddress(address, apiKey)
        setStatus({ message: 'Retry successful!', type: 'success' })
      } catch (error) {
        setStatus({
          message: error instanceof Error ? error.message : 'Retry failed',
          type: 'error',
        })
      }
    },
    [apiKey, retryAddress]
  )

  const handleClear = useCallback(() => {
    reset()
    setStatus(null)
  }, [reset])

  const handleLogout = useCallback(() => {
    clearAddresses()
    clearApiKey()
    reset()
    setStatus({ message: 'Cleared all saved data', type: 'info' })
  }, [clearAddresses, clearApiKey, reset])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <AddressInput value={addresses} onChange={setAddresses} disabled={isLoading} />

        <ApiKeyInput value={apiKey} onChange={setApiKey} disabled={isLoading} />

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleFetch} isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Fetching...' : 'Fetch Transactions'}
          </Button>

          <Button variant="secondary" onClick={handleClear} disabled={isLoading}>
            Clear Output
          </Button>

          <Button variant="danger" onClick={handleLogout} disabled={isLoading}>
            Clear All Data
          </Button>
        </div>

        {parsedAddresses.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {parsedAddresses.length} valid address(es) detected
          </p>
        )}
      </div>

      {/* Status Message */}
      {status && (
        <StatusMessage
          message={status.message}
          type={status.type}
          onDismiss={() => setStatus(null)}
        />
      )}

      {/* Progress */}
      {progress && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <Progress progress={progress} />
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Results
          </h3>
          <Statistics stats={stats} />
        </div>
      )}

      {/* Failed Requests */}
      {failedAddresses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <FailedRequests
            failedAddresses={failedAddresses}
            onRetry={handleRetry}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Beancount Output */}
      {output && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <BeancountOutput output={output} />
        </div>
      )}
    </div>
  )
}
