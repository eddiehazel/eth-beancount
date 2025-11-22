import { describe, it, expect } from 'vitest'
import { isValidAddress, parseAddresses, getAccountId } from './address'

describe('isValidAddress', () => {
  it('should return true for valid Ethereum addresses', () => {
    expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f2e678')).toBe(true)
    expect(isValidAddress('0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B')).toBe(true)
    expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true)
  })

  it('should return false for invalid addresses', () => {
    expect(isValidAddress('')).toBe(false)
    expect(isValidAddress('0x')).toBe(false)
    expect(isValidAddress('0x123')).toBe(false)
    expect(isValidAddress('742d35Cc6634C0532925a3b844Bc9e7595f2e678')).toBe(false)
    expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f2e678extra')).toBe(false)
    expect(isValidAddress('0xZZZd35Cc6634C0532925a3b844Bc9e7595f2e678')).toBe(false)
  })
})

describe('parseAddresses', () => {
  it('should parse single address', () => {
    const result = parseAddresses('0x742d35Cc6634C0532925a3b844Bc9e7595f2e678')
    expect(result).toHaveLength(1)
    expect(result[0].address).toBe('0x742d35cc6634c0532925a3b844bc9e7595f2e678')
    expect(result[0].nickname).toBeUndefined()
  })

  it('should parse multiple addresses', () => {
    const input = `0x742d35Cc6634C0532925a3b844Bc9e7595f2e678
0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B`
    const result = parseAddresses(input)
    expect(result).toHaveLength(2)
  })

  it('should parse address with nickname', () => {
    const result = parseAddresses('0x742d35Cc6634C0532925a3b844Bc9e7595f2e678:my-wallet')
    expect(result).toHaveLength(1)
    expect(result[0].address).toBe('0x742d35cc6634c0532925a3b844bc9e7595f2e678')
    expect(result[0].nickname).toBe('my-wallet')
  })

  it('should handle addresses with .eth nicknames', () => {
    const result = parseAddresses('0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B:vitalik.eth')
    expect(result).toHaveLength(1)
    expect(result[0].nickname).toBe('vitalik.eth')
  })

  it('should skip empty lines', () => {
    const input = `0x742d35Cc6634C0532925a3b844Bc9e7595f2e678

0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B`
    const result = parseAddresses(input)
    expect(result).toHaveLength(2)
  })

  it('should skip invalid addresses', () => {
    const input = `0x742d35Cc6634C0532925a3b844Bc9e7595f2e678
invalid-address
0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B`
    const result = parseAddresses(input)
    expect(result).toHaveLength(2)
  })

  it('should deduplicate addresses (case-insensitive)', () => {
    const input = `0x742d35Cc6634C0532925a3b844Bc9e7595f2e678
0x742D35CC6634C0532925A3B844BC9E7595F2E678`
    const result = parseAddresses(input)
    expect(result).toHaveLength(1)
  })

  it('should handle whitespace', () => {
    const input = `  0x742d35Cc6634C0532925a3b844Bc9e7595f2e678  :  my-wallet  `
    const result = parseAddresses(input)
    expect(result).toHaveLength(1)
    expect(result[0].nickname).toBe('my-wallet')
  })

  it('should return empty array for empty input', () => {
    expect(parseAddresses('')).toHaveLength(0)
    expect(parseAddresses('   ')).toHaveLength(0)
    expect(parseAddresses('\n\n')).toHaveLength(0)
  })
})

describe('getAccountId', () => {
  it('should return last 6 characters uppercased', () => {
    expect(getAccountId('0x742d35cc6634c0532925a3b844bc9e7595f2e678')).toBe('F2E678')
    expect(getAccountId('0xab5801a7d398351b8be11c439e05c5b3259aec9b')).toBe('9AEC9B')
  })
})
