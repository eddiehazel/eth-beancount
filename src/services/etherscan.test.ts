import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchTransactions,
  fetchTokenTransfers,
  fetchAddressData,
} from './etherscan'

describe('Etherscan Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('fetchTransactions', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions = [
        {
          hash: '0xabc123',
          from: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
          to: '0x1234567890123456789012345678901234567890',
          value: '1000000000000000000',
          timeStamp: '1704067200',
          blockNumber: '12345',
          gas: '21000',
          gasPrice: '50000000000',
          gasUsed: '21000',
          isError: '0',
          txreceipt_status: '1',
          input: '0x',
          contractAddress: '',
          cumulativeGasUsed: '21000',
          confirmations: '100',
          methodId: '0x',
          functionName: '',
        },
      ]

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          message: 'OK',
          result: mockTransactions,
        }),
      } as Response)

      const result = await fetchTransactions(
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678'
      )

      expect(result).toHaveLength(1)
      expect(result[0].hash).toBe('0xabc123')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should return empty array when no transactions found', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '0',
          message: 'No transactions found',
          result: [],
        }),
      } as Response)

      const result = await fetchTransactions(
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678'
      )

      expect(result).toHaveLength(0)
    })

    it('should throw error on API error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '0',
          message: 'NOTOK',
          result: 'Invalid API Key',
        }),
      } as Response)

      await expect(
        fetchTransactions('0x742d35cc6634c0532925a3b844bc9e7595f2e678')
      ).rejects.toThrow('Invalid API Key')
    })

    // Note: Retry logic is tested implicitly through the fetchAddressData tests
    // A full retry test would require mocking setTimeout or longer test timeout
  })

  describe('fetchTokenTransfers', () => {
    it('should fetch token transfers successfully', async () => {
      const mockTokenTransfers = [
        {
          hash: '0xtoken123',
          from: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
          to: '0x1234567890123456789012345678901234567890',
          value: '1000000',
          tokenName: 'USD Coin',
          tokenSymbol: 'USDC',
          tokenDecimal: '6',
          timeStamp: '1704067200',
          blockNumber: '12345',
          contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          gas: '60000',
          gasPrice: '50000000000',
          gasUsed: '55000',
        },
      ]

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: '1',
          message: 'OK',
          result: mockTokenTransfers,
        }),
      } as Response)

      const result = await fetchTokenTransfers(
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678'
      )

      expect(result).toHaveLength(1)
      expect(result[0].tokenSymbol).toBe('USDC')
    })
  })

  describe('fetchAddressData', () => {
    it('should fetch both transactions and token transfers', async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: '1',
            message: 'OK',
            result: [{ hash: '0xeth' }],
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: '1',
            message: 'OK',
            result: [{ hash: '0xtoken' }],
          }),
        } as Response)

      const resultPromise = fetchAddressData(
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
        'mywallet'
      )

      // Advance through the delay between API calls
      await vi.advanceTimersByTimeAsync(300)

      const result = await resultPromise

      expect(result.success).toBe(true)
      expect(result.data?.nickname).toBe('mywallet')
      expect(result.data?.transactions).toHaveLength(1)
      expect(result.data?.tokenTransactions).toHaveLength(1)
    })

    it('should return error on failure', async () => {
      // Mock all retries to fail
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'))

      const resultPromise = fetchAddressData(
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
        undefined
      )

      // Advance through all retry delays
      await vi.advanceTimersByTimeAsync(1000)
      await vi.advanceTimersByTimeAsync(2000)
      await vi.advanceTimersByTimeAsync(4000)

      const result = await resultPromise

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })
})
