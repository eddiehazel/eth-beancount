import type { ParsedAddress } from '../types'

// Validate Ethereum address format
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/i.test(address)
}

// Parse addresses from textarea input
// Supports format: address or address:nickname
export function parseAddresses(input: string): ParsedAddress[] {
  const lines = input.split('\n')
  const parsed: ParsedAddress[] = []
  const seen = new Set<string>()

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Check if line contains nickname (address:nickname format)
    const colonIndex = trimmed.indexOf(':')
    let address: string
    let nickname: string | undefined

    if (colonIndex > 0 && colonIndex < trimmed.length - 1) {
      address = trimmed.substring(0, colonIndex).trim()
      nickname = trimmed.substring(colonIndex + 1).trim()
    } else {
      address = trimmed
    }

    // Validate address
    if (!isValidAddress(address)) continue

    // Deduplicate by lowercase address
    const normalizedAddress = address.toLowerCase()
    if (seen.has(normalizedAddress)) continue
    seen.add(normalizedAddress)

    parsed.push({
      address: normalizedAddress,
      nickname: nickname || undefined,
    })
  }

  return parsed
}

// Get account ID from address (last 6 hex characters)
export function getAccountId(address: string): string {
  return address.slice(-6).toUpperCase()
}

// Get full account name for Beancount
export function getAccountName(
  _address: string,
  nickname: string | undefined,
  suffix: string
): string {
  if (nickname) {
    return `${sanitizeAccountName(nickname)}:${suffix}`
  }
  return suffix
}

// Sanitize account name for Beancount
function sanitizeAccountName(name: string): string {
  // Remove any characters that aren't alphanumeric, hyphen, underscore, or dot
  // Also ensure it starts with an uppercase letter
  const sanitized = name.replace(/[^a-zA-Z0-9\-_.]/g, '')
  if (!sanitized) return 'Account'
  // Capitalize first letter
  return sanitized.charAt(0).toUpperCase() + sanitized.slice(1)
}
