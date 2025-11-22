import { z } from 'zod'

// Ethereum address validation schema
export const EthereumAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, {
  message: 'Invalid Ethereum address format',
})

export type EthereumAddress = z.infer<typeof EthereumAddressSchema>

// Etherscan API response schemas
export const EthTransactionSchema = z.object({
  hash: z.string(),
  blockNumber: z.string(),
  timeStamp: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  gasUsed: z.string(),
  gasPrice: z.string(),
  isError: z.string().default('0'),
  nonce: z.string().optional(),
  blockHash: z.string().optional(),
  transactionIndex: z.string().optional(),
  gas: z.string().optional(),
  input: z.string().optional(),
  contractAddress: z.string().optional(),
  cumulativeGasUsed: z.string().optional(),
  confirmations: z.string().optional(),
  methodId: z.string().optional(),
  functionName: z.string().optional(),
})

export type EthTransaction = z.infer<typeof EthTransactionSchema>

export const TokenTransactionSchema = z.object({
  hash: z.string(),
  blockNumber: z.string(),
  timeStamp: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  contractAddress: z.string(),
  tokenName: z.string(),
  tokenSymbol: z.string(),
  tokenDecimal: z.string(),
  nonce: z.string().optional(),
  blockHash: z.string().optional(),
  transactionIndex: z.string().optional(),
  gas: z.string().optional(),
  gasPrice: z.string().optional(),
  gasUsed: z.string().optional(),
  cumulativeGasUsed: z.string().optional(),
  input: z.string().optional(),
  confirmations: z.string().optional(),
})

export type TokenTransaction = z.infer<typeof TokenTransactionSchema>

export const EtherscanResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  result: z.union([z.array(z.unknown()), z.string()]),
})

export type EtherscanResponse = z.infer<typeof EtherscanResponseSchema>

// Application data types
export interface ParsedAddress {
  address: EthereumAddress
  nickname?: string
}

export interface AddressTransactionData {
  address: EthereumAddress
  nickname?: string
  transactions: EthTransaction[]
  tokenTransactions: TokenTransaction[]
}

export interface FailedAddress {
  address: EthereumAddress
  nickname?: string
  error: string
}

export interface FetchProgress {
  current: number
  total: number
  currentAddress?: string
}

export interface TransactionStats {
  totalAddresses: number
  totalEthTransactions: number
  totalTokenTransactions: number
  failedAddresses: number
}

// Beancount output types
export interface BeancountCommodity {
  symbol: string
  name: string
  originalSymbol?: string
  contractAddress?: string
}

export interface BeancountAccount {
  name: string
  type: 'user' | 'external'
}

export type StatusType = 'error' | 'success' | 'info'

export interface StatusMessage {
  message: string
  type: StatusType
}

// Form state
export interface AppState {
  addresses: string
  apiKey: string
  output: string
  isLoading: boolean
  status: StatusMessage | null
  stats: TransactionStats | null
  failedAddresses: FailedAddress[]
  addressData: Map<string, AddressTransactionData>
  progress: FetchProgress | null
}

// Storage keys
export const STORAGE_KEYS = {
  ADDRESSES: 'eth-beancount-addresses',
  API_KEY: 'eth-beancount-apikey',
} as const

// API configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.etherscan.io/v2/api',
  CHAIN_ID: '1',
  DEFAULT_API_KEY: 'YourEtherscanAPIKeyToken',
  REQUEST_DELAY_MS: 500,
  TOKEN_REQUEST_DELAY_MS: 300,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
} as const
