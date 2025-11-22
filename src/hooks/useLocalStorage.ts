'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for syncing state with localStorage
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get stored value or use initial
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      console.warn(`Error reading localStorage key "${key}":`)
      return initialValue
    }
  }, [initialValue, key])

  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Read from localStorage on mount
  useEffect(() => {
    setStoredValue(readValue())
  }, [readValue])

  // Set value
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch {
        console.warn(`Error setting localStorage key "${key}"`)
      }
    },
    [key, storedValue]
  )

  // Remove value
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch {
      console.warn(`Error removing localStorage key "${key}"`)
    }
  }, [initialValue, key])

  return [storedValue, setValue, removeValue]
}

/**
 * Simplified hook for string localStorage values
 */
export function useLocalStorageString(
  key: string,
  initialValue: string = ''
): [string, (value: string) => void, () => void] {
  const [storedValue, setStoredValue] = useState<string>(initialValue)

  // Read from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        setStoredValue(item)
      }
    } catch {
      console.warn(`Error reading localStorage key "${key}"`)
    }
  }, [key])

  // Set value
  const setValue = useCallback(
    (value: string) => {
      try {
        setStoredValue(value)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value)
        }
      } catch {
        console.warn(`Error setting localStorage key "${key}"`)
      }
    },
    [key]
  )

  // Remove value
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch {
      console.warn(`Error removing localStorage key "${key}"`)
    }
  }, [initialValue, key])

  return [storedValue, setValue, removeValue]
}
