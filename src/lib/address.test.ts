import { describe, it, expect } from 'vitest'
import { parseAddresses, formatAddresses, validateAddress } from './address'

describe('parseAddresses', () => {
  const validAddress1 = '0x1234567890abcdef1234567890abcdef12345678'
  const validAddress2 = '0xabcdef1234567890abcdef1234567890abcdef12'

  it('parses single address', () => {
    const result = parseAddresses(validAddress1)
    expect(result).toHaveLength(1)
    expect(result[0].address).toBe(validAddress1)
    expect(result[0].nickname).toBeUndefined()
  })

  it('parses multiple addresses on separate lines', () => {
    const input = `${validAddress1}\n${validAddress2}`
    const result = parseAddresses(input)
    expect(result).toHaveLength(2)
    expect(result[0].address).toBe(validAddress1)
    expect(result[1].address).toBe(validAddress2)
  })

  it('parses address with nickname', () => {
    const input = `${validAddress1}:MyWallet`
    const result = parseAddresses(input)
    expect(result).toHaveLength(1)
    expect(result[0].address).toBe(validAddress1)
    expect(result[0].nickname).toBe('MyWallet')
  })

  it('handles comma-separated addresses', () => {
    const input = `${validAddress1},${validAddress2}`
    const result = parseAddresses(input)
    expect(result).toHaveLength(2)
  })

  it('deduplicates addresses (case-insensitive)', () => {
    const upper = '0xABCDEF1234567890ABCDEF1234567890ABCDEF12'
    const lower = '0xabcdef1234567890abcdef1234567890abcdef12'
    const input = `${upper}\n${lower}`
    const result = parseAddresses(input)
    expect(result).toHaveLength(1)
  })

  it('keeps first nickname when deduplicating', () => {
    const address = '0xabcdef1234567890abcdef1234567890abcdef12'
    const upper = address.toUpperCase().replace('0X', '0x')
    const input = `${address}:FirstNickname\n${upper}:SecondNickname`
    const result = parseAddresses(input)
    expect(result).toHaveLength(1)
    expect(result[0].nickname).toBe('FirstNickname')
  })

  it('skips invalid addresses', () => {
    const input = `invalid\n${validAddress1}\n0x123`
    const result = parseAddresses(input)
    expect(result).toHaveLength(1)
    expect(result[0].address).toBe(validAddress1)
  })

  it('handles empty input', () => {
    expect(parseAddresses('')).toHaveLength(0)
    expect(parseAddresses('   ')).toHaveLength(0)
  })

  it('trims whitespace from addresses', () => {
    const input = `  ${validAddress1}  `
    const result = parseAddresses(input)
    expect(result).toHaveLength(1)
    expect(result[0].address).toBe(validAddress1)
  })

  it('trims whitespace from nicknames', () => {
    const input = `${validAddress1}:  MyWallet  `
    const result = parseAddresses(input)
    expect(result[0].nickname).toBe('MyWallet')
  })
})

describe('formatAddresses', () => {
  it('formats addresses without nicknames', () => {
    const addresses = [
      { address: '0x1234567890abcdef1234567890abcdef12345678' as const },
    ]
    expect(formatAddresses(addresses)).toBe('0x1234567890abcdef1234567890abcdef12345678')
  })

  it('formats addresses with nicknames', () => {
    const addresses = [
      { address: '0x1234567890abcdef1234567890abcdef12345678' as const, nickname: 'MyWallet' },
    ]
    expect(formatAddresses(addresses)).toBe('0x1234567890abcdef1234567890abcdef12345678:MyWallet')
  })

  it('formats multiple addresses', () => {
    const addresses = [
      { address: '0x1234567890abcdef1234567890abcdef12345678' as const, nickname: 'Wallet1' },
      { address: '0xabcdef1234567890abcdef1234567890abcdef12' as const },
    ]
    const result = formatAddresses(addresses)
    expect(result).toBe(
      '0x1234567890abcdef1234567890abcdef12345678:Wallet1\n0xabcdef1234567890abcdef1234567890abcdef12'
    )
  })
})

describe('validateAddress', () => {
  it('validates correct address', () => {
    const result = validateAddress('0x1234567890abcdef1234567890abcdef12345678')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('rejects empty address', () => {
    const result = validateAddress('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Address is required')
  })

  it('rejects whitespace-only address', () => {
    const result = validateAddress('   ')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Address is required')
  })

  it('rejects invalid address format', () => {
    const result = validateAddress('not-an-address')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid Ethereum address format')
  })

  it('validates address with whitespace', () => {
    const result = validateAddress('  0x1234567890abcdef1234567890abcdef12345678  ')
    expect(result.valid).toBe(true)
  })
})
