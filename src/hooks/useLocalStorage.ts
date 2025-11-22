import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get stored value or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  // Update localStorage when value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      // Handle localStorage errors (e.g., quota exceeded)
    }
  }, [key, storedValue])

  // Clear the stored value
  const clearValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch {
      // Handle localStorage errors
    }
  }, [key, initialValue])

  return [storedValue, setStoredValue, clearValue]
}

// Specialized hook for string values (addresses, API key)
export function useLocalStorageString(
  key: string,
  initialValue: string = ''
): [string, (value: string) => void, () => void] {
  const [storedValue, setStoredValue] = useState<string>(() => {
    try {
      return localStorage.getItem(key) || initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      if (storedValue) {
        localStorage.setItem(key, storedValue)
      } else {
        localStorage.removeItem(key)
      }
    } catch {
      // Handle localStorage errors
    }
  }, [key, storedValue])

  const clearValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch {
      // Handle localStorage errors
    }
  }, [key, initialValue])

  return [storedValue, setStoredValue, clearValue]
}
