/**
 * LocalStorage utilities for persisting user data
 */

import { STORAGE_KEYS } from '@/types'

/**
 * Safely get item from localStorage
 */
export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null

  try {
    return localStorage.getItem(key)
  } catch {
    console.warn(`Failed to read from localStorage: ${key}`)
    return null
  }
}

/**
 * Safely set item in localStorage
 */
export function setStorageItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    console.warn(`Failed to write to localStorage: ${key}`)
    return false
  }
}

/**
 * Safely remove item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.removeItem(key)
    return true
  } catch {
    console.warn(`Failed to remove from localStorage: ${key}`)
    return false
  }
}

/**
 * Get saved addresses from localStorage
 */
export function getSavedAddresses(): string {
  return getStorageItem(STORAGE_KEYS.ADDRESSES) || ''
}

/**
 * Save addresses to localStorage
 */
export function saveAddresses(addresses: string): boolean {
  return setStorageItem(STORAGE_KEYS.ADDRESSES, addresses)
}

/**
 * Get saved API key from localStorage
 */
export function getSavedApiKey(): string {
  return getStorageItem(STORAGE_KEYS.API_KEY) || ''
}

/**
 * Save API key to localStorage
 */
export function saveApiKey(apiKey: string): boolean {
  return setStorageItem(STORAGE_KEYS.API_KEY, apiKey)
}

/**
 * Clear all saved data from localStorage
 */
export function clearAllStoredData(): boolean {
  const addressesCleared = removeStorageItem(STORAGE_KEYS.ADDRESSES)
  const apiKeyCleared = removeStorageItem(STORAGE_KEYS.API_KEY)
  return addressesCleared && apiKeyCleared
}
