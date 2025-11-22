// Ethereum transaction from Etherscan API
export interface EthTransaction {
  blockNumber: string
  timeStamp: string
  hash: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  gasUsed: string
  isError: string
  txreceipt_status: string
  input: string
  contractAddress: string
  cumulativeGasUsed: string
  confirmations: string
  methodId: string
  functionName: string
}

// Token transfer from Etherscan API
export interface TokenTransaction {
  blockNumber: string
  timeStamp: string
  hash: string
  from: string
  to: string
  value: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  contractAddress: string
  gas: string
  gasPrice: string
  gasUsed: string
}

// Etherscan API response
export interface EtherscanResponse<T> {
  status: string
  message: string
  result: T[] | string
}

// Address with transactions
export interface AddressData {
  address: string
  nickname?: string
  transactions: EthTransaction[]
  tokenTransactions: TokenTransaction[]
}

// Failed address with error
export interface FailedAddress {
  address: string
  nickname?: string
  error: string
}

// Status message types
export type StatusType = 'error' | 'success' | 'info' | 'warning'

export interface StatusMessage {
  type: StatusType
  message: string
}

// Statistics
export interface TransactionStats {
  totalTransactions: number
  ethTransfers: number
  tokenTransfers: number
  failedTransactions: number
}

// App state
export interface AppState {
  addresses: string
  apiKey: string
  output: string
  isLoading: boolean
  status: StatusMessage | null
  addressData: Map<string, AddressData>
  failedAddresses: Map<string, FailedAddress>
  nicknames: Map<string, string>
  stats: TransactionStats
}

// Parsed address result
export interface ParsedAddress {
  address: string
  nickname?: string
}

// Fetch result for single address
export interface FetchResult {
  success: boolean
  address: string
  data?: AddressData
  error?: string
}
