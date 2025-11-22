/**
 * Beancount output generation
 */

import type {
  AddressTransactionData,
  EthTransaction,
  TokenTransaction,
  BeancountCommodity,
} from '@/types'
import {
  sanitizeSymbol,
  sanitizeAccountName,
  sanitizeUrls,
  getAccountId,
  normalizeAddress,
} from './sanitize'

/**
 * Format timestamp to Beancount date (YYYY-MM-DD)
 */
export function formatDate(timestamp: string | number): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toISOString().split('T')[0]
}

/**
 * Format Wei value to ETH string
 */
export function weiToEth(wei: string): string {
  const value = BigInt(wei)
  const ethValue = Number(value) / 1e18
  return ethValue.toFixed(18).replace(/\.?0+$/, '') || '0'
}

/**
 * Format token value with decimals
 */
export function formatTokenValue(value: string, decimals: string): string {
  const decimalNum = parseInt(decimals, 10)
  if (decimalNum === 0) return value

  const bigValue = BigInt(value)
  const divisor = BigInt(10 ** decimalNum)
  const intPart = bigValue / divisor
  const fracPart = bigValue % divisor

  if (fracPart === 0n) {
    return intPart.toString()
  }

  const fracStr = fracPart.toString().padStart(decimalNum, '0').replace(/0+$/, '')
  return `${intPart}.${fracStr}`
}

/**
 * Calculate gas cost in ETH
 */
export function calculateGasCost(gasUsed: string, gasPrice: string): string {
  const cost = BigInt(gasUsed) * BigInt(gasPrice)
  return weiToEth(cost.toString())
}

/**
 * Get Beancount account name for an address
 */
export function getAccountName(
  address: string,
  addressNicknames: Map<string, string>,
  prefix: string = 'Assets:Crypto:Ethereum'
): string {
  const normalizedAddress = normalizeAddress(address)
  const nickname = addressNicknames.get(normalizedAddress)
  const suffix = getAccountId(address)

  if (nickname) {
    const sanitizedNickname = sanitizeAccountName(nickname)
    return `${prefix}:${sanitizedNickname}:${suffix}`
  }

  return `${prefix}:${suffix}`
}

/**
 * Get token account name
 */
export function getTokenAccountName(
  address: string,
  tokenSymbol: string,
  addressNicknames: Map<string, string>
): string {
  const sanitizedSymbol = sanitizeSymbol(tokenSymbol)
  const normalizedAddress = normalizeAddress(address)
  const nickname = addressNicknames.get(normalizedAddress)
  const suffix = getAccountId(address)

  if (nickname) {
    const sanitizedNickname = sanitizeAccountName(nickname)
    return `Assets:Crypto:Tokens:${sanitizedSymbol}:${sanitizedNickname}:${suffix}`
  }

  return `Assets:Crypto:Tokens:${sanitizedSymbol}:${suffix}`
}

/**
 * Get external account name
 */
export function getExternalAccountName(address: string): string {
  return `Assets:Crypto:External:${getAccountId(address)}`
}

/**
 * Check if address is in user's address set
 */
export function isUserAddress(address: string, userAddresses: Set<string>): boolean {
  return userAddresses.has(normalizeAddress(address))
}

/**
 * Collect all unique token commodities from transactions
 */
export function collectCommodities(
  addressDataMap: Map<string, AddressTransactionData>
): BeancountCommodity[] {
  const commoditiesMap = new Map<string, BeancountCommodity>()

  for (const data of addressDataMap.values()) {
    for (const tx of data.tokenTransactions) {
      const symbol = sanitizeSymbol(tx.tokenSymbol)

      if (!commoditiesMap.has(symbol)) {
        commoditiesMap.set(symbol, {
          symbol,
          name: sanitizeUrls(tx.tokenName),
          originalSymbol: tx.tokenSymbol !== symbol ? tx.tokenSymbol : undefined,
          contractAddress: tx.contractAddress,
        })
      }
    }
  }

  return Array.from(commoditiesMap.values())
}

/**
 * Generate header section with timestamp and address list
 */
export function generateHeader(
  addressDataMap: Map<string, AddressTransactionData>,
  addressNicknames: Map<string, string>
): string {
  const lines: string[] = []
  const now = new Date().toISOString()

  lines.push('; Ethereum Beancount Export')
  lines.push(`; Generated: ${now}`)
  lines.push(';')
  lines.push('; Addresses:')

  for (const [address, data] of addressDataMap) {
    const nickname = data.nickname || addressNicknames.get(normalizeAddress(address))
    const etherscanUrl = `https://etherscan.io/address/${address}`
    if (nickname) {
      lines.push(`; - ${nickname} (${address})`)
    } else {
      lines.push(`; - ${address}`)
    }
    lines.push(`;   ${etherscanUrl}`)
  }

  lines.push('')
  return lines.join('\n')
}

/**
 * Generate commodity declarations
 */
export function generateCommodityDeclarations(commodities: BeancountCommodity[]): string {
  const lines: string[] = []

  // ETH commodity
  lines.push('1970-01-01 commodity ETH')
  lines.push('  name: "Ethereum"')
  lines.push('')

  // Token commodities
  for (const commodity of commodities) {
    lines.push(`1970-01-01 commodity ${commodity.symbol}`)
    lines.push(`  name: "${commodity.name}"`)
    if (commodity.originalSymbol) {
      lines.push(`  original_symbol: "${commodity.originalSymbol}"`)
    }
    if (commodity.contractAddress) {
      lines.push(`  contract: "${commodity.contractAddress}"`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Generate account declarations
 */
export function generateAccountDeclarations(
  addressDataMap: Map<string, AddressTransactionData>,
  addressNicknames: Map<string, string>,
  userAddresses: Set<string>
): string {
  const lines: string[] = []
  const declaredAccounts = new Set<string>()

  // User ETH accounts
  for (const data of addressDataMap.values()) {
    const accountName = getAccountName(data.address, addressNicknames)
    if (!declaredAccounts.has(accountName)) {
      lines.push(`1970-01-01 open ${accountName} ETH`)
      declaredAccounts.add(accountName)
    }
  }

  // User token accounts
  for (const data of addressDataMap.values()) {
    for (const tx of data.tokenTransactions) {
      const normalizedFrom = normalizeAddress(tx.from)
      const normalizedTo = normalizeAddress(tx.to)

      if (userAddresses.has(normalizedFrom)) {
        const accountName = getTokenAccountName(tx.from, tx.tokenSymbol, addressNicknames)
        if (!declaredAccounts.has(accountName)) {
          const symbol = sanitizeSymbol(tx.tokenSymbol)
          lines.push(`1970-01-01 open ${accountName} ${symbol}`)
          declaredAccounts.add(accountName)
        }
      }

      if (userAddresses.has(normalizedTo)) {
        const accountName = getTokenAccountName(tx.to, tx.tokenSymbol, addressNicknames)
        if (!declaredAccounts.has(accountName)) {
          const symbol = sanitizeSymbol(tx.tokenSymbol)
          lines.push(`1970-01-01 open ${accountName} ${symbol}`)
          declaredAccounts.add(accountName)
        }
      }
    }
  }

  // External accounts
  const externalAddresses = new Set<string>()

  for (const data of addressDataMap.values()) {
    for (const tx of data.transactions) {
      if (!userAddresses.has(normalizeAddress(tx.from))) {
        externalAddresses.add(tx.from)
      }
      if (!userAddresses.has(normalizeAddress(tx.to))) {
        externalAddresses.add(tx.to)
      }
    }

    for (const tx of data.tokenTransactions) {
      if (!userAddresses.has(normalizeAddress(tx.from))) {
        externalAddresses.add(tx.from)
      }
      if (!userAddresses.has(normalizeAddress(tx.to))) {
        externalAddresses.add(tx.to)
      }
    }
  }

  for (const address of externalAddresses) {
    const accountName = getExternalAccountName(address)
    if (!declaredAccounts.has(accountName)) {
      lines.push(`1970-01-01 open ${accountName}`)
      declaredAccounts.add(accountName)
    }
  }

  // Expense accounts
  lines.push('1970-01-01 open Expenses:Crypto:GasFees')
  lines.push('1970-01-01 open Expenses:Crypto:NetworkFees')

  lines.push('')
  return lines.join('\n')
}

interface CombinedTransaction {
  type: 'eth' | 'token'
  timestamp: number
  transaction: EthTransaction | TokenTransaction
  ownerAddress: string
}

/**
 * Generate transaction entries
 */
export function generateTransactionEntries(
  addressDataMap: Map<string, AddressTransactionData>,
  addressNicknames: Map<string, string>,
  userAddresses: Set<string>
): string {
  const lines: string[] = []

  // Combine and sort all transactions by timestamp
  const allTransactions: CombinedTransaction[] = []
  const processedHashes = new Set<string>()

  for (const data of addressDataMap.values()) {
    for (const tx of data.transactions) {
      // Deduplicate by hash + type
      const key = `eth:${tx.hash}`
      if (!processedHashes.has(key)) {
        processedHashes.add(key)
        allTransactions.push({
          type: 'eth',
          timestamp: parseInt(tx.timeStamp, 10),
          transaction: tx,
          ownerAddress: data.address,
        })
      }
    }

    for (const tx of data.tokenTransactions) {
      // Deduplicate by hash + contract + value
      const key = `token:${tx.hash}:${tx.contractAddress}:${tx.value}`
      if (!processedHashes.has(key)) {
        processedHashes.add(key)
        allTransactions.push({
          type: 'token',
          timestamp: parseInt(tx.timeStamp, 10),
          transaction: tx,
          ownerAddress: data.address,
        })
      }
    }
  }

  // Sort by timestamp
  allTransactions.sort((a, b) => a.timestamp - b.timestamp)

  for (const item of allTransactions) {
    if (item.type === 'eth') {
      const entry = generateEthTransactionEntry(
        item.transaction as EthTransaction,
        addressNicknames,
        userAddresses
      )
      lines.push(entry)
    } else {
      const entry = generateTokenTransactionEntry(
        item.transaction as TokenTransaction,
        addressNicknames,
        userAddresses
      )
      lines.push(entry)
    }
  }

  return lines.join('\n')
}

/**
 * Generate single ETH transaction entry
 */
function generateEthTransactionEntry(
  tx: EthTransaction,
  addressNicknames: Map<string, string>,
  userAddresses: Set<string>
): string {
  const lines: string[] = []
  const date = formatDate(tx.timeStamp)
  const value = weiToEth(tx.value)
  const gasCost = calculateGasCost(tx.gasUsed, tx.gasPrice)
  const isFailed = tx.isError === '1'

  const fromIsUser = isUserAddress(tx.from, userAddresses)
  const toIsUser = isUserAddress(tx.to, userAddresses)

  // Transaction header
  const status = isFailed ? '!' : '*'
  const description = isFailed ? 'Failed ETH Transfer' : 'ETH Transfer'
  lines.push(`${date} ${status} "${description}"`)
  lines.push(`  txid: "${tx.hash}"`)

  if (fromIsUser && toIsUser) {
    // Transfer between user's own addresses
    const fromAccount = getAccountName(tx.from, addressNicknames)
    const toAccount = getAccountName(tx.to, addressNicknames)

    if (!isFailed && parseFloat(value) > 0) {
      lines.push(`  ${fromAccount}  -${value} ETH`)
      lines.push(`  ${toAccount}  ${value} ETH`)
    }

    // Gas is paid by sender
    lines.push(`  ${fromAccount}  -${gasCost} ETH`)
    lines.push('  Expenses:Crypto:GasFees')
  } else if (fromIsUser) {
    // Outgoing transaction
    const fromAccount = getAccountName(tx.from, addressNicknames)
    const toAccount = getExternalAccountName(tx.to)

    if (!isFailed && parseFloat(value) > 0) {
      lines.push(`  ${fromAccount}  -${value} ETH`)
      lines.push(`  ${toAccount}`)
    }

    lines.push(`  ${fromAccount}  -${gasCost} ETH`)
    lines.push('  Expenses:Crypto:GasFees')
  } else if (toIsUser) {
    // Incoming transaction
    const fromAccount = getExternalAccountName(tx.from)
    const toAccount = getAccountName(tx.to, addressNicknames)

    if (!isFailed && parseFloat(value) > 0) {
      lines.push(`  ${fromAccount}`)
      lines.push(`  ${toAccount}  ${value} ETH`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

/**
 * Generate single token transaction entry
 */
function generateTokenTransactionEntry(
  tx: TokenTransaction,
  addressNicknames: Map<string, string>,
  userAddresses: Set<string>
): string {
  const lines: string[] = []
  const date = formatDate(tx.timeStamp)
  const value = formatTokenValue(tx.value, tx.tokenDecimal)
  const symbol = sanitizeSymbol(tx.tokenSymbol)
  const tokenName = sanitizeUrls(tx.tokenName)

  const fromIsUser = isUserAddress(tx.from, userAddresses)
  const toIsUser = isUserAddress(tx.to, userAddresses)

  // Transaction header
  lines.push(`${date} * "${tokenName} Transfer"`)
  lines.push(`  txid: "${tx.hash}"`)
  lines.push(`  token: "${tx.contractAddress}"`)

  if (fromIsUser && toIsUser) {
    // Transfer between user's own addresses
    const fromAccount = getTokenAccountName(tx.from, tx.tokenSymbol, addressNicknames)
    const toAccount = getTokenAccountName(tx.to, tx.tokenSymbol, addressNicknames)

    lines.push(`  ${fromAccount}  -${value} ${symbol}`)
    lines.push(`  ${toAccount}  ${value} ${symbol}`)
  } else if (fromIsUser) {
    // Outgoing transaction
    const fromAccount = getTokenAccountName(tx.from, tx.tokenSymbol, addressNicknames)
    const toAccount = getExternalAccountName(tx.to)

    lines.push(`  ${fromAccount}  -${value} ${symbol}`)
    lines.push(`  ${toAccount}`)
  } else if (toIsUser) {
    // Incoming transaction
    const fromAccount = getExternalAccountName(tx.from)
    const toAccount = getTokenAccountName(tx.to, tx.tokenSymbol, addressNicknames)

    lines.push(`  ${fromAccount}`)
    lines.push(`  ${toAccount}  ${value} ${symbol}`)
  }

  lines.push('')
  return lines.join('\n')
}

/**
 * Generate complete Beancount output
 */
export function generateBeancountOutput(
  addressDataMap: Map<string, AddressTransactionData>
): string {
  // Build nickname map and user addresses set
  const addressNicknames = new Map<string, string>()
  const userAddresses = new Set<string>()

  for (const data of addressDataMap.values()) {
    const normalized = normalizeAddress(data.address)
    userAddresses.add(normalized)
    if (data.nickname) {
      addressNicknames.set(normalized, data.nickname)
    }
  }

  // Collect commodities
  const commodities = collectCommodities(addressDataMap)

  // Generate sections
  const header = generateHeader(addressDataMap, addressNicknames)
  const commodityDeclarations = generateCommodityDeclarations(commodities)
  const accountDeclarations = generateAccountDeclarations(
    addressDataMap,
    addressNicknames,
    userAddresses
  )
  const transactionEntries = generateTransactionEntries(
    addressDataMap,
    addressNicknames,
    userAddresses
  )

  return [header, commodityDeclarations, accountDeclarations, transactionEntries].join('\n')
}
