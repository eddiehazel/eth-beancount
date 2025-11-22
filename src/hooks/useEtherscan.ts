import { useState, useCallback } from 'react'
import type { AddressData, FetchResult, TransactionStats } from '../types'
import { fetchAllAddresses, fetchAddressData } from '../services/etherscan'
import { parseAddresses } from '../utils/address'

interface UseEtherscanReturn {
  isLoading: boolean
  progress: { completed: number; total: number }
  addressData: Map<string, AddressData>
  failedAddresses: Map<string, { address: string; nickname?: string; error: string }>
  stats: TransactionStats
  fetchAddresses: (addresses: string, apiKey: string) => Promise<void>
  retryAddress: (address: string, nickname: string | undefined, apiKey: string) => Promise<void>
  clearData: () => void
}

export function useEtherscan(): UseEtherscanReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [addressData, setAddressData] = useState<Map<string, AddressData>>(
    new Map()
  )
  const [failedAddresses, setFailedAddresses] = useState<
    Map<string, { address: string; nickname?: string; error: string }>
  >(new Map())

  // Calculate stats from current data
  const calculateStats = useCallback(
    (data: Map<string, AddressData>): TransactionStats => {
      let totalTransactions = 0
      let ethTransfers = 0
      let tokenTransfers = 0
      let failedTransactions = 0

      for (const [, addressInfo] of data) {
        totalTransactions +=
          addressInfo.transactions.length +
          addressInfo.tokenTransactions.length
        ethTransfers += addressInfo.transactions.length
        tokenTransfers += addressInfo.tokenTransactions.length
        failedTransactions += addressInfo.transactions.filter(
          (tx) => tx.isError === '1'
        ).length
      }

      return {
        totalTransactions,
        ethTransfers,
        tokenTransfers,
        failedTransactions,
      }
    },
    []
  )

  const stats = calculateStats(addressData)

  const fetchAddressesFn = useCallback(
    async (addresses: string, apiKey: string) => {
      const parsed = parseAddresses(addresses)

      if (parsed.length === 0) {
        return
      }

      setIsLoading(true)
      setProgress({ completed: 0, total: parsed.length })
      setAddressData(new Map())
      setFailedAddresses(new Map())

      try {
        const { successful, failed } = await fetchAllAddresses(
          parsed,
          apiKey || undefined,
          (completed, total) => setProgress({ completed, total })
        )

        setAddressData(successful)
        setFailedAddresses(failed)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const retryAddress = useCallback(
    async (address: string, nickname: string | undefined, apiKey: string) => {
      setIsLoading(true)

      try {
        const result: FetchResult = await fetchAddressData(
          address,
          nickname,
          apiKey || undefined
        )

        if (result.success && result.data) {
          setAddressData((prev) => {
            const next = new Map(prev)
            next.set(address.toLowerCase(), result.data!)
            return next
          })
          setFailedAddresses((prev) => {
            const next = new Map(prev)
            next.delete(address.toLowerCase())
            return next
          })
        } else {
          setFailedAddresses((prev) => {
            const next = new Map(prev)
            next.set(address.toLowerCase(), {
              address,
              nickname,
              error: result.error || 'Unknown error',
            })
            return next
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const clearData = useCallback(() => {
    setAddressData(new Map())
    setFailedAddresses(new Map())
    setProgress({ completed: 0, total: 0 })
  }, [])

  return {
    isLoading,
    progress,
    addressData,
    failedAddresses,
    stats,
    fetchAddresses: fetchAddressesFn,
    retryAddress,
    clearData,
  }
}
