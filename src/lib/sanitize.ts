/**
 * Sanitization utilities for Beancount output
 */

// Common TLDs for URL detection
const COMMON_TLDS = [
  'com', 'org', 'net', 'io', 'co', 'xyz', 'info', 'biz', 'app',
  'dev', 'ai', 'finance', 'money', 'exchange', 'trade', 'token',
  'eth', 'crypto', 'defi', 'nft', 'dao', 'web3'
]

/**
 * Remove suspicious URLs from text to prevent XSS/phishing in token names
 */
export function sanitizeUrls(text: string): string {
  if (!text) return text

  // Remove http/https/ftp URLs
  let sanitized = text.replace(/https?:\/\/[^\s]*/gi, '')
  sanitized = sanitized.replace(/ftp:\/\/[^\s]*/gi, '')

  // Remove www. patterns
  sanitized = sanitized.replace(/www\.[^\s]*/gi, '')

  // Remove bare domain patterns with common TLDs
  const tldPattern = new RegExp(
    `\\b[a-zA-Z0-9-]+\\.(${COMMON_TLDS.join('|')})\\b`,
    'gi'
  )
  sanitized = sanitized.replace(tldPattern, '')

  // Remove spaced TLD patterns (e.g., "ethnano .net")
  const spacedTldPattern = new RegExp(
    `\\b[a-zA-Z0-9-]+\\s+\\.(${COMMON_TLDS.join('|')})\\b`,
    'gi'
  )
  sanitized = sanitized.replace(spacedTldPattern, '')

  return sanitized.trim()
}

/**
 * Convert token symbol to valid Beancount commodity format
 * Beancount commodities: uppercase letters and numbers, 2-24 chars, start with letter
 */
export function sanitizeSymbol(symbol: string): string {
  if (!symbol) return 'UNKNOWN'

  // Remove URLs first
  let clean = sanitizeUrls(symbol)

  // Keep only alphanumeric characters
  clean = clean.replace(/[^a-zA-Z0-9]/g, '')

  // Convert to uppercase
  clean = clean.toUpperCase()

  // Ensure it starts with a letter
  if (!/^[A-Z]/.test(clean)) {
    clean = 'X' + clean
  }

  // Enforce length constraints (2-24 characters)
  if (clean.length < 2) {
    clean = clean.padEnd(2, 'X')
  } else if (clean.length > 24) {
    clean = clean.slice(0, 24)
  }

  return clean || 'UNKNOWN'
}

/**
 * Sanitize account name component for Beancount
 * Account components must be alphanumeric, starting with uppercase
 */
export function sanitizeAccountName(name: string): string {
  if (!name) return 'Unknown'

  // Remove URLs first
  let clean = sanitizeUrls(name)

  // Keep only alphanumeric characters
  clean = clean.replace(/[^a-zA-Z0-9]/g, '')

  // Capitalize first letter
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1)
  }

  return clean || 'Unknown'
}

/**
 * Extract account ID from Ethereum address (last 6 hex chars)
 */
export function getAccountId(address: string): string {
  return address.slice(-6).toUpperCase()
}

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Normalize Ethereum address to lowercase (checksum-agnostic)
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase()
}
