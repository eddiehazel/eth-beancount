import { describe, it, expect } from 'vitest'
import {
  sanitizeUrls,
  sanitizeSymbol,
  sanitizeAccountName,
  getAccountId,
  isValidEthereumAddress,
  normalizeAddress,
} from './sanitize'

describe('sanitizeUrls', () => {
  it('removes http URLs', () => {
    expect(sanitizeUrls('Token http://example.com here')).toBe('Token  here')
  })

  it('removes https URLs', () => {
    expect(sanitizeUrls('Token https://malicious.site/phish here')).toBe('Token  here')
  })

  it('removes www patterns', () => {
    expect(sanitizeUrls('Visit www.example.com now')).toBe('Visit  now')
  })

  it('removes bare domain names', () => {
    expect(sanitizeUrls('Token ethnano.com here')).toBe('Token  here')
  })

  it('removes spaced TLD patterns', () => {
    expect(sanitizeUrls('Token ethnano .net here')).toBe('Token  here')
  })

  it('removes multiple URLs', () => {
    expect(
      sanitizeUrls('Visit https://a.com and http://b.org and www.c.io')
    ).toBe('Visit  and  and')
  })

  it('handles empty string', () => {
    expect(sanitizeUrls('')).toBe('')
  })

  it('handles null/undefined', () => {
    expect(sanitizeUrls(null as unknown as string)).toBe(null)
    expect(sanitizeUrls(undefined as unknown as string)).toBe(undefined)
  })

  it('preserves clean text', () => {
    expect(sanitizeUrls('Ethereum Token')).toBe('Ethereum Token')
  })
})

describe('sanitizeSymbol', () => {
  it('converts to uppercase', () => {
    expect(sanitizeSymbol('eth')).toBe('ETH')
  })

  it('removes special characters', () => {
    expect(sanitizeSymbol('USD$')).toBe('USD')
  })

  it('removes URLs from symbol', () => {
    expect(sanitizeSymbol('TOKEN https://malicious.com')).toBe('TOKEN')
  })

  it('handles empty string', () => {
    expect(sanitizeSymbol('')).toBe('UNKNOWN')
  })

  it('prefixes with X if starts with number', () => {
    expect(sanitizeSymbol('1INCH')).toBe('X1INCH')
  })

  it('pads short symbols', () => {
    expect(sanitizeSymbol('A')).toBe('AX')
  })

  it('truncates long symbols to 24 chars', () => {
    const longSymbol = 'A'.repeat(30)
    expect(sanitizeSymbol(longSymbol)).toBe('A'.repeat(24))
  })

  it('handles symbols with emojis/unicode', () => {
    expect(sanitizeSymbol('ETH🚀')).toBe('ETH')
  })

  it('handles symbols with spaces', () => {
    expect(sanitizeSymbol('MY TOKEN')).toBe('MYTOKEN')
  })
})

describe('sanitizeAccountName', () => {
  it('capitalizes first letter', () => {
    expect(sanitizeAccountName('myWallet')).toBe('MyWallet')
  })

  it('removes special characters', () => {
    expect(sanitizeAccountName('My-Wallet_123')).toBe('MyWallet123')
  })

  it('handles empty string', () => {
    expect(sanitizeAccountName('')).toBe('Unknown')
  })

  it('removes URLs', () => {
    expect(sanitizeAccountName('Wallet https://evil.com')).toBe('Wallet')
  })

  it('handles all-numeric input', () => {
    expect(sanitizeAccountName('123')).toBe('123')
  })
})

describe('getAccountId', () => {
  it('returns last 6 characters uppercase', () => {
    expect(getAccountId('0x1234567890abcdef1234567890abcdef12345678')).toBe('345678')
  })

  it('handles mixed case addresses', () => {
    expect(getAccountId('0x1234567890AbCdEf1234567890AbCdEf12AbCdEf')).toBe('ABCDEF')
  })
})

describe('isValidEthereumAddress', () => {
  it('validates correct address', () => {
    expect(isValidEthereumAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(true)
  })

  it('validates mixed case address', () => {
    expect(isValidEthereumAddress('0xAbCdEf1234567890AbCdEf1234567890AbCdEf12')).toBe(true)
  })

  it('rejects address without 0x prefix', () => {
    expect(isValidEthereumAddress('1234567890abcdef1234567890abcdef12345678')).toBe(false)
  })

  it('rejects short address', () => {
    expect(isValidEthereumAddress('0x123456')).toBe(false)
  })

  it('rejects long address', () => {
    expect(isValidEthereumAddress('0x1234567890abcdef1234567890abcdef1234567890')).toBe(false)
  })

  it('rejects address with invalid characters', () => {
    expect(isValidEthereumAddress('0x1234567890abcdef1234567890abcdef1234567g')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidEthereumAddress('')).toBe(false)
  })
})

describe('normalizeAddress', () => {
  it('converts to lowercase', () => {
    expect(normalizeAddress('0xAbCdEf1234567890AbCdEf1234567890AbCdEf12')).toBe(
      '0xabcdef1234567890abcdef1234567890abcdef12'
    )
  })

  it('handles already lowercase address', () => {
    expect(normalizeAddress('0xabcdef1234567890abcdef1234567890abcdef12')).toBe(
      '0xabcdef1234567890abcdef1234567890abcdef12'
    )
  })
})
