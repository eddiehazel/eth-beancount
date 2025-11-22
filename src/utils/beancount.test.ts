import { describe, it, expect } from 'vitest'
import {
  weiToEth,
  formatTokenAmount,
  formatDate,
  generateBeancountOutput,
} from './beancount'
import type { AddressData } from '../types'

describe('weiToEth', () => {
  it('should convert wei to ETH correctly', () => {
    expect(weiToEth('1000000000000000000')).toBe('1.000000')
    expect(weiToEth('0')).toBe('0.000000')
    expect(weiToEth('500000000000000000')).toBe('0.500000')
  })

  it('should handle large amounts', () => {
    expect(weiToEth('1234567890000000000')).toBe('1.23456789')
  })

  it('should handle small amounts', () => {
    expect(weiToEth('1000000000000')).toBe('0.000001')
  })
})

describe('formatTokenAmount', () => {
  it('should format token amounts with decimals', () => {
    expect(formatTokenAmount('1000000', '6')).toBe('1.0000')
    expect(formatTokenAmount('1500000', '6')).toBe('1.5000')
  })

  it('should handle 18 decimal tokens', () => {
    expect(formatTokenAmount('1000000000000000000', '18')).toBe('1.0000')
  })

  it('should handle 0 decimal tokens', () => {
    // With 0 decimals, value is returned as-is
    expect(formatTokenAmount('100', '0')).toBe('100')
  })

  it('should preserve precision', () => {
    expect(formatTokenAmount('1234567', '6')).toBe('1.234567')
  })
})

describe('formatDate', () => {
  it('should format Unix timestamp to YYYY-MM-DD', () => {
    // January 1, 2024 00:00:00 UTC
    expect(formatDate('1704067200')).toBe('2024-01-01')
  })

  it('should handle different dates', () => {
    // July 15, 2023
    expect(formatDate('1689379200')).toBe('2023-07-15')
  })
})

describe('generateBeancountOutput', () => {
  it('should generate header sections even for empty address data', () => {
    const result = generateBeancountOutput(new Map(), new Map())
    // Even with empty address map, basic headers are generated
    expect(result).toContain('Commodity Declarations')
    expect(result).toContain('commodity ETH')
    expect(result).toContain('Expenses:Crypto:GasFees')
  })

  it('should generate commodity declarations', () => {
    const addressData = new Map<string, AddressData>([
      [
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
        {
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
          transactions: [
            {
              blockNumber: '12345',
              timeStamp: '1704067200',
              hash: '0xabc123',
              from: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
              to: '0x1234567890123456789012345678901234567890',
              value: '1000000000000000000',
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
          ],
          tokenTransactions: [],
        },
      ],
    ])

    const result = generateBeancountOutput(addressData, new Map())

    expect(result).toContain('commodity ETH')
    expect(result).toContain('open Assets:Crypto:Ethereum')
    expect(result).toContain('open Expenses:Crypto:GasFees ETH')
    expect(result).toContain('ETH Transfer Out')
    expect(result).toContain('txhash: "0xabc123"')
    expect(result).toContain('etherscan: "https://etherscan.io/tx/0xabc123"')
  })

  it('should handle failed transactions with ! flag', () => {
    const addressData = new Map<string, AddressData>([
      [
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
        {
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
          transactions: [
            {
              blockNumber: '12345',
              timeStamp: '1704067200',
              hash: '0xfailed',
              from: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
              to: '0x1234567890123456789012345678901234567890',
              value: '1000000000000000000',
              gas: '21000',
              gasPrice: '50000000000',
              gasUsed: '21000',
              isError: '1',
              txreceipt_status: '0',
              input: '0x',
              contractAddress: '',
              cumulativeGasUsed: '21000',
              confirmations: '100',
              methodId: '0x',
              functionName: '',
            },
          ],
          tokenTransactions: [],
        },
      ],
    ])

    const result = generateBeancountOutput(addressData, new Map())

    expect(result).toContain('! "Failed Transaction"')
    expect(result).toContain('Expenses:Crypto:GasFees')
  })

  it('should include nicknames in account names', () => {
    const addressData = new Map<string, AddressData>([
      [
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
        {
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
          nickname: 'mywallet',
          transactions: [
            {
              blockNumber: '12345',
              timeStamp: '1704067200',
              hash: '0xabc123',
              from: '0x1234567890123456789012345678901234567890',
              to: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
              value: '1000000000000000000',
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
          ],
          tokenTransactions: [],
        },
      ],
    ])

    const nicknames = new Map([
      ['0x742d35cc6634c0532925a3b844bc9e7595f2e678', 'mywallet'],
    ])

    const result = generateBeancountOutput(addressData, nicknames)

    expect(result).toContain('Mywallet')
  })

  it('should generate token transactions', () => {
    const addressData = new Map<string, AddressData>([
      [
        '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
        {
          address: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
          transactions: [],
          tokenTransactions: [
            {
              blockNumber: '12345',
              timeStamp: '1704067200',
              hash: '0xtoken123',
              from: '0x742d35cc6634c0532925a3b844bc9e7595f2e678',
              to: '0x1234567890123456789012345678901234567890',
              value: '1000000',
              tokenName: 'USD Coin',
              tokenSymbol: 'USDC',
              tokenDecimal: '6',
              contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              gas: '60000',
              gasPrice: '50000000000',
              gasUsed: '55000',
            },
          ],
        },
      ],
    ])

    const result = generateBeancountOutput(addressData, new Map())

    expect(result).toContain('commodity USDC')
    expect(result).toContain('USD Coin Transfer Out')
    expect(result).toContain('txhash: "0xtoken123"')
  })
})
