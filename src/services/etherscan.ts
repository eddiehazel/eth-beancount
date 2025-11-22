import type {
  EthTransaction,
  TokenTransaction,
  EtherscanResponse,
  FetchResult,
  AddressData,
} from '../types'

const API_BASE = 'https://api.etherscan.io/v2/api'
const DEFAULT_API_KEY = 'YourEtherscanAPIKeyToken'
const CHAIN_ID = '1' // Ethereum mainnet

// Delay helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Fetch with retry logic
async function fetchWithRetry<T>(
  url: string,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      lastError = error as Error
      if (attempt < retries) {
        await delay(delayMs * Math.pow(2, attempt)) // Exponential backoff
      }
    }
  }

  throw lastError || new Error('Fetch failed')
}

// Fetch normal transactions for an address
export async function fetchTransactions(
  address: string,
  apiKey: string = DEFAULT_API_KEY
): Promise<EthTransaction[]> {
  const url = new URL(API_BASE)
  url.searchParams.set('chainid', CHAIN_ID)
  url.searchParams.set('module', 'account')
  url.searchParams.set('action', 'txlist')
  url.searchParams.set('address', address)
  url.searchParams.set('startblock', '0')
  url.searchParams.set('endblock', '99999999')
  url.searchParams.set('sort', 'asc')
  url.searchParams.set('apikey', apiKey)

  const data = await fetchWithRetry<EtherscanResponse<EthTransaction>>(
    url.toString()
  )

  if (data.status === '0' && data.message === 'NOTOK') {
    throw new Error(
      typeof data.result === 'string' ? data.result : 'API error'
    )
  }

  // No transactions returns status "0" but message "No transactions found"
  if (data.status === '0' && data.message === 'No transactions found') {
    return []
  }

  return Array.isArray(data.result) ? data.result : []
}

// Fetch token transfers for an address
export async function fetchTokenTransfers(
  address: string,
  apiKey: string = DEFAULT_API_KEY
): Promise<TokenTransaction[]> {
  const url = new URL(API_BASE)
  url.searchParams.set('chainid', CHAIN_ID)
  url.searchParams.set('module', 'account')
  url.searchParams.set('action', 'tokentx')
  url.searchParams.set('address', address)
  url.searchParams.set('startblock', '0')
  url.searchParams.set('endblock', '99999999')
  url.searchParams.set('sort', 'asc')
  url.searchParams.set('apikey', apiKey)

  const data = await fetchWithRetry<EtherscanResponse<TokenTransaction>>(
    url.toString()
  )

  if (data.status === '0' && data.message === 'NOTOK') {
    throw new Error(
      typeof data.result === 'string' ? data.result : 'API error'
    )
  }

  // No transactions returns status "0" but message "No transactions found"
  if (data.status === '0' && data.message === 'No transactions found') {
    return []
  }

  return Array.isArray(data.result) ? data.result : []
}

// Fetch all data for a single address
export async function fetchAddressData(
  address: string,
  nickname: string | undefined,
  apiKey: string = DEFAULT_API_KEY
): Promise<FetchResult> {
  try {
    // Fetch transactions and token transfers with a small delay between them
    const transactions = await fetchTransactions(address, apiKey)
    await delay(300) // Small delay between API calls
    const tokenTransactions = await fetchTokenTransfers(address, apiKey)

    const data: AddressData = {
      address,
      nickname,
      transactions,
      tokenTransactions,
    }

    return { success: true, address, data }
  } catch (error) {
    return {
      success: false,
      address,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Fetch data for multiple addresses with staggered requests
export async function fetchAllAddresses(
  addresses: Array<{ address: string; nickname?: string }>,
  apiKey: string = DEFAULT_API_KEY,
  onProgress?: (completed: number, total: number) => void,
  onAddressComplete?: (result: FetchResult) => void
): Promise<{
  successful: Map<string, AddressData>
  failed: Map<string, { address: string; nickname?: string; error: string }>
}> {
  const successful = new Map<string, AddressData>()
  const failed = new Map<string, { address: string; nickname?: string; error: string }>()

  for (let i = 0; i < addresses.length; i++) {
    const { address, nickname } = addresses[i]

    const result = await fetchAddressData(address, nickname, apiKey)

    if (result.success && result.data) {
      successful.set(address.toLowerCase(), result.data)
    } else {
      failed.set(address.toLowerCase(), {
        address,
        nickname,
        error: result.error || 'Unknown error',
      })
    }

    onAddressComplete?.(result)
    onProgress?.(i + 1, addresses.length)

    // Stagger requests to avoid rate limiting
    if (i < addresses.length - 1) {
      await delay(500)
    }
  }

  return { successful, failed }
}
