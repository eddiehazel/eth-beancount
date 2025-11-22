/**
 * Address parsing and validation utilities
 */

import type { ParsedAddress } from '@/types'
import { isValidEthereumAddress, normalizeAddress } from './sanitize'

/**
 * Parse address input text into validated address objects
 * Supports formats:
 * - Plain address: 0x1234...
 * - Address with nickname: 0x1234...:MyWallet
 * - One address per line
 */
export function parseAddresses(input: string): ParsedAddress[] {
  if (!input.trim()) return []

  const lines = input
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const addressMap = new Map<string, ParsedAddress>()

  for (const line of lines) {
    // Check for nickname format (address:nickname)
    const colonIndex = line.indexOf(':')
    let address: string
    let nickname: string | undefined

    if (colonIndex > 0 && colonIndex < line.length - 1) {
      // Potential address:nickname format
      const potentialAddress = line.slice(0, colonIndex).trim()
      const potentialNickname = line.slice(colonIndex + 1).trim()

      // Only treat as nickname format if the first part looks like an address
      if (isValidEthereumAddress(potentialAddress)) {
        address = potentialAddress
        nickname = potentialNickname || undefined
      } else {
        // Might be an address with : in the middle (unlikely but handle it)
        address = line
      }
    } else {
      address = line
    }

    // Skip invalid addresses
    if (!isValidEthereumAddress(address)) {
      continue
    }

    // Deduplicate by normalized address, keeping first nickname
    const normalized = normalizeAddress(address)
    if (!addressMap.has(normalized)) {
      addressMap.set(normalized, {
        address: address as `0x${string}`,
        nickname,
      })
    }
  }

  return Array.from(addressMap.values())
}

/**
 * Format addresses for display/storage
 */
export function formatAddresses(addresses: ParsedAddress[]): string {
  return addresses
    .map((a) => (a.nickname ? `${a.address}:${a.nickname}` : a.address))
    .join('\n')
}

/**
 * Validate a single address string
 */
export function validateAddress(address: string): { valid: boolean; error?: string } {
  if (!address.trim()) {
    return { valid: false, error: 'Address is required' }
  }

  if (!isValidEthereumAddress(address.trim())) {
    return { valid: false, error: 'Invalid Ethereum address format' }
  }

  return { valid: true }
}
