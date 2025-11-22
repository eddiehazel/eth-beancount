import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildEthTransactionsUrl, buildTokenTransactionsUrl, delay } from './etherscan'
import { API_CONFIG } from '@/types'

describe('buildEthTransactionsUrl', () => {
  it('builds correct URL with API key', () => {
    const url = buildEthTransactionsUrl('0x123', 'myApiKey')
    expect(url).toContain(API_CONFIG.BASE_URL)
    expect(url).toContain('module=account')
    expect(url).toContain('action=txlist')
    expect(url).toContain('address=0x123')
    expect(url).toContain('apikey=myApiKey')
    expect(url).toContain(`chainid=${API_CONFIG.CHAIN_ID}`)
  })

  it('uses default API key when none provided', () => {
    const url = buildEthTransactionsUrl('0x123', '')
    expect(url).toContain(`apikey=${API_CONFIG.DEFAULT_API_KEY}`)
  })

  it('includes all required parameters', () => {
    const url = buildEthTransactionsUrl('0x123', 'key')
    expect(url).toContain('startblock=0')
    expect(url).toContain('endblock=99999999')
    expect(url).toContain('sort=asc')
  })
})

describe('buildTokenTransactionsUrl', () => {
  it('builds correct URL with API key', () => {
    const url = buildTokenTransactionsUrl('0x123', 'myApiKey')
    expect(url).toContain(API_CONFIG.BASE_URL)
    expect(url).toContain('module=account')
    expect(url).toContain('action=tokentx')
    expect(url).toContain('address=0x123')
    expect(url).toContain('apikey=myApiKey')
  })

  it('uses default API key when none provided', () => {
    const url = buildTokenTransactionsUrl('0x123', '')
    expect(url).toContain(`apikey=${API_CONFIG.DEFAULT_API_KEY}`)
  })
})

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('delays for specified milliseconds', async () => {
    const promise = delay(1000)
    vi.advanceTimersByTime(1000)
    await promise
    // If we get here, the delay worked
    expect(true).toBe(true)
  })

  it('resolves after time passes', async () => {
    let resolved = false
    delay(500).then(() => {
      resolved = true
    })

    expect(resolved).toBe(false)
    vi.advanceTimersByTime(500)
    await Promise.resolve() // Allow microtasks to run
    expect(resolved).toBe(true)
  })
})

// Integration tests would require mocking fetch
describe('fetchEthTransactions', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('handles successful response', async () => {
    const mockResponse = {
      status: '1',
      message: 'OK',
      result: [
        {
          hash: '0xabc',
          blockNumber: '1',
          timeStamp: '1609459200',
          from: '0x123',
          to: '0x456',
          value: '1000000000000000000',
          gasUsed: '21000',
          gasPrice: '20000000000',
          isError: '0',
        },
      ],
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const { fetchEthTransactions } = await import('./etherscan')
    const result = await fetchEthTransactions('0x123', 'key')

    expect(result).toHaveLength(1)
    expect(result[0].hash).toBe('0xabc')
  })

  it('handles no transactions found', async () => {
    const mockResponse = {
      status: '0',
      message: 'No transactions found',
      result: [],
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const { fetchEthTransactions } = await import('./etherscan')
    const result = await fetchEthTransactions('0x123', 'key')

    expect(result).toHaveLength(0)
  })

  it('throws on API error', async () => {
    const mockResponse = {
      status: '0',
      message: 'Rate limit exceeded',
      result: 'Max rate limit reached',
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const { fetchEthTransactions } = await import('./etherscan')
    await expect(fetchEthTransactions('0x123', 'key')).rejects.toThrow('Rate limit exceeded')
  })
})

describe('fetchTokenTransactions', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('handles successful response', async () => {
    const mockResponse = {
      status: '1',
      message: 'OK',
      result: [
        {
          hash: '0xdef',
          blockNumber: '2',
          timeStamp: '1609459300',
          from: '0x123',
          to: '0x456',
          value: '1000000',
          contractAddress: '0xtoken',
          tokenName: 'Test Token',
          tokenSymbol: 'TEST',
          tokenDecimal: '6',
        },
      ],
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const { fetchTokenTransactions } = await import('./etherscan')
    const result = await fetchTokenTransactions('0x123', 'key')

    expect(result).toHaveLength(1)
    expect(result[0].tokenSymbol).toBe('TEST')
  })
})
