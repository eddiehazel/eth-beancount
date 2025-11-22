import { useState, useCallback, useMemo } from 'react'
import { Header } from './components/Header'
import { AddressInput } from './components/AddressInput'
import { ApiKeyInput } from './components/ApiKeyInput'
import { StatusMessage } from './components/StatusMessage'
import { LoadingSpinner } from './components/LoadingSpinner'
import { Statistics } from './components/Statistics'
import { FailedRequests } from './components/FailedRequests'
import { OutputDisplay } from './components/OutputDisplay'
import { ActionButtons } from './components/ActionButtons'
import { useLocalStorageString } from './hooks/useLocalStorage'
import { useEtherscan } from './hooks/useEtherscan'
import { parseAddresses } from './utils/address'
import { generateBeancountOutput } from './utils/beancount'
import type { StatusMessage as StatusMessageType } from './types'
import './App.css'

function App() {
  // Persistent state (localStorage)
  const [addresses, setAddresses, clearAddresses] = useLocalStorageString(
    'eth-beancount-addresses',
    ''
  )
  const [apiKey, setApiKey, clearApiKey] = useLocalStorageString(
    'eth-beancount-apikey',
    ''
  )

  // Etherscan data
  const {
    isLoading,
    progress,
    addressData,
    failedAddresses,
    stats,
    fetchAddresses,
    retryAddress,
    clearData,
  } = useEtherscan()

  // Local state
  const [status, setStatus] = useState<StatusMessageType | null>(null)

  // Generate output from address data
  const output = useMemo(() => {
    if (addressData.size === 0) return ''

    // Build nicknames map from parsed addresses and address data
    const nicknames = new Map<string, string>()
    const parsed = parseAddresses(addresses)
    for (const { address, nickname } of parsed) {
      if (nickname) {
        nicknames.set(address.toLowerCase(), nickname)
      }
    }
    // Also include nicknames from addressData
    for (const [addr, data] of addressData) {
      if (data.nickname && !nicknames.has(addr)) {
        nicknames.set(addr, data.nickname)
      }
    }

    return generateBeancountOutput(addressData, nicknames)
  }, [addressData, addresses])

  // Check if addresses are provided
  const hasAddresses = useMemo(() => {
    return parseAddresses(addresses).length > 0
  }, [addresses])

  // Fetch transactions handler
  const handleFetch = useCallback(async () => {
    const parsed = parseAddresses(addresses)

    if (parsed.length === 0) {
      setStatus({
        type: 'error',
        message: 'Please enter at least one valid Ethereum address',
      })
      return
    }

    setStatus({ type: 'info', message: 'Fetching transactions...' })

    try {
      await fetchAddresses(addresses, apiKey)
      setStatus({ type: 'success', message: 'Transactions fetched successfully!' })
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Failed to fetch transactions',
      })
    }
  }, [addresses, apiKey, fetchAddresses])

  // Retry failed address handler
  const handleRetry = useCallback(
    async (address: string, nickname: string | undefined) => {
      setStatus({ type: 'info', message: `Retrying ${nickname || address}...` })
      try {
        await retryAddress(address, nickname, apiKey)
        setStatus({ type: 'success', message: 'Retry successful!' })
      } catch (error) {
        setStatus({
          type: 'error',
          message:
            error instanceof Error ? error.message : 'Retry failed',
        })
      }
    },
    [apiKey, retryAddress]
  )

  // Clear output handler
  const handleClear = useCallback(() => {
    clearData()
    setStatus(null)
  }, [clearData])

  // Clear saved data handler
  const handleClearSavedData = useCallback(() => {
    clearAddresses()
    clearApiKey()
    clearData()
    setStatus({ type: 'info', message: 'Saved data cleared' })
  }, [clearAddresses, clearApiKey, clearData])

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <section className="input-section">
          <AddressInput
            value={addresses}
            onChange={setAddresses}
            disabled={isLoading}
          />
          <ApiKeyInput
            value={apiKey}
            onChange={setApiKey}
            disabled={isLoading}
          />
        </section>

        <ActionButtons
          onFetch={handleFetch}
          onClear={handleClear}
          onClearSavedData={handleClearSavedData}
          hasOutput={output.length > 0}
          output={output}
          isLoading={isLoading}
          hasAddresses={hasAddresses}
        />

        <StatusMessage status={status} />

        {isLoading && <LoadingSpinner progress={progress} />}

        <FailedRequests
          failedAddresses={failedAddresses}
          onRetry={handleRetry}
          disabled={isLoading}
        />

        <Statistics stats={stats} />

        <OutputDisplay output={output} />
      </main>

      <footer className="footer">
        <p>
          Data provided by{' '}
          <a
            href="https://etherscan.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Etherscan
          </a>
          . All processing happens client-side.
        </p>
      </footer>
    </div>
  )
}

export default App
