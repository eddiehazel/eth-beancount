import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getSavedAddresses,
  saveAddresses,
  getSavedApiKey,
  saveApiKey,
  clearAllStoredData,
} from './storage'
import { STORAGE_KEYS } from '@/types'

describe('storage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null)
    ;(localStorage.setItem as ReturnType<typeof vi.fn>).mockReturnValue(undefined)
    ;(localStorage.removeItem as ReturnType<typeof vi.fn>).mockReturnValue(undefined)
  })

  describe('getStorageItem', () => {
    it('returns stored value', () => {
      ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('test-value')
      expect(getStorageItem('test-key')).toBe('test-value')
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key')
    })

    it('returns null for non-existent key', () => {
      ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null)
      expect(getStorageItem('non-existent')).toBeNull()
    })

    it('handles localStorage errors gracefully', () => {
      ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('Storage error')
      })
      expect(getStorageItem('test-key')).toBeNull()
    })
  })

  describe('setStorageItem', () => {
    it('stores value in localStorage', () => {
      const result = setStorageItem('test-key', 'test-value')
      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value')
    })

    it('handles localStorage errors gracefully', () => {
      ;(localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('Storage error')
      })
      const result = setStorageItem('test-key', 'test-value')
      expect(result).toBe(false)
    })
  })

  describe('removeStorageItem', () => {
    it('removes item from localStorage', () => {
      const result = removeStorageItem('test-key')
      expect(result).toBe(true)
      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key')
    })

    it('handles localStorage errors gracefully', () => {
      ;(localStorage.removeItem as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('Storage error')
      })
      const result = removeStorageItem('test-key')
      expect(result).toBe(false)
    })
  })

  describe('getSavedAddresses', () => {
    it('returns saved addresses', () => {
      ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('0x123\n0x456')
      expect(getSavedAddresses()).toBe('0x123\n0x456')
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.ADDRESSES)
    })

    it('returns empty string when no addresses saved', () => {
      ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null)
      expect(getSavedAddresses()).toBe('')
    })
  })

  describe('saveAddresses', () => {
    it('saves addresses to localStorage', () => {
      const result = saveAddresses('0x123\n0x456')
      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.ADDRESSES, '0x123\n0x456')
    })
  })

  describe('getSavedApiKey', () => {
    it('returns saved API key', () => {
      ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue('my-api-key')
      expect(getSavedApiKey()).toBe('my-api-key')
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY)
    })

    it('returns empty string when no API key saved', () => {
      ;(localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null)
      expect(getSavedApiKey()).toBe('')
    })
  })

  describe('saveApiKey', () => {
    it('saves API key to localStorage', () => {
      const result = saveApiKey('my-api-key')
      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY, 'my-api-key')
    })
  })

  describe('clearAllStoredData', () => {
    it('clears all stored data', () => {
      const result = clearAllStoredData()
      expect(result).toBe(true)
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.ADDRESSES)
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.API_KEY)
    })

    it('returns false if any removal fails', () => {
      ;(localStorage.removeItem as ReturnType<typeof vi.fn>)
        .mockReturnValueOnce(undefined)
        .mockImplementationOnce(() => {
          throw new Error('Storage error')
        })
      const result = clearAllStoredData()
      expect(result).toBe(false)
    })
  })
})
