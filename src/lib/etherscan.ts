/**
 * Etherscan API client for fetching Ethereum transactions
 */

import {
  API_CONFIG,
  type EthTransaction,
  type TokenTransaction,
  type EtherscanResponse,
  EthTransactionSchema,
  TokenTransactionSchema,
} from '@/types'
import { z } from 'zod'

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Build Etherscan API URL for normal transactions
 */
export function buildEthTransactionsUrl(address: string, apiKey: string): string {
  const params = new URLSearchParams({
    chainid: API_CONFIG.CHAIN_ID,
    module: 'account',
    action: 'txlist',
    address,
    startblock: '0',
    endblock: '99999999',
    sort: 'asc',
    apikey: apiKey || API_CONFIG.DEFAULT_API_KEY,
  })
  return `${API_CONFIG.BASE_URL}?${params.toString()}`
}

/**
 * Build Etherscan API URL for token transactions
 */
export function buildTokenTransactionsUrl(address: string, apiKey: string): string {
  const params = new URLSearchParams({
    chainid: API_CONFIG.CHAIN_ID,
    module: 'account',
    action: 'tokentx',
    address,
    startblock: '0',
    endblock: '99999999',
    sort: 'asc',
    apikey: apiKey || API_CONFIG.DEFAULT_API_KEY,
  })
  return `${API_CONFIG.BASE_URL}?${params.toString()}`
}

/**
 * Fetch with retry logic and exponential backoff
 */
async function fetchWithRetry(
  url: string,
  retries: number = API_CONFIG.MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < retries) {
        const backoffMs = API_CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt)
        await delay(backoffMs)
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries')
}

/**
 * Parse Etherscan API response
 */
function parseEtherscanResponse(data: unknown): EtherscanResponse {
  const parsed = data as EtherscanResponse

  if (parsed.status !== '1') {
    // Check if it's a "no transactions found" case
    if (parsed.message === 'No transactions found' || parsed.result === 'No transactions found') {
      return { status: '1', message: 'OK', result: [] }
    }
    throw new Error(parsed.message || 'API request failed')
  }

  return parsed
}

/**
 * Fetch ETH transactions for an address
 */
export async function fetchEthTransactions(
  address: string,
  apiKey: string
): Promise<EthTransaction[]> {
  const url = buildEthTransactionsUrl(address, apiKey)
  const response = await fetchWithRetry(url)
  const data = await response.json()

  const parsed = parseEtherscanResponse(data)

  if (!Array.isArray(parsed.result)) {
    return []
  }

  // Validate and parse transactions
  const transactions: EthTransaction[] = []
  for (const tx of parsed.result) {
    try {
      const validated = EthTransactionSchema.parse(tx)
      transactions.push(validated)
    } catch {
      // Skip invalid transactions
      console.warn('Skipping invalid ETH transaction:', tx)
    }
  }

  return transactions
}

/**
 * Fetch token transactions for an address
 */
export async function fetchTokenTransactions(
  address: string,
  apiKey: string
): Promise<TokenTransaction[]> {
  const url = buildTokenTransactionsUrl(address, apiKey)
  const response = await fetchWithRetry(url)
  const data = await response.json()

  const parsed = parseEtherscanResponse(data)

  if (!Array.isArray(parsed.result)) {
    return []
  }

  // Validate and parse transactions
  const transactions: TokenTransaction[] = []
  for (const tx of parsed.result) {
    try {
      const validated = TokenTransactionSchema.parse(tx)
      transactions.push(validated)
    } catch {
      // Skip invalid transactions
      console.warn('Skipping invalid token transaction:', tx)
    }
  }

  return transactions
}

/**
 * Fetch all transactions (ETH and tokens) for an address
 */
export async function fetchAllTransactions(
  address: string,
  apiKey: string
): Promise<{ ethTransactions: EthTransaction[]; tokenTransactions: TokenTransaction[] }> {
  // Fetch ETH transactions first
  const ethTransactions = await fetchEthTransactions(address, apiKey)

  // Small delay between requests to avoid rate limiting
  await delay(API_CONFIG.TOKEN_REQUEST_DELAY_MS)

  // Fetch token transactions
  const tokenTransactions = await fetchTokenTransactions(address, apiKey)

  return { ethTransactions, tokenTransactions }
}
