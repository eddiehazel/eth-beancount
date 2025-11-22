// Sanitize token symbol for Beancount
// Removes any potentially malicious content and ensures valid Beancount commodity syntax
export function sanitizeSymbol(symbol: string): string {
  if (!symbol) return 'UNKNOWN'

  // Remove URLs and potentially dangerous patterns
  let sanitized = sanitizeUrls(symbol)

  // Remove any characters that aren't alphanumeric or common symbol characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9\-_.]/g, '')

  // Ensure the symbol is not empty and starts with a letter (Beancount requirement)
  if (!sanitized || !/^[a-zA-Z]/.test(sanitized)) {
    sanitized = 'TOKEN' + sanitized
  }

  // Limit length to 24 characters (Beancount recommendation)
  return sanitized.slice(0, 24).toUpperCase()
}

// Sanitize account name for Beancount
export function sanitizeAccountName(name: string): string {
  if (!name) return 'Unknown'

  // Remove URLs first
  let sanitized = sanitizeUrls(name)

  // Remove any characters that aren't alphanumeric, hyphen, underscore, or dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9\-_.]/g, '')

  if (!sanitized) return 'Unknown'

  // Capitalize first letter (Beancount requirement for account names)
  return sanitized.charAt(0).toUpperCase() + sanitized.slice(1)
}

// Remove potentially malicious URLs from text
export function sanitizeUrls(text: string): string {
  if (!text) return text

  // Pattern to match URLs and URL-like patterns
  const patterns = [
    // Standard URLs with protocol
    /https?:\/\/[^\s]+/gi,
    // URLs without protocol but with common TLDs
    /\b[a-zA-Z0-9][a-zA-Z0-9\-]*\.(com|net|org|io|xyz|info|co|app|dev|me|link|site|online|website|click|top|club|live|space|tech|store|shop|pro|vip|win|buzz|icu|work|cloud|pw|cc|biz|ws|tk|ml|ga|cf|gq)\b[^\s]*/gi,
    // Bare domains without subdomain
    /\b\w+\.(com|net|org|io|xyz|info|co|app)\b/gi,
    // Spaced TLD attempts (e.g., "example . com")
    /\b\w+\s*\.\s*(com|net|org|io|xyz|info)\b/gi,
  ]

  let sanitized = text
  for (const pattern of patterns) {
    sanitized = sanitized.replace(pattern, '')
  }

  return sanitized.trim()
}

// Sanitize transaction description for Beancount
export function sanitizeDescription(description: string): string {
  // Remove URLs and escape quotes
  let sanitized = sanitizeUrls(description)
  sanitized = sanitized.replace(/"/g, '\\"')
  return sanitized
}
