import { describe, it, expect } from 'vitest'
import {
  formatDate,
  weiToEth,
  formatTokenValue,
  calculateGasCost,
  getAccountName,
  getTokenAccountName,
  getExternalAccountName,
  isUserAddress,
  collectCommodities,
  generateBeancountOutput,
} from './beancount'
import type { AddressTransactionData, TokenTransaction } from '@/types'

describe('formatDate', () => {
  it('formats Unix timestamp to YYYY-MM-DD', () => {
    // 1609459200 = 2021-01-01 00:00:00 UTC
    expect(formatDate('1609459200')).toBe('2021-01-01')
  })

  it('handles numeric input', () => {
    expect(formatDate(1609459200)).toBe('2021-01-01')
  })

  it('formats different dates correctly', () => {
    // 1704067200 = 2024-01-01 00:00:00 UTC
    expect(formatDate('1704067200')).toBe('2024-01-01')
  })
})

describe('weiToEth', () => {
  it('converts 1 ETH', () => {
    expect(weiToEth('1000000000000000000')).toBe('1')
  })

  it('converts 0 ETH', () => {
    expect(weiToEth('0')).toBe('0')
  })

  it('converts fractional ETH', () => {
    expect(weiToEth('500000000000000000')).toBe('0.5')
  })

  it('converts small amounts', () => {
    expect(weiToEth('1000000000000000')).toBe('0.001')
  })

  it('handles large amounts', () => {
    expect(weiToEth('100000000000000000000')).toBe('100')
  })
})

describe('formatTokenValue', () => {
  it('handles 18 decimals', () => {
    expect(formatTokenValue('1000000000000000000', '18')).toBe('1')
  })

  it('handles 6 decimals (USDC)', () => {
    expect(formatTokenValue('1000000', '6')).toBe('1')
  })

  it('handles 0 decimals', () => {
    expect(formatTokenValue('100', '0')).toBe('100')
  })

  it('handles fractional values', () => {
    expect(formatTokenValue('1500000', '6')).toBe('1.5')
  })

  it('removes trailing zeros', () => {
    expect(formatTokenValue('1000000000000000000', '18')).toBe('1')
    expect(formatTokenValue('1100000000000000000', '18')).toBe('1.1')
  })
})

describe('calculateGasCost', () => {
  it('calculates gas cost correctly', () => {
    // 21000 gas * 20 gwei = 420000 gwei = 0.00042 ETH
    const result = calculateGasCost('21000', '20000000000')
    expect(result).toBe('0.00042')
  })

  it('handles zero gas', () => {
    expect(calculateGasCost('0', '20000000000')).toBe('0')
  })
})

describe('getAccountName', () => {
  const addressNicknames = new Map<string, string>()

  it('generates account name without nickname', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    const result = getAccountName(address, addressNicknames)
    expect(result).toBe('Assets:Crypto:Ethereum:345678')
  })

  it('generates account name with nickname', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    const nicknames = new Map([['0x1234567890abcdef1234567890abcdef12345678', 'MyWallet']])
    const result = getAccountName(address, nicknames)
    expect(result).toBe('Assets:Crypto:Ethereum:MyWallet:345678')
  })

  it('uses custom prefix', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    const result = getAccountName(address, addressNicknames, 'Assets:Custom')
    expect(result).toBe('Assets:Custom:345678')
  })
})

describe('getTokenAccountName', () => {
  it('generates token account name without nickname', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    const result = getTokenAccountName(address, 'USDC', new Map())
    expect(result).toBe('Assets:Crypto:Tokens:USDC:345678')
  })

  it('generates token account name with nickname', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    const nicknames = new Map([['0x1234567890abcdef1234567890abcdef12345678', 'MyWallet']])
    const result = getTokenAccountName(address, 'USDC', nicknames)
    expect(result).toBe('Assets:Crypto:Tokens:USDC:MyWallet:345678')
  })

  it('sanitizes token symbol', () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678'
    const result = getTokenAccountName(address, 'usdc$', new Map())
    expect(result).toBe('Assets:Crypto:Tokens:USDC:345678')
  })
})

describe('getExternalAccountName', () => {
  it('generates external account name', () => {
    const address = '0xabcdef1234567890abcdef1234567890abcdef12'
    const result = getExternalAccountName(address)
    // Last 6 chars of address: bcdef12 -> CDEF12
    expect(result).toBe('Assets:Crypto:External:CDEF12')
  })
})

describe('isUserAddress', () => {
  it('returns true for user address', () => {
    const userAddresses = new Set(['0x1234567890abcdef1234567890abcdef12345678'])
    expect(isUserAddress('0x1234567890abcdef1234567890abcdef12345678', userAddresses)).toBe(true)
  })

  it('returns true for mixed case user address', () => {
    const userAddresses = new Set(['0x1234567890abcdef1234567890abcdef12345678'])
    expect(isUserAddress('0x1234567890ABCDEF1234567890ABCDEF12345678', userAddresses)).toBe(true)
  })

  it('returns false for non-user address', () => {
    const userAddresses = new Set(['0x1234567890abcdef1234567890abcdef12345678'])
    expect(isUserAddress('0xabcdef1234567890abcdef1234567890abcdef12', userAddresses)).toBe(false)
  })
})

describe('collectCommodities', () => {
  it('collects unique token commodities', () => {
    const addressDataMap = new Map<string, AddressTransactionData>([
      [
        '0x1234567890abcdef1234567890abcdef12345678',
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          transactions: [],
          tokenTransactions: [
            {
              hash: '0x123',
              blockNumber: '1',
              timeStamp: '1609459200',
              from: '0x1234567890abcdef1234567890abcdef12345678',
              to: '0xabcdef1234567890abcdef1234567890abcdef12',
              value: '1000000',
              contractAddress: '0xtoken1',
              tokenName: 'USD Coin',
              tokenSymbol: 'USDC',
              tokenDecimal: '6',
            } as TokenTransaction,
          ],
        },
      ],
    ])

    const commodities = collectCommodities(addressDataMap)
    expect(commodities).toHaveLength(1)
    expect(commodities[0].symbol).toBe('USDC')
    expect(commodities[0].name).toBe('USD Coin')
    expect(commodities[0].contractAddress).toBe('0xtoken1')
  })

  it('deduplicates commodities by symbol', () => {
    const addressDataMap = new Map<string, AddressTransactionData>([
      [
        '0x1234567890abcdef1234567890abcdef12345678',
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          transactions: [],
          tokenTransactions: [
            {
              hash: '0x123',
              blockNumber: '1',
              timeStamp: '1609459200',
              from: '0x1234567890abcdef1234567890abcdef12345678',
              to: '0xabcdef1234567890abcdef1234567890abcdef12',
              value: '1000000',
              contractAddress: '0xtoken1',
              tokenName: 'USD Coin',
              tokenSymbol: 'USDC',
              tokenDecimal: '6',
            } as TokenTransaction,
            {
              hash: '0x456',
              blockNumber: '2',
              timeStamp: '1609459300',
              from: '0xabcdef1234567890abcdef1234567890abcdef12',
              to: '0x1234567890abcdef1234567890abcdef12345678',
              value: '2000000',
              contractAddress: '0xtoken1',
              tokenName: 'USD Coin',
              tokenSymbol: 'USDC',
              tokenDecimal: '6',
            } as TokenTransaction,
          ],
        },
      ],
    ])

    const commodities = collectCommodities(addressDataMap)
    expect(commodities).toHaveLength(1)
  })
})

describe('generateBeancountOutput', () => {
  it('generates complete output for single address', () => {
    const addressDataMap = new Map<string, AddressTransactionData>([
      [
        '0x1234567890abcdef1234567890abcdef12345678',
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          nickname: 'MyWallet',
          transactions: [
            {
              hash: '0xabc',
              blockNumber: '1',
              timeStamp: '1609459200',
              from: '0x1234567890abcdef1234567890abcdef12345678',
              to: '0xabcdef1234567890abcdef1234567890abcdef12',
              value: '1000000000000000000',
              gasUsed: '21000',
              gasPrice: '20000000000',
              isError: '0',
            },
          ],
          tokenTransactions: [],
        },
      ],
    ])

    const output = generateBeancountOutput(addressDataMap)

    // Check header
    expect(output).toContain('; Ethereum Beancount Export')
    expect(output).toContain('MyWallet')

    // Check commodity
    expect(output).toContain('commodity ETH')

    // Check accounts
    expect(output).toContain('open Assets:Crypto:Ethereum:MyWallet:345678')
    expect(output).toContain('open Expenses:Crypto:GasFees')

    // Check transaction
    expect(output).toContain('2021-01-01')
    expect(output).toContain('ETH Transfer')
    expect(output).toContain('-1 ETH')
  })

  it('handles empty data', () => {
    const addressDataMap = new Map<string, AddressTransactionData>()
    const output = generateBeancountOutput(addressDataMap)
    expect(output).toContain('; Ethereum Beancount Export')
  })

  it('marks failed transactions', () => {
    const addressDataMap = new Map<string, AddressTransactionData>([
      [
        '0x1234567890abcdef1234567890abcdef12345678',
        {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          transactions: [
            {
              hash: '0xfailed',
              blockNumber: '1',
              timeStamp: '1609459200',
              from: '0x1234567890abcdef1234567890abcdef12345678',
              to: '0xabcdef1234567890abcdef1234567890abcdef12',
              value: '1000000000000000000',
              gasUsed: '21000',
              gasPrice: '20000000000',
              isError: '1',
            },
          ],
          tokenTransactions: [],
        },
      ],
    ])

    const output = generateBeancountOutput(addressDataMap)
    expect(output).toContain('! "Failed ETH Transfer"')
  })
})
