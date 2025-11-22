'use client'

import { useState, useCallback } from 'react'
import type {
  AddressTransactionData,
  FailedAddress,
  FetchProgress,
  TransactionStats,
  ParsedAddress,
} from '@/types'
import { API_CONFIG } from '@/types'
import { fetchAllTransactions, delay } from '@/lib/etherscan'
import { normalizeAddress } from '@/lib/sanitize'

export interface UseTransactionFetcherReturn {
  isLoading: boolean
  progress: FetchProgress | null
  addressData: Map<string, AddressTransactionData>
  failedAddresses: FailedAddress[]
  stats: TransactionStats | null
  fetchAddresses: (addresses: ParsedAddress[], apiKey: string) => Promise<void>
  retryAddress: (address: string, apiKey: string) => Promise<void>
  reset: () => void
}

/**
 * Hook for fetching Ethereum transactions
 */
export function useTransactionFetcher(): UseTransactionFetcherReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<FetchProgress | null>(null)
  const [addressData, setAddressData] = useState<Map<string, AddressTransactionData>>(new Map())
  const [failedAddresses, setFailedAddresses] = useState<FailedAddress[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)

  const calculateStats = useCallback(
    (
      data: Map<string, AddressTransactionData>,
      failed: FailedAddress[]
    ): TransactionStats => {
      let totalEthTransactions = 0
      let totalTokenTransactions = 0

      for (const addressData of data.values()) {
        totalEthTransactions += addressData.transactions.length
        totalTokenTransactions += addressData.tokenTransactions.length
      }

      return {
        totalAddresses: data.size,
        totalEthTransactions,
        totalTokenTransactions,
        failedAddresses: failed.length,
      }
    },
    []
  )

  const fetchSingleAddress = useCallback(
    async (
      parsedAddress: ParsedAddress,
      apiKey: string
    ): Promise<{ success: boolean; data?: AddressTransactionData; error?: string }> => {
      try {
        const { ethTransactions, tokenTransactions } = await fetchAllTransactions(
          parsedAddress.address,
          apiKey
        )

        return {
          success: true,
          data: {
            address: parsedAddress.address,
            nickname: parsedAddress.nickname,
            transactions: ethTransactions,
            tokenTransactions,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
    []
  )

  const fetchAddresses = useCallback(
    async (addresses: ParsedAddress[], apiKey: string) => {
      if (addresses.length === 0) return

      setIsLoading(true)
      setProgress({ current: 0, total: addresses.length })
      setAddressData(new Map())
      setFailedAddresses([])
      setStats(null)

      const newAddressData = new Map<string, AddressTransactionData>()
      const newFailedAddresses: FailedAddress[] = []

      for (let i = 0; i < addresses.length; i++) {
        const parsedAddress = addresses[i]

        setProgress({
          current: i + 1,
          total: addresses.length,
          currentAddress: parsedAddress.nickname || parsedAddress.address,
        })

        const result = await fetchSingleAddress(parsedAddress, apiKey)

        if (result.success && result.data) {
          newAddressData.set(normalizeAddress(parsedAddress.address), result.data)
        } else {
          newFailedAddresses.push({
            address: parsedAddress.address,
            nickname: parsedAddress.nickname,
            error: result.error || 'Unknown error',
          })
        }

        // Delay between addresses to avoid rate limiting
        if (i < addresses.length - 1) {
          await delay(API_CONFIG.REQUEST_DELAY_MS)
        }
      }

      setAddressData(newAddressData)
      setFailedAddresses(newFailedAddresses)
      setStats(calculateStats(newAddressData, newFailedAddresses))
      setProgress(null)
      setIsLoading(false)
    },
    [fetchSingleAddress, calculateStats]
  )

  const retryAddress = useCallback(
    async (address: string, apiKey: string) => {
      const failedEntry = failedAddresses.find(
        (f) => normalizeAddress(f.address) === normalizeAddress(address)
      )

      if (!failedEntry) return

      setIsLoading(true)

      const result = await fetchSingleAddress(
        { address: failedEntry.address, nickname: failedEntry.nickname },
        apiKey
      )

      if (result.success && result.data) {
        const newAddressData = new Map(addressData)
        newAddressData.set(normalizeAddress(address), result.data)
        setAddressData(newAddressData)

        const newFailedAddresses = failedAddresses.filter(
          (f) => normalizeAddress(f.address) !== normalizeAddress(address)
        )
        setFailedAddresses(newFailedAddresses)
        setStats(calculateStats(newAddressData, newFailedAddresses))
      }

      setIsLoading(false)
    },
    [addressData, failedAddresses, fetchSingleAddress, calculateStats]
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setProgress(null)
    setAddressData(new Map())
    setFailedAddresses([])
    setStats(null)
  }, [])

  return {
    isLoading,
    progress,
    addressData,
    failedAddresses,
    stats,
    fetchAddresses,
    retryAddress,
    reset,
  }
}
