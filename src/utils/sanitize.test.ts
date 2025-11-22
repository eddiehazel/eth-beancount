import { describe, it, expect } from 'vitest'
import {
  sanitizeSymbol,
  sanitizeAccountName,
  sanitizeUrls,
  sanitizeDescription,
} from './sanitize'

describe('sanitizeUrls', () => {
  it('should remove HTTP URLs', () => {
    expect(sanitizeUrls('Token http://example.com name')).toBe('Token  name')
    expect(sanitizeUrls('https://malicious.site/path')).toBe('')
  })

  it('should remove bare domains', () => {
    expect(sanitizeUrls('Visit example.com today')).toBe('Visit  today')
    expect(sanitizeUrls('scam.xyz')).toBe('')
  })

  it('should remove spaced TLD attempts', () => {
    expect(sanitizeUrls('visit example . com')).toBe('visit')
  })

  it('should handle common TLDs', () => {
    expect(sanitizeUrls('malware.io')).toBe('')
    expect(sanitizeUrls('scam.net')).toBe('')
    expect(sanitizeUrls('bad.org')).toBe('')
  })

  it('should preserve normal text', () => {
    expect(sanitizeUrls('Normal Token Name')).toBe('Normal Token Name')
    expect(sanitizeUrls('ETH')).toBe('ETH')
    expect(sanitizeUrls('')).toBe('')
  })
})

describe('sanitizeSymbol', () => {
  it('should return valid symbols unchanged', () => {
    expect(sanitizeSymbol('ETH')).toBe('ETH')
    expect(sanitizeSymbol('USDC')).toBe('USDC')
    expect(sanitizeSymbol('WETH')).toBe('WETH')
  })

  it('should uppercase symbols', () => {
    expect(sanitizeSymbol('eth')).toBe('ETH')
    expect(sanitizeSymbol('Usdc')).toBe('USDC')
  })

  it('should remove special characters', () => {
    expect(sanitizeSymbol('ETH$')).toBe('ETH')
    expect(sanitizeSymbol('US@DC')).toBe('USDC')
  })

  it('should remove URLs from symbols', () => {
    expect(sanitizeSymbol('TOKEN https://scam.com')).toBe('TOKEN')
    expect(sanitizeSymbol('scam.xyz TOKEN')).toBe('TOKEN')
  })

  it('should handle empty or invalid symbols', () => {
    expect(sanitizeSymbol('')).toBe('UNKNOWN')
    expect(sanitizeSymbol('$$$')).toBe('TOKEN') // Special chars removed, becomes empty string + TOKEN prefix
  })

  it('should prefix symbols that dont start with letter', () => {
    expect(sanitizeSymbol('123')).toBe('TOKEN123')
    expect(sanitizeSymbol('_TEST')).toBe('TOKEN_TEST')
  })

  it('should truncate long symbols to 24 characters', () => {
    const longSymbol = 'AVERYLONGTOKENSYMBOLNAME12345'
    expect(sanitizeSymbol(longSymbol).length).toBeLessThanOrEqual(24)
  })
})

describe('sanitizeAccountName', () => {
  it('should capitalize first letter', () => {
    expect(sanitizeAccountName('vitalik')).toBe('Vitalik')
    expect(sanitizeAccountName('myWallet')).toBe('MyWallet')
  })

  it('should remove special characters', () => {
    expect(sanitizeAccountName('my@wallet!')).toBe('Mywallet')
  })

  it('should remove URLs', () => {
    expect(sanitizeAccountName('wallet https://scam.com')).toBe('Wallet')
  })

  it('should handle empty input', () => {
    expect(sanitizeAccountName('')).toBe('Unknown')
  })

  it('should preserve allowed characters', () => {
    expect(sanitizeAccountName('my-wallet_v2.eth')).toBe('My-wallet_v2.eth')
  })
})

describe('sanitizeDescription', () => {
  it('should remove URLs', () => {
    expect(sanitizeDescription('Transfer to https://example.com')).toBe(
      'Transfer to'
    )
  })

  it('should escape quotes', () => {
    expect(sanitizeDescription('Token "Test"')).toBe('Token \\"Test\\"')
  })

  it('should handle both URLs and quotes', () => {
    expect(sanitizeDescription('"Claim" at https://scam.xyz')).toBe(
      '\\"Claim\\" at'
    )
  })
})
